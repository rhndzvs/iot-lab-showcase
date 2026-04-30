import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, supabaseConfigurationError } from '../../supabaseClient'

const ARDUINO_SKETCH_PLACEHOLDER = '// Arduino sketch coming soon. Check back later!'
const arduinoSketchModules = import.meta.glob(
  '../../../../labs/lab-01/arduino/server_room_simulation/server_room_simulation.ino',
  {
    query: '?raw',
    import: 'default',
  },
)

const DEFAULT_TEMPERATURE_THRESHOLD = 31
const MAX_LOG_ENTRIES = 10
const SENSOR_LOG_COLUMNS = 'id, temperature, humidity, status, threshold, created_at'
const SKETCH_MODAL_ANIMATION_DURATION_MS = 230

async function loadArduinoSketchCode() {
  const moduleLoaders = Object.values(arduinoSketchModules)

  if (!moduleLoaders.length) {
    return ARDUINO_SKETCH_PLACEHOLDER
  }

  try {
    const loadedCode = await moduleLoaders[0]()
    const sketchCode = typeof loadedCode === 'string' ? loadedCode : ''

    return sketchCode.trim() ? sketchCode : ARDUINO_SKETCH_PLACEHOLDER
  } catch {
    return ARDUINO_SKETCH_PLACEHOLDER
  }
}

function formatTimestamp(isoString) {
  if (!isoString) {
    return '--'
  }

  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) {
    return '--'
  }

  return date.toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    month: 'short',
    day: '2-digit',
  })
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function normalizeStatus(status) {
  if (typeof status !== 'string') {
    return 'normal'
  }

  return status.trim().toLowerCase() === 'alert' ? 'alert' : 'normal'
}

function formatStatusLabel(status) {
  return normalizeStatus(status) === 'alert' ? 'Alert' : 'Normal'
}

function mapSensorRow(row) {
  if (!row) {
    return null
  }

  const temperature = Number(row.temperature)
  const humidity = Number(row.humidity)
  const threshold = Number(row.threshold)

  return {
    id: row.id ?? row.created_at ?? crypto.randomUUID(),
    temperature: Number.isFinite(temperature) ? temperature : 0,
    humidity: Number.isFinite(humidity) ? humidity : 0,
    threshold: Number.isFinite(threshold) ? threshold : DEFAULT_TEMPERATURE_THRESHOLD,
    timestamp: row.created_at ?? new Date().toISOString(),
    status: normalizeStatus(row.status),
  }
}

function ServerRoomSimulationPage({ onNavigate }) {
  const [logs, setLogs] = useState([])
  const [currentReading, setCurrentReading] = useState(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(supabase))
  const [showLoadedContent, setShowLoadedContent] = useState(() => !supabase)
  const [loadingError, setLoadingError] = useState(() => (supabase ? '' : supabaseConfigurationError))
  const [animatedLogId, setAnimatedLogId] = useState(null)
  const [isSketchViewerOpen, setIsSketchViewerOpen] = useState(false)
  const [isSketchViewerClosing, setIsSketchViewerClosing] = useState(false)
  const [isSketchLoading, setIsSketchLoading] = useState(false)
  const [arduinoSketchCode, setArduinoSketchCode] = useState(ARDUINO_SKETCH_PLACEHOLDER)
  const [isSketchCopied, setIsSketchCopied] = useState(false)
  const [isSketchCopyToastVisible, setIsSketchCopyToastVisible] = useState(false)
  const [isSketchCopyToastLeaving, setIsSketchCopyToastLeaving] = useState(false)
  const newRowAnimationTimeoutRef = useRef(null)
  const sketchViewerCloseTimeoutRef = useRef(null)
  const sketchCopyTimeoutRef = useRef(null)
  const sketchCopyToastFadeTimeoutRef = useRef(null)
  const sketchCopyToastCloseTimeoutRef = useRef(null)
  const sketchCodeRef = useRef(null)

  useEffect(() => {
    return () => {
      if (newRowAnimationTimeoutRef.current) {
        window.clearTimeout(newRowAnimationTimeoutRef.current)
      }

      if (sketchViewerCloseTimeoutRef.current) {
        window.clearTimeout(sketchViewerCloseTimeoutRef.current)
      }

      if (sketchCopyTimeoutRef.current) {
        window.clearTimeout(sketchCopyTimeoutRef.current)
      }

      if (sketchCopyToastFadeTimeoutRef.current) {
        window.clearTimeout(sketchCopyToastFadeTimeoutRef.current)
      }

      if (sketchCopyToastCloseTimeoutRef.current) {
        window.clearTimeout(sketchCopyToastCloseTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let isMounted = true

    const fetchInitialData = async () => {
      const [latestResult, logsResult] = await Promise.all([
        supabase
          .from('lab1_sensor_logs')
          .select(SENSOR_LOG_COLUMNS)
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('lab1_sensor_logs')
          .select(SENSOR_LOG_COLUMNS)
          .order('created_at', { ascending: false })
          .limit(MAX_LOG_ENTRIES),
      ])

      if (!isMounted) {
        return
      }

      if (latestResult.error || logsResult.error) {
        setLoadingError(latestResult.error?.message || logsResult.error?.message || 'Failed to load sensor logs.')
        setIsLoading(false)
        return
      }

      const latestReading = mapSensorRow(latestResult.data?.[0] ?? null)
      const recentLogs = (logsResult.data ?? [])
        .map(mapSensorRow)
        .filter(Boolean)

      setCurrentReading(latestReading)
      setLogs(recentLogs)
      setIsLoading(false)
    }

    fetchInitialData()

    const channel = supabase
      .channel('lab1_sensor_logs_live_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lab1_sensor_logs',
        },
        (payload) => {
          const nextReading = mapSensorRow(payload.new)

          if (!nextReading) {
            return
          }

          setCurrentReading(nextReading)
          setLogs((previousLogs) => [nextReading, ...previousLogs].slice(0, MAX_LOG_ENTRIES))
          setAnimatedLogId(nextReading.id)

          if (newRowAnimationTimeoutRef.current) {
            window.clearTimeout(newRowAnimationTimeoutRef.current)
          }

          newRowAnimationTimeoutRef.current = window.setTimeout(() => {
            setAnimatedLogId(null)
            newRowAnimationTimeoutRef.current = null
          }, 1000)

          setLoadingError('')
        },
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const frame = window.requestAnimationFrame(() => {
        setShowLoadedContent(true)
      })

      return () => window.cancelAnimationFrame(frame)
    }

    return undefined
  }, [isLoading])

  useEffect(() => {
    if (!isSketchViewerOpen) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsSketchViewerOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isSketchViewerOpen])

  useEffect(() => {
    if (!isSketchViewerOpen) {
      return
    }

    let isMounted = true
    setIsSketchLoading(true)

    loadArduinoSketchCode().then((code) => {
      if (!isMounted) {
        return
      }

      setArduinoSketchCode(code)
      setIsSketchLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [isSketchViewerOpen])

  useEffect(() => {
    if (!isSketchViewerOpen || isSketchLoading || !sketchCodeRef.current) {
      return
    }

    if (window.Prism?.highlightElement) {
      window.Prism.highlightElement(sketchCodeRef.current)
    }
  }, [isSketchViewerOpen, isSketchLoading, arduinoSketchCode])

  const thresholdProgress = useMemo(() => {
    if (!currentReading) {
      return 0
    }

    return clamp((currentReading.temperature / currentReading.threshold) * 100, 0, 100)
  }, [currentReading])

  const isAlert = normalizeStatus(currentReading?.status) === 'alert'
  const activeThreshold = currentReading?.threshold ?? DEFAULT_TEMPERATURE_THRESHOLD
  const thresholdExceeded = (currentReading?.temperature ?? 0) > activeThreshold
  const deltaToThreshold = currentReading
    ? (activeThreshold - currentReading.temperature).toFixed(1)
    : null

  const openSketchViewer = () => {
    if (sketchViewerCloseTimeoutRef.current) {
      window.clearTimeout(sketchViewerCloseTimeoutRef.current)
      sketchViewerCloseTimeoutRef.current = null
    }

    setIsSketchCopied(false)
    setIsSketchViewerClosing(false)
    setIsSketchViewerOpen(true)
  }

  const closeSketchViewer = () => {
    if (!isSketchViewerOpen || isSketchViewerClosing) {
      return
    }

    setIsSketchViewerClosing(true)

    if (sketchViewerCloseTimeoutRef.current) {
      window.clearTimeout(sketchViewerCloseTimeoutRef.current)
    }

    sketchViewerCloseTimeoutRef.current = window.setTimeout(() => {
      setIsSketchViewerOpen(false)
      setIsSketchViewerClosing(false)
      sketchViewerCloseTimeoutRef.current = null
    }, SKETCH_MODAL_ANIMATION_DURATION_MS)
  }

  const handleModalBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeSketchViewer()
    }
  }

  const handleCopySketchCode = async () => {
    try {
      await navigator.clipboard.writeText(arduinoSketchCode)
      setIsSketchCopied(true)
      setIsSketchCopyToastVisible(true)
      setIsSketchCopyToastLeaving(false)

      if (sketchCopyTimeoutRef.current) {
        window.clearTimeout(sketchCopyTimeoutRef.current)
      }

      if (sketchCopyToastFadeTimeoutRef.current) {
        window.clearTimeout(sketchCopyToastFadeTimeoutRef.current)
      }

      if (sketchCopyToastCloseTimeoutRef.current) {
        window.clearTimeout(sketchCopyToastCloseTimeoutRef.current)
      }

      sketchCopyTimeoutRef.current = window.setTimeout(() => {
        setIsSketchCopied(false)
        sketchCopyTimeoutRef.current = null
      }, 1800)

      sketchCopyToastFadeTimeoutRef.current = window.setTimeout(() => {
        setIsSketchCopyToastLeaving(true)
        sketchCopyToastFadeTimeoutRef.current = null
      }, 2200)

      sketchCopyToastCloseTimeoutRef.current = window.setTimeout(() => {
        setIsSketchCopyToastVisible(false)
        setIsSketchCopyToastLeaving(false)
        sketchCopyToastCloseTimeoutRef.current = null
      }, 2520)
    } catch {
      setIsSketchCopied(false)
      setIsSketchCopyToastVisible(false)
      setIsSketchCopyToastLeaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="theme-toggle theme-toggle--simulation code-viewer-toggle"
        onClick={openSketchViewer}
        aria-label="Open Arduino sketch code viewer"
        title="Open Arduino sketch code viewer"
      >
        <i className="bx bx-code-alt theme-toggle__icon" aria-hidden="true" />
      </button>
      {isSketchViewerOpen && (
        <div
          className={`code-viewer-modal ${isSketchViewerClosing ? 'code-viewer-modal--closing' : 'code-viewer-modal--opening'}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="code-viewer-title"
          onClick={handleModalBackdropClick}
        >
          <div className="code-viewer-modal__panel">
            <header className="code-viewer-modal__header">
              <h2 id="code-viewer-title" className="code-viewer-modal__title">
                Arduino Sketch — Server Room Simulation
              </h2>
              <button
                type="button"
                className="code-viewer-modal__close"
                onClick={closeSketchViewer}
                aria-label="Close code viewer"
                title="Close"
              >
                <i className="bx bx-x" aria-hidden="true" />
              </button>
            </header>
            <div className="code-viewer-modal__body">
              <div className="code-viewer-modal__code-shell">
                <button
                  type="button"
                  className="code-viewer-modal__copy"
                  onClick={handleCopySketchCode}
                  aria-label={isSketchCopied ? 'Code copied' : 'Copy code'}
                  title={isSketchCopied ? 'Copied' : 'Copy code'}
                >
                  <i className="bx bx-copy" aria-hidden="true" />
                </button>
                <pre className="code-viewer-modal__pre">
                  <code ref={sketchCodeRef} className="language-cpp">
                    {isSketchLoading
                      ? '// Loading Arduino sketch...'
                      : arduinoSketchCode}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
      {isSketchCopyToastVisible && (
        <div
          className={`copy-toast ${isSketchCopyToastLeaving ? 'copy-toast--leaving' : 'copy-toast--visible'}`}
          role="status"
          aria-live="polite"
        >
          <i className="bx bx-check-circle copy-toast__icon" aria-hidden="true" />
          <span>Code copied to clipboard!</span>
        </div>
      )}
      <main className="simulation-page">
        <nav className="simulation-navbar" aria-label="Server room simulation header">
          <div className="simulation-navbar__left">
            <Link
              className="simulation-back-link"
              to="/"
              onClick={(event) => onNavigate(event, '/')}
              aria-label="Back to IoT Lab Showcase"
            >
              <i className="bx bx-arrow-left" aria-hidden="true" />
              <span>IoT Lab Showcase</span>
            </Link>
          </div>
          <h1 id="server-room-title" className="simulation-navbar__title">Server Room Simulation</h1>
          <div className="simulation-navbar__right">
            <div className="simulation-live" aria-live="polite">
              <span className="simulation-live__dot" aria-hidden="true" />
              <span className="simulation-live__label">Live Updates</span>
            </div>
          </div>
        </nav>

        <section className="simulation-shell" aria-labelledby="server-room-title">
          <article
            className={`system-status ${isAlert ? 'system-status--alert' : 'system-status--normal'}`}
            aria-live="polite"
          >
            <div className="system-status__icon" aria-hidden="true">
              <i className={`bx ${isAlert ? 'bx-bell' : 'bx-check-circle'}`} />
            </div>
            <div className="system-status__content">
              <p className="system-status__label">System Status</p>
              <p className="system-status__message">
                {isAlert
                  ? 'ALERT - Temperature Threshold Exceeded'
                  : 'All Systems Normal'}
              </p>
            </div>
          </article>

          <section className="sensor-grid" aria-label="Live sensor readings">
            {isLoading ? (
              <>
                <article className="sensor-card sensor-card--skeleton" aria-hidden="true">
                  <div className="sensor-card__header">
                    <span className="skeleton-block skeleton-block--circle" />
                    <span className="skeleton-block skeleton-block--heading" />
                  </div>
                  <p className="sensor-card__value">
                    <span className="skeleton-block skeleton-block--value" />
                  </p>
                  <p className="sensor-card__meta">
                    <span className="skeleton-block skeleton-block--meta" />
                  </p>
                </article>

                <article className="sensor-card sensor-card--skeleton" aria-hidden="true">
                  <div className="sensor-card__header">
                    <span className="skeleton-block skeleton-block--circle" />
                    <span className="skeleton-block skeleton-block--heading" />
                  </div>
                  <p className="sensor-card__value">
                    <span className="skeleton-block skeleton-block--value" />
                  </p>
                  <p className="sensor-card__meta">
                    <span className="skeleton-block skeleton-block--meta" />
                  </p>
                </article>
              </>
            ) : (
              <>
                <article className={`sensor-card content-fade ${showLoadedContent ? 'content-fade--visible' : ''}`}>
                  <div className="sensor-card__header">
                    <span className="sensor-card__icon sensor-card__icon--temperature" aria-hidden="true">
                      <i className="bx bx-thermometer" />
                    </span>
                    <h2>Temperature</h2>
                  </div>
                  <p className="sensor-card__value">
                    {currentReading ? `${currentReading.temperature.toFixed(1)}°C` : '--'}
                  </p>
                  <p className="sensor-card__meta">Last updated: {formatTimestamp(currentReading?.timestamp)}</p>
                </article>

                <article className={`sensor-card content-fade ${showLoadedContent ? 'content-fade--visible' : ''}`}>
                  <div className="sensor-card__header">
                    <span className="sensor-card__icon sensor-card__icon--humidity" aria-hidden="true">
                      <i className="bx bx-water-drop" />
                    </span>
                    <h2>Humidity</h2>
                  </div>
                  <p className="sensor-card__value">{currentReading ? `${Math.round(currentReading.humidity)}%` : '--'}</p>
                  <p className="sensor-card__meta">Last updated: {formatTimestamp(currentReading?.timestamp)}</p>
                </article>
              </>
            )}
          </section>

          <section className="threshold-panel" aria-label="Temperature threshold indicator">
            {isLoading ? (
              <div className="threshold-panel__skeleton" aria-hidden="true">
                <div className="threshold-panel__row">
                  <span className="skeleton-block skeleton-block--heading" />
                  <span className="skeleton-block skeleton-block--threshold" />
                </div>
                <p className="threshold-panel__hint">
                  <span className="skeleton-block skeleton-block--hint" />
                </p>
                <div className="threshold-meter threshold-meter--skeleton">
                  <span className="skeleton-block skeleton-block--meter" />
                </div>
              </div>
            ) : (
              <div className={`content-fade ${showLoadedContent ? 'content-fade--visible' : ''}`}>
                <div className="threshold-panel__row">
                  <h2>Threshold Indicator</h2>
                  <p>Threshold: {activeThreshold.toFixed(1)}&deg;C</p>
                </div>
                <p className="threshold-panel__hint">
                  {!currentReading
                    ? 'Awaiting live sensor data...'
                    : thresholdExceeded
                      ? `${Math.abs(Number(deltaToThreshold)).toFixed(1)}°C above threshold`
                      : `${deltaToThreshold}°C below threshold`}
                </p>
                <div className="threshold-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(thresholdProgress)}>
                  <span
                    className={`threshold-meter__fill ${thresholdExceeded ? 'threshold-meter__fill--alert' : ''}`}
                    style={{ width: `${thresholdProgress}%` }}
                  />
                </div>
              </div>
            )}
          </section>

          {loadingError && (
            <p className="threshold-panel__hint" role="status" aria-live="polite">
              {loadingError}
            </p>
          )}

          {isLoading && (
            <p className="threshold-panel__hint" role="status" aria-live="polite">
              Loading live sensor data...
            </p>
          )}

          <section className="logs-panel" aria-labelledby="logs-heading">
            <div className="logs-panel__header">
              <h2 id="logs-heading">Recent Logs</h2>
            </div>
            <div className="logs-table-wrap">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Timestamp</th>
                    <th scope="col">Temperature</th>
                    <th scope="col">Humidity</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading &&
                    Array.from({ length: 6 }).map((_, index) => (
                      <tr key={`logs-skeleton-${index}`} className="logs-row--skeleton" aria-hidden="true">
                        <td><span className="skeleton-block skeleton-block--cell-id" /></td>
                        <td><span className="skeleton-block skeleton-block--cell-time" /></td>
                        <td><span className="skeleton-block skeleton-block--cell-value" /></td>
                        <td><span className="skeleton-block skeleton-block--cell-value" /></td>
                        <td><span className="skeleton-block skeleton-block--cell-pill" /></td>
                      </tr>
                    ))}
                  {!isLoading &&
                    logs.map((entry, index) => {
                      const rowIsAlert = normalizeStatus(entry.status) === 'alert'
                      const isNewestRow = index === 0
                      const isAnimatedRow = entry.id === animatedLogId
                      const rowClassName = [
                        'content-fade',
                        showLoadedContent ? 'content-fade--visible' : '',
                        isAnimatedRow ? 'logs-row--new' : '',
                      ].filter(Boolean).join(' ')

                      return (
                        <tr key={entry.id} className={rowClassName}>
                          <td>
                            <span className="logs-table__id-cell">
                              <span>{entry.id}</span>
                              {isNewestRow && (
                                <span key={`new-indicator-${entry.id}`} className="logs-table__new-badge">New</span>
                              )}
                            </span>
                          </td>
                          <td>{formatTimestamp(entry.timestamp)}</td>
                          <td>{entry.temperature.toFixed(1)}&deg;C</td>
                          <td>{Math.round(entry.humidity)}%</td>
                          <td>
                            <span className={`status-pill ${rowIsAlert ? 'status-pill--alert' : 'status-pill--normal'}`}>
                              {rowIsAlert && <i className="bx bx-bell" aria-hidden="true" />}
                              {formatStatusLabel(entry.status)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  {!logs.length && !isLoading && (
                    <tr>
                      <td colSpan={5}>No sensor logs available yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>
    </>
  )
}

export default ServerRoomSimulationPage
