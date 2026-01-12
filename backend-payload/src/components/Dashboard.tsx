'use client'

import React, { useEffect, useState } from 'react'

interface Stats {
  tyres: number
  articles: number
  dealers: number
  technologies: number
  vehicleFitments: number
}

interface BackgroundStatus {
  total: number
  processed: number
  pending: number
  rembgAvailable: boolean
}

interface ContentJob {
  id: string
  status: 'running' | 'completed' | 'failed'
  startedAt: string
  completedAt?: string
  command: string
  error?: string
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    tyres: 0,
    articles: 0,
    dealers: 0,
    technologies: 0,
    vehicleFitments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [bgStatus, setBgStatus] = useState<BackgroundStatus | null>(null)
  const [bgProcessing, setBgProcessing] = useState(false)
  const [bgMessage, setBgMessage] = useState<string | null>(null)
  const [contentJobs, setContentJobs] = useState<ContentJob[]>([])
  const [contentProcessing, setContentProcessing] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tyres, articles, dealers, technologies, vehicleFitments] = await Promise.all([
          fetch('/api/tyres?limit=0').then((r) => r.json()),
          fetch('/api/articles?limit=0').then((r) => r.json()),
          fetch('/api/dealers?limit=0').then((r) => r.json()),
          fetch('/api/technologies?limit=0').then((r) => r.json()),
          fetch('/api/vehicle-fitments?limit=0').then((r) => r.json()),
        ])

        setStats({
          tyres: tyres.totalDocs || 0,
          articles: articles.totalDocs || 0,
          dealers: dealers.totalDocs || 0,
          technologies: technologies.totalDocs || 0,
          vehicleFitments: vehicleFitments.totalDocs || 0,
        })

        // Fetch background removal status
        const bgStatusRes = await fetch('/api/remove-backgrounds/status')
        if (bgStatusRes.ok) {
          setBgStatus(await bgStatusRes.json())
        }

        // Fetch content jobs
        const jobsRes = await fetch('/api/content/jobs')
        if (jobsRes.ok) {
          const data = await jobsRes.json()
          setContentJobs(data.jobs || [])
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleRemoveBackgrounds = async () => {
    setBgProcessing(true)
    setBgMessage(null)
    try {
      const res = await fetch('/api/remove-backgrounds?all=true', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setBgMessage(`Оброблено: ${data.processed}, пропущено: ${data.skipped}, помилок: ${data.failed}`)
        // Refresh status
        const statusRes = await fetch('/api/remove-backgrounds/status')
        if (statusRes.ok) {
          setBgStatus(await statusRes.json())
        }
      } else {
        setBgMessage(`Помилка: ${data.error}`)
      }
    } catch (error) {
      setBgMessage('Помилка з\'єднання')
    } finally {
      setBgProcessing(false)
    }
  }

  const runContentAction = async (action: 'scrape' | 'import' | 'generate') => {
    setContentProcessing(action)
    try {
      const res = await fetch(`/api/content/${action}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        // Refresh jobs list
        const jobsRes = await fetch('/api/content/jobs')
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json()
          setContentJobs(jobsData.jobs || [])
        }
      } else {
        alert(`Помилка: ${data.error}`)
      }
    } catch (error) {
      alert('Помилка з\'єднання')
    } finally {
      setContentProcessing(null)
    }
  }

  const refreshJobs = async () => {
    const jobsRes = await fetch('/api/content/jobs')
    if (jobsRes.ok) {
      const data = await jobsRes.json()
      setContentJobs(data.jobs || [])
    }
  }

  const cards = [
    { label: 'Шини', value: stats.tyres, icon: '🚗', href: '/admin/collections/tyres', color: '#E31837' },
    { label: 'Статті', value: stats.articles, icon: '📰', href: '/admin/collections/articles', color: '#2563eb' },
    { label: 'Дилери', value: stats.dealers, icon: '🏪', href: '/admin/collections/dealers', color: '#16a34a' },
    { label: 'Технології', value: stats.technologies, icon: '🔧', href: '/admin/collections/technologies', color: '#9333ea' },
    { label: 'Автомобілі', value: stats.vehicleFitments, icon: '🚙', href: '/admin/collections/vehicle-fitments', color: '#ea580c' },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Bridgestone Ukraine CMS</h1>
        <p>Панель управління контентом</p>
      </div>

      <div className="dashboard__stats">
        {cards.map((card) => (
          <a key={card.label} href={card.href} className="dashboard__card">
            <div className="dashboard__card-icon" style={{ backgroundColor: card.color }}>
              <span>{card.icon}</span>
            </div>
            <div className="dashboard__card-content">
              <div className="dashboard__card-value">
                {loading ? '...' : card.value}
              </div>
              <div className="dashboard__card-label">{card.label}</div>
            </div>
          </a>
        ))}
      </div>

      <div className="dashboard__section">
        <h2>Швидкі дії</h2>
        <div className="dashboard__actions">
          <a href="/admin/collections/tyres/create" className="dashboard__action dashboard__action--primary">
            + Додати шину
          </a>
          <a href="/admin/collections/articles/create" className="dashboard__action">
            + Додати статтю
          </a>
          <a href="/admin/collections/dealers/create" className="dashboard__action">
            + Додати дилера
          </a>
        </div>
      </div>

      <div className="dashboard__section">
        <h2>Контент-автоматизація</h2>
        <div className="dashboard__content-automation">
          <div className="dashboard__content-actions">
            <button
              onClick={() => runContentAction('scrape')}
              disabled={contentProcessing !== null}
              className="dashboard__action"
            >
              {contentProcessing === 'scrape' ? 'Скрапінг...' : '1. Зібрати дані'}
            </button>
            <button
              onClick={() => runContentAction('import')}
              disabled={contentProcessing !== null}
              className="dashboard__action"
            >
              {contentProcessing === 'import' ? 'Імпорт...' : '2. Імпортувати шини'}
            </button>
            <button
              onClick={() => runContentAction('generate')}
              disabled={contentProcessing !== null}
              className="dashboard__action dashboard__action--primary"
            >
              {contentProcessing === 'generate' ? 'Генерація...' : '3. Згенерувати описи'}
            </button>
          </div>
          <div className="dashboard__content-jobs">
            <div className="dashboard__content-jobs-header">
              <span>Останні завдання</span>
              <button onClick={refreshJobs} className="dashboard__refresh-btn">↻</button>
            </div>
            {contentJobs.slice(0, 5).map((job) => (
              <div key={job.id} className={`dashboard__job dashboard__job--${job.status}`}>
                <span className="dashboard__job-command">{job.command.split(' ').pop()}</span>
                <span className={`dashboard__job-status dashboard__job-status--${job.status}`}>
                  {job.status === 'running' ? '⏳' : job.status === 'completed' ? '✓' : '✗'}
                </span>
                <span className="dashboard__job-time">
                  {new Date(job.startedAt).toLocaleTimeString('uk-UA')}
                </span>
              </div>
            ))}
            {contentJobs.length === 0 && (
              <div className="dashboard__job-empty">Немає завдань</div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard__section">
        <h2>Обробка зображень</h2>
        <div className="dashboard__media">
          {bgStatus && (
            <div className="dashboard__media-stats">
              <div className="dashboard__media-stat">
                <span className="dashboard__media-value">{bgStatus.total}</span>
                <span className="dashboard__media-label">Всього</span>
              </div>
              <div className="dashboard__media-stat">
                <span className="dashboard__media-value dashboard__media-value--success">{bgStatus.processed}</span>
                <span className="dashboard__media-label">Оброблено</span>
              </div>
              <div className="dashboard__media-stat">
                <span className="dashboard__media-value dashboard__media-value--pending">{bgStatus.pending}</span>
                <span className="dashboard__media-label">Очікує</span>
              </div>
            </div>
          )}
          <div className="dashboard__media-status">
            {bgStatus?.rembgAvailable ? (
              <span className="dashboard__media-available">rembg доступний</span>
            ) : (
              <span className="dashboard__media-unavailable">rembg не встановлено</span>
            )}
          </div>
          {bgMessage && (
            <div className="dashboard__media-message">{bgMessage}</div>
          )}
          <button
            onClick={handleRemoveBackgrounds}
            disabled={bgProcessing || !bgStatus?.rembgAvailable || bgStatus?.pending === 0}
            className="dashboard__action dashboard__action--primary"
          >
            {bgProcessing ? 'Обробка...' : 'Видалити фон з усіх фото'}
          </button>
        </div>
      </div>

      <style>{`
        .dashboard {
          padding: 2rem;
          max-width: 1200px;
        }

        .dashboard__header {
          margin-bottom: 2rem;
        }

        .dashboard__header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--theme-text);
          margin: 0 0 0.5rem 0;
        }

        .dashboard__header p {
          color: var(--theme-elevation-800);
          margin: 0;
        }

        .dashboard__stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .dashboard__card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-100);
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .dashboard__card:hover {
          border-color: var(--theme-elevation-200);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .dashboard__card-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .dashboard__card-content {
          flex: 1;
        }

        .dashboard__card-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--theme-text);
        }

        .dashboard__card-label {
          font-size: 0.875rem;
          color: var(--theme-elevation-800);
        }

        .dashboard__section {
          margin-bottom: 2rem;
        }

        .dashboard__section h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--theme-text);
          margin: 0 0 1rem 0;
        }

        .dashboard__actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .dashboard__action {
          padding: 0.625rem 1rem;
          background: var(--theme-elevation-100);
          border: 1px solid var(--theme-elevation-200);
          border-radius: 6px;
          color: var(--theme-text);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .dashboard__action:hover {
          background: var(--theme-elevation-150);
        }

        .dashboard__action--primary {
          background: #E31837;
          border-color: #E31837;
          color: white;
        }

        .dashboard__action--primary:hover {
          background: #C41230;
        }

        .dashboard__automation {
          padding: 1rem;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-100);
          border-radius: 8px;
        }

        .dashboard__automation-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .dashboard__automation-dot {
          width: 8px;
          height: 8px;
          background: #16a34a;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .dashboard__automation p {
          color: var(--theme-elevation-800);
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
        }

        .dashboard__media {
          padding: 1rem;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-100);
          border-radius: 8px;
        }

        .dashboard__media-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        .dashboard__media-stat {
          display: flex;
          flex-direction: column;
        }

        .dashboard__media-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--theme-text);
        }

        .dashboard__media-value--success {
          color: #16a34a;
        }

        .dashboard__media-value--pending {
          color: #ea580c;
        }

        .dashboard__media-label {
          font-size: 0.75rem;
          color: var(--theme-elevation-800);
        }

        .dashboard__media-status {
          margin-bottom: 1rem;
        }

        .dashboard__media-available {
          color: #16a34a;
          font-size: 0.875rem;
        }

        .dashboard__media-unavailable {
          color: #dc2626;
          font-size: 0.875rem;
        }

        .dashboard__media-message {
          padding: 0.5rem 0.75rem;
          background: var(--theme-elevation-100);
          border-radius: 4px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        button.dashboard__action {
          cursor: pointer;
          border: none;
        }

        button.dashboard__action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dashboard__content-automation {
          padding: 1rem;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-100);
          border-radius: 8px;
        }

        .dashboard__content-actions {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .dashboard__content-jobs {
          border-top: 1px solid var(--theme-elevation-100);
          padding-top: 1rem;
        }

        .dashboard__content-jobs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: var(--theme-elevation-800);
        }

        .dashboard__refresh-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          color: var(--theme-elevation-600);
        }

        .dashboard__refresh-btn:hover {
          color: var(--theme-text);
        }

        .dashboard__job {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--theme-elevation-50);
        }

        .dashboard__job-command {
          flex: 1;
          font-family: monospace;
          color: var(--theme-text);
        }

        .dashboard__job-status--running {
          color: #f59e0b;
        }

        .dashboard__job-status--completed {
          color: #16a34a;
        }

        .dashboard__job-status--failed {
          color: #dc2626;
        }

        .dashboard__job-time {
          color: var(--theme-elevation-600);
          font-size: 0.75rem;
        }

        .dashboard__job-empty {
          color: var(--theme-elevation-600);
          font-size: 0.875rem;
          font-style: italic;
        }
      `}</style>
    </div>
  )
}

export default Dashboard
