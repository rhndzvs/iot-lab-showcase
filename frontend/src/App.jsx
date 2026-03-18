import { useEffect, useState } from 'react'
import './App.css'

const THEME_STORAGE_KEY = 'iot-lab-theme'

const projects = [
  {
    id: 'featured-lab',
    title: 'Smart Home Telemetry Lab',
    description:
      'A real IoT lab for home automation with live sensor streams, rule-based device control, and dashboard insights.',
    imageLabel: 'Featured IoT lab preview',
    href: '#',
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
    <main className="portfolio">
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Light mode active' : 'Dark mode active'}
        aria-pressed={theme === 'dark'}
        title={theme === 'light' ? 'Light mode active' : 'Dark mode active'}
      >
        <i
          className={`bx theme-toggle__icon ${theme === 'light' ? 'bx-sun' : 'bx-moon'} theme-toggle__icon--${theme}`}
          aria-hidden="true"
        />
      </button>

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
                <a className="project-card__link" href={project.href}>
                  <div className="project-card__image" role="img" aria-label={project.imageLabel}>
                    <span className="project-card__badge project-card__badge--live">
                      Featured Lab
                    </span>
                  </div>
                  <div className="project-card__body">
                    <h2>{project.title}</h2>
                    <p>{project.description}</p>
                  </div>
                </a>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default App