import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SERVER_ROOM_SIMULATION_PATH } from '../labs/lab-01/routes'

const HOME_INTRO_SESSION_KEY = 'iot-lab-showcase-home-intro-played'

const projects = [
  {
    id: 'featured-lab',
    title: 'Server Room Simulation',
    description:
      'A simulated server room monitor using a DHT11 sensor, buzzer, and red LED. When temperature exceeds the threshold, the buzzer sounds, the LED lights up, and a real-time warning is sent to the UI.',
    imageLabel: 'Featured IoT lab preview',
    href: SERVER_ROOM_SIMULATION_PATH,
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

function getHomeIntroMode() {
  if (typeof window === 'undefined') {
    return 'full'
  }

  return window.sessionStorage.getItem(HOME_INTRO_SESSION_KEY) === '1'
    ? 'cards-only'
    : 'full'
}

function ShowcasePage({ onNavigate }) {
  const [introMode] = useState(getHomeIntroMode)

  useEffect(() => {
    if (introMode !== 'full') {
      return
    }

    window.sessionStorage.setItem(HOME_INTRO_SESSION_KEY, '1')
  }, [introMode])

  const isFullIntro = introMode === 'full'

  return (
    <main className="portfolio">
      <section
        className={`portfolio-section ${isFullIntro ? 'portfolio-section--intro-full' : 'portfolio-section--intro-cards-only'}`}
        aria-labelledby="portfolio-heading"
      >
        <header className="portfolio-section__header">
          <h1 id="portfolio-heading" className="portfolio-section__title">IoT Lab Showcase</h1>
          <p className="portfolio-section__description portfolio-section__description--intro">
            A focused collection of IoT projects spanning home automation,
            sensor data logging, and analytics-driven insights.
          </p>
        </header>

        <div className="project-grid">
          {projects.map((project, index) => {
            const cardClassName = `project-card${project.isLocked ? ' project-card--locked' : ''}`
            const staggerDelay = `${index * 180}ms`

            if (project.isLocked) {
              return (
                <article
                  className={`${cardClassName} project-card--intro`}
                  key={project.id}
                  style={{ '--card-stagger-delay': staggerDelay }}
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
              <article
                className={`${cardClassName} project-card--intro`}
                key={project.id}
                style={{ '--card-stagger-delay': staggerDelay }}
              >
                <Link
                  className="project-card__link"
                  to={project.href}
                  onClick={(event) => onNavigate(event, project.href)}
                >
                  <div className="project-card__image" role="img" aria-label={project.imageLabel}></div>
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

export default ShowcasePage
