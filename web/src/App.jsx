import { useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import ServerRoomSimulationPage from './labs/lab-01/ServerRoomSimulationPage'
import { SERVER_ROOM_SIMULATION_PATH } from './labs/lab-01/routes'
import ShowcasePage from './pages/ShowcasePage'

const THEME_STORAGE_KEY = 'iot-lab-theme'
const PAGE_TRANSITION_DURATION_MS = 240

function ThemeToggle({ theme, onToggle, className = '' }) {
  const classes = ['theme-toggle', className].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={classes}
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

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const transitionTimeoutRef = useRef(null)
  const [isPageFading, setIsPageFading] = useState(false)
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

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  const handleFadeNavigation = (event, targetPath) => {
    if (targetPath === location.pathname) {
      return
    }

    event.preventDefault()
    setIsPageFading(true)

    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current)
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      navigate(targetPath)
      window.requestAnimationFrame(() => {
        setIsPageFading(false)
      })
      transitionTimeoutRef.current = null
    }, PAGE_TRANSITION_DURATION_MS)
  }

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  const themeToggleClassName = location.pathname === SERVER_ROOM_SIMULATION_PATH
    ? 'theme-toggle--simulation'
    : ''

  return (
    <>
      <ThemeToggle theme={theme} onToggle={toggleTheme} className={themeToggleClassName} />
      <div
        className={`route-transition ${isPageFading ? 'route-transition--fade-out' : 'route-transition--fade-in'}`}
        style={{ '--route-transition-duration': `${PAGE_TRANSITION_DURATION_MS}ms` }}
      >
        <Routes>
          <Route path="/" element={<ShowcasePage onNavigate={handleFadeNavigation} />} />
          <Route path={SERVER_ROOM_SIMULATION_PATH} element={<ServerRoomSimulationPage onNavigate={handleFadeNavigation} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}

export default App