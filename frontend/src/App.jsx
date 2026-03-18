import './App.css'

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
                  <div className="project-card__body">
                    <h2>{project.title}</h2>
                    <p>{project.description}</p>
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