import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

const THEME_STORAGE_KEY = 'iot-lab-theme'

const projects = [
  {
    id: 'featured-lab',
    title: 'Server Room Simulation',
    description:
      'A simulated server room monitor using a DHT11 sensor, buzzer, and red LED. When temperature exceeds the threshold, the buzzer sounds, the LED lights up, and a real-time warning is sent to the UI.',
    imageLabel: 'Featured IoT lab preview',
    href: '/server-room-simulation',
    isLocked: false,
  },
  {
    id: 'data-logger',
    title: 'Sensor Data Logger',
    description:
      'Coming soon: a robust edge-to-cloud pipeline for collecting and replaying multi-room sensor histories.',
    imageLabel: 'Coming soon project placeholder',
    isLocked: true,
  },
  {
    id: 'analytics-suite',
    title: 'IoT Analytics Suite',
    description:
      'Coming soon: analytics workflows for anomaly detection, trend comparison, and predictive maintenance.',
    imageLabel: 'Coming soon analytics project placeholder',
    isLocked: true,
  },
]

function LockIcon() {
  return (
    <svg
      className="project-card__lock-icon"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Locked project"
    >
      <path
        d="M17 9h-1V7a4 4 0 10-8 0v2H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2zm-7-2a2 2 0 114 0v2h-4V7zm3 8.73V17a1 1 0 11-2 0v-1.27a2 2 0 112 0z"
        fill="currentColor"
      />
    </svg>
  )
}

const TEMPERATURE_THRESHOLD = 31
const MAX_LOG_ENTRIES = 10

function formatTimestamp(isoString) {
  return new Date(isoString).toLocaleString([], {
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

function createReading(id, temperature, humidity, timestamp = new Date().toISOString()) {
  return {
    id,
    temperature,
    humidity,
    timestamp,
    status: temperature > TEMPERATURE_THRESHOLD ? 'Alert' : 'Normal',
  }
}

function createInitialLogs() {
  const now = Date.now()
  const seededReadings = []
  let temperature = 28.4
  let humidity = 56

  for (let index = 0; index < MAX_LOG_ENTRIES; index += 1) {
    temperature = clamp(temperature + (Math.random() * 1.6 - 0.6), 24, 36)
    humidity = clamp(humidity + (Math.random() * 6 - 3), 30, 85)

    const timestamp = new Date(now - (MAX_LOG_ENTRIES - index - 1) * 30_000).toISOString()
    seededReadings.push(createReading(index + 1, Number(temperature.toFixed(1)), Math.round(humidity), timestamp))
  }

  return seededReadings.reverse()
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'light' ? 'Light mode active' : 'Dark mode active'}
      aria-pressed={theme === 'dark'}
      title={theme === 'light' ? 'Light mode active' : 'Dark mode active'}
    >
      <i
        className={`bx theme-toggle__icon ${theme === 'light' ? 'bx-sun' : 'bx-moon'} theme-toggle__icon--${theme}`}
        aria-hidden="true"
      />
    </button>
  )
}

function ShowcasePage() {
  return (
    <main className="portfolio">
      <section className="portfolio-section" aria-labelledby="portfolio-heading">
        <header className="portfolio-section__header">
          <p className="portfolio-section__eyebrow">Portfolio</p>
          <h1 id="portfolio-heading">IoT Lab Showcase</h1>
          <p className="portfolio-section__description">
            A focused collection of IoT projects spanning home automation,
            sensor data logging, and analytics-driven insights.
          </p>
        </header>

        <div className="project-grid">
          {projects.map((project) => {
            const cardClassName = `project-card${project.isLocked ? ' project-card--locked' : ''}`

            if (project.isLocked) {
              return (
                <article
                  className={cardClassName}
                  key={project.id}
                  aria-disabled="true"
                >
                  <div className="project-card__image" role="img" aria-label={project.imageLabel}>
                    <span className="project-card__badge">
                      <LockIcon />
                      Coming Soon
                    </span>
                  </div>
                  <div className="project-card__body" aria-label="Project details pending">
                    <div className="project-card__placeholder" aria-hidden="true">
                      <span className="project-card__placeholder-bar project-card__placeholder-bar--title" />
                      <div className="project-card__placeholder-lines">
                        <span className="project-card__placeholder-bar project-card__placeholder-bar--line-1" />
                        <span className="project-card__placeholder-bar project-card__placeholder-bar--line-2" />
                        <span className="project-card__placeholder-bar project-card__placeholder-bar--line-3" />
                      </div>
                    </div>
                  </div>
                </article>
              )
            }

            return (
              <article className={cardClassName} key={project.id}>
                <Link className="project-card__link" to={project.href}>
                  <div className="project-card__image" role="img" aria-label={project.imageLabel}>
                    <span className="project-card__badge project-card__badge--live">
                      Featured Lab
                    </span>
                  </div>
                  <div className="project-card__body">
                    <h2>{project.title}</h2>
                    <p>{project.description}</p>
                  </div>
                </Link>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function ServerRoomSimulationPage() {
  const [logs, setLogs] = useState(() => createInitialLogs())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLogs((previousLogs) => {
        const current = previousLogs[0]
        const nextId = (current?.id ?? 0) + 1
        const nextTemperature = clamp(current.temperature + (Math.random() * 2.2 - 0.8), 24, 36)
        const nextHumidity = clamp(current.humidity + (Math.random() * 7 - 3.5), 30, 85)

        const nextReading = createReading(
          nextId,
          Number(nextTemperature.toFixed(1)),
          Math.round(nextHumidity),
        )

        return [nextReading, ...previousLogs].slice(0, MAX_LOG_ENTRIES)
      })
    }, 3500)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const currentReading = logs[0]

  const thresholdProgress = useMemo(() => {
    if (!currentReading) {
      return 0
    }

    return clamp((currentReading.temperature / TEMPERATURE_THRESHOLD) * 100, 0, 100)
  }, [currentReading])

  const isAlert = currentReading.temperature > TEMPERATURE_THRESHOLD
  const deltaToThreshold = (TEMPERATURE_THRESHOLD - currentReading.temperature).toFixed(1)

  return (
    <main className="simulation-page">
      <section className="simulation-shell" aria-labelledby="server-room-title">
        <nav className="simulation-navbar" aria-label="Server room simulation header">
          <h1 id="server-room-title">Server Room Simulation</h1>
          <div className="simulation-live" aria-live="polite">
            <span className="simulation-live__dot" aria-hidden="true" />
            <span className="simulation-live__label">Live Updates</span>
          </div>
        </nav>

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
                ? 'ALERT \u2014 Temperature Threshold Exceeded'
                : 'All Systems Normal'}
            </p>
          </div>
        </article>

        <section className="sensor-grid" aria-label="Live sensor readings">
          <article className="sensor-card">
            <div className="sensor-card__header">
              <span className="sensor-card__icon" aria-hidden="true">
                <i className="bx bx-thermometer" />
              </span>
              <h2>Temperature</h2>
            </div>
            <p className="sensor-card__value">{currentReading.temperature.toFixed(1)}&deg;C</p>
            <p className="sensor-card__meta">Last updated: {formatTimestamp(currentReading.timestamp)}</p>
          </article>

          <article className="sensor-card">
            <div className="sensor-card__header">
              <span className="sensor-card__icon" aria-hidden="true">
                <i className="bx bx-droplet" />
              </span>
              <h2>Humidity</h2>
            </div>
            <p className="sensor-card__value">{currentReading.humidity}%</p>
            <p className="sensor-card__meta">Last updated: {formatTimestamp(currentReading.timestamp)}</p>
          </article>
        </section>

        <section className="threshold-panel" aria-label="Temperature threshold indicator">
          <div className="threshold-panel__row">
            <h2>Threshold Indicator</h2>
            <p>Threshold: {TEMPERATURE_THRESHOLD}&deg;C</p>
          </div>
          <p className="threshold-panel__hint">
            {currentReading.temperature > TEMPERATURE_THRESHOLD
              ? `${Math.abs(Number(deltaToThreshold)).toFixed(1)}\u00B0C above threshold`
              : `${deltaToThreshold}\u00B0C below threshold`}
          </p>
          <div className="threshold-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(thresholdProgress)}>
            <span
              className={`threshold-meter__fill ${isAlert ? 'threshold-meter__fill--alert' : ''}`}
              style={{ width: `${thresholdProgress}%` }}
            />
          </div>
        </section>

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
                {logs.map((entry) => {
                  const rowIsAlert = entry.status === 'Alert'

                  return (
                    <tr key={entry.id}>
                      <td>{entry.id}</td>
                      <td>{formatTimestamp(entry.timestamp)}</td>
                      <td>{entry.temperature.toFixed(1)}&deg;C</td>
                      <td>{entry.humidity}%</td>
                      <td>
                        <span className={`status-pill ${rowIsAlert ? 'status-pill--alert' : 'status-pill--normal'}`}>
                          {rowIsAlert && <i className="bx bx-bell" aria-hidden="true" />}
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="simulation-actions">
          <Link className="simulation-back-link" to="/">
            Back to IoT Lab Showcase
          </Link>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  return (
    <>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <Routes>
        <Route path="/" element={<ShowcasePage />} />
        <Route path="/server-room-simulation" element={<ServerRoomSimulationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App