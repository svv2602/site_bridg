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
  currentStep?: number
  totalSteps?: number
  stepLabel?: string
}

interface Provider {
  id: number
  name: string
  type: 'llm' | 'image' | 'embedding'
  enabled: boolean
  priority: number
  defaultModel: string
  hasApiKey: boolean
  availableModels: Array<{ model: string; label: string; description?: string }>
}

interface TaskRoute {
  id: number
  task: string
  description?: string
  preferredProvider: string
  preferredModel: string
  fallbackModels?: Array<{ model: string }>
  fallbackProviders?: string[]
  maxRetries?: number
  timeoutMs?: number
  maxCost?: number
}

interface VehiclesImportProgress {
  stage: 'idle' | 'preparing' | 'brands' | 'models' | 'kits' | 'sizes' | 'indexing' | 'done' | 'error'
  currentTable: string
  processedRows: number
  totalRows: number
  startedAt: string | null
  completedAt: string | null
  error: string | null
  stats: {
    brands: number
    models: number
    kits: number
    tyreSizes: number
    filteredKits: number
    filteredSizes: number
  }
}

interface VehiclesStatus {
  progress: VehiclesImportProgress
  dbStats: {
    brands: number
    models: number
    kits: number
    tyreSizes: number
  } | null
}

// Automation Dashboard interfaces
interface AutomationStats {
  tiresProcessed: number
  articlesCreated: number
  badgesAssigned: number
  totalCost: number
  errorCount: number
  lastRun: string | null
}

interface AutomationStatus {
  status: 'running' | 'idle'
  enabled: boolean
  cronExpression: string
  nextRun: string | null
  timezone: string
}

// Content Generation interfaces
interface ContentStatus {
  modelSlug: string
  tyreId: string | null
  tyreExists: boolean
  hasRawData: boolean
  hasGeneratedContent: boolean
  isPublished: boolean
  rawDataDate: string | null
  generatedDate: string | null
}

interface ContentPreviewData {
  modelSlug: string
  generated: {
    shortDescription: string
    fullDescription: string
    seoTitle: string
    seoDescription: string
    keyBenefits: Array<{ benefit: string }>
    faqs: Array<{ question: string; answer: string }>
    metadata: {
      generatedAt: string
      provider: string
      model: string
      cost: number
    }
  }
  current: {
    shortDescription: string
    fullDescription: string
    seoTitle: string
    seoDescription: string
  } | null
  diff: {
    hasChanges: boolean
    fields: string[]
  }
  tyreId: string | null
}

interface TyreModel {
  id: string
  name: string
  slug: string
  shortDescription?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Dashboard: React.FC<any> = () => {
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
  const [pipelineJob, setPipelineJob] = useState<ContentJob | null>(null)
  const [providers, setProviders] = useState<Provider[]>([])
  const [taskRouting, setTaskRouting] = useState<TaskRoute[]>([])
  const [providersLoading, setProvidersLoading] = useState(false)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [editingRoute, setEditingRoute] = useState<TaskRoute | null>(null)
  // Vehicles import state
  const [vehiclesStatus, setVehiclesStatus] = useState<VehiclesStatus | null>(null)
  const [vehiclesLoading, setVehiclesLoading] = useState(false)
  const [vehiclesAction, setVehiclesAction] = useState<string | null>(null)

  // Automation Dashboard state
  const [automationStats, setAutomationStats] = useState<AutomationStats | null>(null)
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null)
  const [cronInput, setCronInput] = useState('0 3 * * 0')
  const [cronError, setCronError] = useState<string | null>(null)
  const [schedulerSaving, setSchedulerSaving] = useState(false)

  // Content Generation state
  const [tyreModels, setTyreModels] = useState<TyreModel[]>([])
  const [selectedTyreSlug, setSelectedTyreSlug] = useState<string | null>(null)
  const [contentStatus, setContentStatus] = useState<ContentStatus | null>(null)
  const [contentPreview, setContentPreview] = useState<ContentPreviewData | null>(null)
  const [contentAction, setContentAction] = useState<string | null>(null)
  const [showContentPreview, setShowContentPreview] = useState(false)
  const [contentSelectedFields, setContentSelectedFields] = useState<string[]>([
    'shortDescription', 'fullDescription', 'seoTitle', 'seoDescription', 'keyBenefits', 'faqs'
  ])

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

        // Fetch providers status
        const providersRes = await fetch('/api/providers/status')
        if (providersRes.ok) {
          const data = await providersRes.json()
          setProviders(data.providers || [])
          setTaskRouting(data.taskRouting || [])
        }

        // Fetch vehicles import status
        const vehiclesRes = await fetch('/api/import/status')
        if (vehiclesRes.ok) {
          const data = await vehiclesRes.json()
          setVehiclesStatus(data)
        }

        // Fetch automation stats and status
        const [automationStatsRes, automationStatusRes] = await Promise.all([
          fetch('/api/automation/stats'),
          fetch('/api/automation/status'),
        ])
        if (automationStatsRes.ok) {
          setAutomationStats(await automationStatsRes.json())
        }
        if (automationStatusRes.ok) {
          const statusData = await automationStatusRes.json()
          setAutomationStatus(statusData)
          if (statusData.cronExpression) {
            setCronInput(statusData.cronExpression)
          }
        }

        // Fetch tyre models for content generation
        const tyresListRes = await fetch('/api/tyres?limit=100&sort=name')
        if (tyresListRes.ok) {
          const data = await tyresListRes.json()
          setTyreModels(data.docs || [])
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

  const runContentAction = async (action: 'scrape' | 'import' | 'generate' | 'pipeline') => {
    setContentProcessing(action)
    try {
      const res = await fetch(`/api/content/${action}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        if (action === 'pipeline' && data.jobId) {
          // Start polling for pipeline progress
          setPipelineJob({ id: data.jobId, status: 'running', startedAt: new Date().toISOString(), command: data.command || '', currentStep: 1, totalSteps: 3, stepLabel: 'Скрапінг' })
          const pollInterval = setInterval(async () => {
            try {
              const jobRes = await fetch(`/api/content/job/${data.jobId}`)
              if (jobRes.ok) {
                const jobData: ContentJob = await jobRes.json()
                setPipelineJob(jobData)
                if (jobData.status === 'completed' || jobData.status === 'failed') {
                  clearInterval(pollInterval)
                  setContentProcessing(null)
                  // Refresh jobs list
                  const jobsRes = await fetch('/api/content/jobs')
                  if (jobsRes.ok) {
                    const jobsData = await jobsRes.json()
                    setContentJobs(jobsData.jobs || [])
                  }
                  // Trigger bg removal after pipeline
                  if (jobData.status === 'completed') {
                    try {
                      await fetch('/api/remove-backgrounds?all=true', { method: 'POST' })
                      const statusRes = await fetch('/api/remove-backgrounds/status')
                      if (statusRes.ok) {
                        setBgStatus(await statusRes.json())
                      }
                    } catch {
                      // bg removal is best-effort
                    }
                  }
                  // Clear progress widget after a short delay
                  setTimeout(() => setPipelineJob(null), 3000)
                }
              }
            } catch {
              // ignore polling errors
            }
          }, 3000)
          return // don't clear contentProcessing yet
        }
        // Non-pipeline actions: refresh jobs immediately
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
      if (action !== 'pipeline') {
        setContentProcessing(null)
      }
    }
  }

  const refreshJobs = async () => {
    const jobsRes = await fetch('/api/content/jobs')
    if (jobsRes.ok) {
      const data = await jobsRes.json()
      setContentJobs(data.jobs || [])
    }
  }

  const seedProviders = async () => {
    setProvidersLoading(true)
    try {
      const res = await fetch('/api/providers/seed', { method: 'POST' })
      if (res.ok) {
        await refreshProviders()
      }
    } catch (error) {
      console.error('Failed to seed providers:', error)
    } finally {
      setProvidersLoading(false)
    }
  }

  const refreshProviders = async () => {
    const res = await fetch('/api/providers/status')
    if (res.ok) {
      const data = await res.json()
      setProviders(data.providers || [])
      setTaskRouting(data.taskRouting || [])
    }
  }

  const toggleProvider = async (name: string) => {
    try {
      const res = await fetch(`/api/providers/${name}/toggle`, { method: 'POST' })
      if (res.ok) {
        await refreshProviders()
      }
    } catch (error) {
      console.error('Failed to toggle provider:', error)
    }
  }

  const updateProviderModel = async (name: string, model: string) => {
    try {
      const res = await fetch(`/api/providers/${name}/model`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model }),
      })
      if (res.ok) {
        await refreshProviders()
      }
    } catch (error) {
      console.error('Failed to update model:', error)
    }
  }

  const updateTaskRouting = async (task: string, updates: Partial<TaskRoute>) => {
    try {
      const res = await fetch(`/api/routing/update/${task}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        await refreshProviders()
        setEditingRoute(null)
      }
    } catch (error) {
      console.error('Failed to update task routing:', error)
    }
  }

  const getProviderStatus = (providerName: string) => {
    const provider = providers.find((p) => p.name === providerName)
    return {
      exists: !!provider,
      enabled: provider?.enabled || false,
      hasApiKey: provider?.hasApiKey || false,
    }
  }

  // Vehicles import functions
  const fetchVehiclesStatus = async () => {
    setVehiclesLoading(true)
    try {
      const res = await fetch('/api/import/status')
      if (res.ok) {
        const data = await res.json()
        setVehiclesStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch vehicles status:', error)
    } finally {
      setVehiclesLoading(false)
    }
  }

  const startVehiclesImport = async () => {
    setVehiclesAction('import')
    try {
      const res = await fetch('/api/import/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minYear: 2005 }),
      })
      if (res.ok) {
        // Start polling for status updates
        const pollStatus = setInterval(async () => {
          const statusRes = await fetch('/api/import/status')
          if (statusRes.ok) {
            const data = await statusRes.json()
            setVehiclesStatus(data)
            if (data.progress.stage === 'done' || data.progress.stage === 'error' || data.progress.stage === 'idle') {
              clearInterval(pollStatus)
              setVehiclesAction(null)
            }
          }
        }, 2000)
      } else {
        const data = await res.json()
        alert(`Помилка: ${data.error}`)
        setVehiclesAction(null)
      }
    } catch (error) {
      alert('Помилка з\'єднання')
      setVehiclesAction(null)
    }
  }

  const resetVehiclesTables = async () => {
    if (!confirm('Ви впевнені, що хочете видалити всі дані автомобілів та створити таблиці заново?')) {
      return
    }
    setVehiclesAction('reset')
    try {
      const res = await fetch('/api/import/reset', { method: 'POST' })
      if (res.ok) {
        await fetchVehiclesStatus()
      } else {
        const data = await res.json()
        alert(`Помилка: ${data.error}`)
      }
    } catch (error) {
      alert('Помилка з\'єднання')
    } finally {
      setVehiclesAction(null)
    }
  }

  const isVehiclesImportRunning = vehiclesStatus?.progress.stage &&
    vehiclesStatus.progress.stage !== 'idle' &&
    vehiclesStatus.progress.stage !== 'done' &&
    vehiclesStatus.progress.stage !== 'error'

  const vehiclesStageLabels: Record<VehiclesImportProgress['stage'], string> = {
    idle: 'Очікування',
    preparing: 'Підготовка',
    brands: 'Імпорт марок',
    models: 'Імпорт моделей',
    kits: 'Імпорт комплектацій',
    sizes: 'Імпорт розмірів',
    indexing: 'Індексація',
    done: 'Завершено',
    error: 'Помилка',
  }

  // Automation functions
  const refreshAutomation = async () => {
    try {
      const [statsRes, statusRes] = await Promise.all([
        fetch('/api/automation/stats'),
        fetch('/api/automation/status'),
      ])
      if (statsRes.ok) setAutomationStats(await statsRes.json())
      if (statusRes.ok) {
        const statusData = await statusRes.json()
        setAutomationStatus(statusData)
        if (statusData.cronExpression) {
          setCronInput(statusData.cronExpression)
        }
      }
    } catch (error) {
      console.error('Failed to refresh automation:', error)
    }
  }

  const updateScheduler = async (body: { enabled?: boolean; cronExpression?: string }) => {
    setSchedulerSaving(true)
    setCronError(null)
    try {
      const res = await fetch('/api/automation/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        setAutomationStatus(data)
        if (data.cronExpression) setCronInput(data.cronExpression)
      } else {
        const err = await res.json()
        setCronError(err.error || 'Помилка збереження')
      }
    } catch {
      setCronError('Не вдалось зʼєднатися з сервером')
    } finally {
      setSchedulerSaving(false)
    }
  }

  const cronDescription = (expr: string): string => {
    const parts = expr.trim().split(/\s+/)
    if (parts.length !== 5) return expr
    const [min, hour, , , dow] = parts
    const dayNames: Record<string, string> = {
      '0': 'неділю', '1': 'понеділок', '2': 'вівторок', '3': 'середу',
      '4': 'четвер', '5': "п'ятницю", '6': 'суботу', '7': 'неділю',
    }
    if (dow !== '*' && !dow.includes(',') && !dow.includes('-') && !dow.includes('/') &&
        min !== '*' && !min.includes('/') && hour !== '*' && !hour.includes('/')) {
      const day = dayNames[dow] || `день ${dow}`
      return `Щотижня у ${day} о ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`
    }
    if (min.startsWith('*/') || hour.startsWith('*/')) {
      if (min.startsWith('*/')) return `Кожні ${min.slice(2)} хвилин`
      return `Кожні ${hour.slice(2)} годин`
    }
    return expr
  }

  // Content Generation functions
  const fetchContentStatus = async (slug: string) => {
    try {
      const res = await fetch(`/api/content-generation/status/${slug}`, {
        credentials: 'include',
      })
      if (res.ok) {
        setContentStatus(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch content status:', error)
    }
  }

  const fetchContentPreview = async (slug: string) => {
    try {
      const res = await fetch(`/api/content-generation/preview/${slug}`, {
        credentials: 'include',
      })
      if (res.ok) {
        setContentPreview(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch content preview:', error)
    }
  }

  const handleTyreSelect = async (slug: string) => {
    setSelectedTyreSlug(slug)
    setShowContentPreview(false)
    setContentPreview(null)
    await fetchContentStatus(slug)
  }

  const generateContent = async (regenerate = false) => {
    if (!selectedTyreSlug) return
    setContentAction('generate')
    try {
      const res = await fetch('/api/content-generation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          modelSlug: selectedTyreSlug,
          scrape: true,
          regenerate,
        }),
      })
      if (res.ok) {
        await fetchContentStatus(selectedTyreSlug)
        await fetchContentPreview(selectedTyreSlug)
        setShowContentPreview(true)
      } else {
        const data = await res.json()
        alert(`Помилка: ${data.error}`)
      }
    } catch (error) {
      alert('Помилка з\'єднання')
    } finally {
      setContentAction(null)
    }
  }

  const publishContent = async () => {
    if (!selectedTyreSlug) return
    setContentAction('publish')
    try {
      const res = await fetch('/api/content-generation/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          modelSlug: selectedTyreSlug,
          fields: contentSelectedFields,
        }),
      })
      if (res.ok) {
        await fetchContentStatus(selectedTyreSlug)
        alert('Контент успішно опубліковано!')
      } else {
        const data = await res.json()
        alert(`Помилка: ${data.error}`)
      }
    } catch (error) {
      alert('Помилка з\'єднання')
    } finally {
      setContentAction(null)
    }
  }

  const toggleContentField = (field: string) => {
    setContentSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    )
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('uk-UA', {
      timeZone: 'Europe/Kyiv',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const tyresWithContent = tyreModels.filter(t => t.shortDescription).length
  const tyresWithoutContent = tyreModels.length - tyresWithContent

  const llmProviders = providers.filter((p) => p.type === 'llm')
  const imageProviders = providers.filter((p) => p.type === 'image')
  const enabledLlmProviders = llmProviders.filter((p) => p.enabled)

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
        <div className="dashboard__section-header">
          <h2>Автоматизація контенту</h2>
          <button onClick={refreshAutomation} className="dashboard__refresh-btn" title="Оновити">↻</button>
        </div>

        {/* Stats row */}
        <div className="dashboard__automation-stats">
          <div className="dashboard__automation-stat">
            <span className="dashboard__automation-value">{automationStats?.tiresProcessed ?? 0}</span>
            <span className="dashboard__automation-label">Шин оброблено</span>
          </div>
          <div className="dashboard__automation-stat">
            <span className="dashboard__automation-value">{automationStats?.articlesCreated ?? 0}</span>
            <span className="dashboard__automation-label">Статей</span>
          </div>
          <div className="dashboard__automation-stat">
            <span className="dashboard__automation-value">{automationStats?.badgesAssigned ?? 0}</span>
            <span className="dashboard__automation-label">Badges</span>
          </div>
          <div className="dashboard__automation-stat">
            <span className="dashboard__automation-value">${(automationStats?.totalCost ?? 0).toFixed(2)}</span>
            <span className="dashboard__automation-label">Витрати</span>
          </div>
          <div className="dashboard__automation-stat">
            <span className={`dashboard__automation-value ${(automationStats?.errorCount ?? 0) > 0 ? 'dashboard__automation-value--error' : ''}`}>
              {automationStats?.errorCount ?? 0}
            </span>
            <span className="dashboard__automation-label">Помилок</span>
          </div>
        </div>

        <div className="dashboard__automation-grid">
          {/* Schedule info */}
          <div className="dashboard__automation-schedule">
            <h3>Розклад</h3>
            <div className="dashboard__scheduler-toggle">
              <label className="dashboard__toggle">
                <input
                  type="checkbox"
                  checked={automationStatus?.enabled ?? false}
                  disabled={schedulerSaving}
                  onChange={(e) => updateScheduler({ enabled: e.target.checked })}
                />
                <span className="dashboard__toggle-slider" />
              </label>
              <span className="dashboard__toggle-label">
                {automationStatus?.enabled ? 'Увімкнено' : 'Вимкнено'}
              </span>
            </div>
            <div className="dashboard__automation-schedule-item">
              <span className="dashboard__automation-schedule-label">Останній запуск:</span>
              <span className="dashboard__automation-schedule-value">{formatDate(automationStats?.lastRun ?? null)}</span>
            </div>
            <div className="dashboard__automation-schedule-item">
              <span className="dashboard__automation-schedule-label">Наступний запуск:</span>
              <span className="dashboard__automation-schedule-value">
                {automationStatus?.enabled ? formatDate(automationStatus?.nextRun ?? null) : '—'}
              </span>
            </div>
            <div className="dashboard__cron-input-row">
              <input
                type="text"
                className={`dashboard__cron-input${cronError ? ' dashboard__cron-input--error' : ''}`}
                value={cronInput}
                onChange={(e) => { setCronInput(e.target.value); setCronError(null) }}
                placeholder="0 3 * * 0"
                disabled={schedulerSaving}
              />
              <button
                className="dashboard__cron-save"
                disabled={schedulerSaving || cronInput === (automationStatus?.cronExpression ?? '0 3 * * 0')}
                onClick={() => updateScheduler({ cronExpression: cronInput })}
              >
                {schedulerSaving ? '...' : 'Зберегти'}
              </button>
            </div>
            {cronError && <div className="dashboard__cron-error">{cronError}</div>}
            <div className="dashboard__automation-schedule-hint">
              {cronDescription(cronInput)} ({automationStatus?.timezone || 'Europe/Kyiv'})
            </div>
          </div>

          {/* Actions */}
          <div className="dashboard__automation-actions-panel">
            <h3>Дії</h3>
            <div className="dashboard__automation-buttons">
              {pipelineJob ? (
                <div className="dashboard__pipeline-progress">
                  <div className="dashboard__pipeline-steps">
                    {[
                      { step: 1, label: 'Скрапінг' },
                      { step: 2, label: 'Імпорт' },
                      { step: 3, label: 'Генерація' },
                    ].map(({ step, label }) => {
                      const current = pipelineJob.currentStep || 1
                      const isFailed = pipelineJob.status === 'failed' && current === step
                      const isCompleted = pipelineJob.status === 'completed' || step < current
                      const isActive = pipelineJob.status === 'running' && step === current
                      const isPending = step > current && pipelineJob.status !== 'completed'
                      let className = 'dashboard__pipeline-step'
                      if (isFailed) className += ' dashboard__pipeline-step--failed'
                      else if (isCompleted) className += ' dashboard__pipeline-step--completed'
                      else if (isActive) className += ' dashboard__pipeline-step--active'
                      else if (isPending) className += ' dashboard__pipeline-step--pending'
                      return (
                        <div key={step} className={className}>
                          <span className="dashboard__pipeline-step-icon">
                            {isFailed ? '✗' : isCompleted ? '✓' : isActive ? '⏳' : '○'}
                          </span>
                          <span className="dashboard__pipeline-step-label">{label}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="dashboard__pipeline-bar">
                    <div
                      className={`dashboard__pipeline-bar-fill${pipelineJob.status === 'failed' ? ' dashboard__pipeline-bar-fill--failed' : pipelineJob.status === 'completed' ? ' dashboard__pipeline-bar-fill--completed' : ''}`}
                      style={{
                        width: pipelineJob.status === 'completed'
                          ? '100%'
                          : `${(((pipelineJob.currentStep || 1) - 1) / 3) * 100 + (pipelineJob.status === 'running' ? 100 / 6 : 0)}%`,
                      }}
                    />
                  </div>
                  {pipelineJob.status === 'failed' && pipelineJob.error && (
                    <div className="dashboard__pipeline-error">{pipelineJob.error}</div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => runContentAction('pipeline')}
                  disabled={contentProcessing !== null}
                  className="dashboard__action dashboard__action--primary"
                  style={{ width: '100%' }}
                >
                  {contentProcessing === 'pipeline' ? 'Запуск...' : '▶ Повний цикл'}
                </button>
              )}
              <div className="dashboard__automation-buttons-row">
                <button
                  onClick={() => runContentAction('scrape')}
                  disabled={contentProcessing !== null}
                  className="dashboard__action"
                >
                  {contentProcessing === 'scrape' ? '...' : 'Скрапінг'}
                </button>
                <button
                  onClick={() => runContentAction('import')}
                  disabled={contentProcessing !== null}
                  className="dashboard__action"
                >
                  {contentProcessing === 'import' ? '...' : 'Імпорт'}
                </button>
                <button
                  onClick={() => runContentAction('generate')}
                  disabled={contentProcessing !== null}
                  className="dashboard__action"
                >
                  {contentProcessing === 'generate' ? '...' : 'Генерація'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent content jobs */}
        <div className="dashboard__automation-jobs">
          <div className="dashboard__section-header" style={{ marginBottom: '8px' }}>
            <h3>Останні завдання</h3>
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

      {/* AI Content Generation section */}
      <div className="dashboard__section">
        <h2>AI Content Generation</h2>
        <div className="dashboard__content-gen">
          {/* Stats */}
          <div className="dashboard__content-gen-stats">
            <div className="dashboard__content-gen-stat">
              <span className="dashboard__content-gen-value">{tyreModels.length}</span>
              <span className="dashboard__content-gen-label">Всього моделей</span>
            </div>
            <div className="dashboard__content-gen-stat">
              <span className="dashboard__content-gen-value dashboard__content-gen-value--success">{tyresWithContent}</span>
              <span className="dashboard__content-gen-label">З контентом</span>
            </div>
            <div className="dashboard__content-gen-stat">
              <span className="dashboard__content-gen-value dashboard__content-gen-value--warning">{tyresWithoutContent}</span>
              <span className="dashboard__content-gen-label">Без контенту</span>
            </div>
            <div className="dashboard__content-gen-stat">
              <span className="dashboard__content-gen-value">${(tyresWithoutContent * 0.05).toFixed(2)}</span>
              <span className="dashboard__content-gen-label">Прибл. вартість</span>
            </div>
          </div>

          {/* Model selector */}
          <div className="dashboard__content-gen-selector">
            <label>Оберіть модель шини:</label>
            <select
              value={selectedTyreSlug || ''}
              onChange={(e) => e.target.value && handleTyreSelect(e.target.value)}
              className="dashboard__content-gen-select"
            >
              <option value="">— Оберіть модель —</option>
              {tyreModels.map((tyre) => (
                <option key={tyre.id} value={tyre.slug}>
                  {tyre.shortDescription ? '✓ ' : '○ '}{tyre.name} ({tyre.slug})
                </option>
              ))}
            </select>
          </div>

          {/* Status info */}
          {selectedTyreSlug && contentStatus && (
            <div className="dashboard__content-gen-status">
              <div className="dashboard__content-gen-status-grid">
                <div className={`dashboard__content-gen-status-item ${contentStatus.hasRawData ? 'dashboard__content-gen-status-item--ok' : ''}`}>
                  <span>{contentStatus.hasRawData ? '✓' : '○'}</span>
                  <span>Raw дані</span>
                  <span className="dashboard__content-gen-status-date">{formatDate(contentStatus.rawDataDate)}</span>
                </div>
                <div className={`dashboard__content-gen-status-item ${contentStatus.hasGeneratedContent ? 'dashboard__content-gen-status-item--ok' : ''}`}>
                  <span>{contentStatus.hasGeneratedContent ? '✓' : '○'}</span>
                  <span>Згенеровано</span>
                  <span className="dashboard__content-gen-status-date">{formatDate(contentStatus.generatedDate)}</span>
                </div>
                <div className={`dashboard__content-gen-status-item ${contentStatus.isPublished ? 'dashboard__content-gen-status-item--ok' : ''}`}>
                  <span>{contentStatus.isPublished ? '✓' : '○'}</span>
                  <span>Опубліковано</span>
                </div>
              </div>

              {/* Actions */}
              <div className="dashboard__content-gen-actions">
                <button
                  onClick={() => generateContent(false)}
                  disabled={contentAction !== null}
                  className="dashboard__action dashboard__action--primary"
                >
                  {contentAction === 'generate' ? 'Генерація...' : 'Генерувати контент'}
                </button>
                {contentStatus.hasGeneratedContent && (
                  <button
                    onClick={() => generateContent(true)}
                    disabled={contentAction !== null}
                    className="dashboard__action"
                  >
                    Регенерувати
                  </button>
                )}
                {contentStatus.hasGeneratedContent && (
                  <button
                    onClick={async () => { await fetchContentPreview(selectedTyreSlug); setShowContentPreview(true); }}
                    disabled={contentAction !== null}
                    className="dashboard__action"
                  >
                    Превю
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content preview */}
          {showContentPreview && contentPreview && (
            <div className="dashboard__content-gen-preview">
              <h3>Превю контенту</h3>

              {/* Field selection */}
              <div className="dashboard__content-gen-fields">
                <span>Поля для публікації:</span>
                {['shortDescription', 'fullDescription', 'seoTitle', 'seoDescription', 'keyBenefits', 'faqs'].map((field) => (
                  <label key={field} className={`dashboard__content-gen-field ${contentSelectedFields.includes(field) ? 'dashboard__content-gen-field--active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={contentSelectedFields.includes(field)}
                      onChange={() => toggleContentField(field)}
                    />
                    <span>{field}</span>
                  </label>
                ))}
              </div>

              {/* Preview content */}
              <div className="dashboard__content-gen-preview-content">
                <div className="dashboard__content-gen-preview-item">
                  <strong>Короткий опис:</strong>
                  <p>{contentPreview.generated.shortDescription}</p>
                </div>
                <div className="dashboard__content-gen-preview-item">
                  <strong>SEO Title:</strong>
                  <p>{contentPreview.generated.seoTitle}</p>
                </div>
                <div className="dashboard__content-gen-preview-item">
                  <strong>SEO Description:</strong>
                  <p>{contentPreview.generated.seoDescription}</p>
                </div>
                <div className="dashboard__content-gen-preview-item">
                  <strong>Key Benefits ({contentPreview.generated.keyBenefits.length}):</strong>
                  <ul>
                    {contentPreview.generated.keyBenefits.slice(0, 3).map((b, i) => (
                      <li key={i}>{b.benefit}</li>
                    ))}
                  </ul>
                </div>
                <div className="dashboard__content-gen-preview-item">
                  <strong>FAQs ({contentPreview.generated.faqs.length}):</strong>
                  <ul>
                    {contentPreview.generated.faqs.slice(0, 2).map((faq, i) => (
                      <li key={i}><em>Q: {faq.question}</em></li>
                    ))}
                  </ul>
                </div>
                <div className="dashboard__content-gen-preview-meta">
                  Модель: {contentPreview.generated.metadata.model} | Вартість: ${contentPreview.generated.metadata.cost.toFixed(3)}
                </div>
              </div>

              {/* Publish button */}
              <div className="dashboard__content-gen-publish">
                <button
                  onClick={publishContent}
                  disabled={contentAction !== null || contentSelectedFields.length === 0}
                  className="dashboard__action dashboard__action--primary"
                >
                  {contentAction === 'publish' ? 'Публікація...' : `Опублікувати (${contentSelectedFields.length} полів)`}
                </button>
              </div>
            </div>
          )}

          {/* Help text */}
          {!selectedTyreSlug && (
            <div className="dashboard__content-gen-help">
              <strong>Як використовувати:</strong>
              <ol>
                <li>Оберіть модель шини зі списку</li>
                <li>Натисніть &quot;Генерувати контент&quot; для збору даних та генерації AI</li>
                <li>Перегляньте превю та виберіть поля</li>
                <li>Натисніть &quot;Опублікувати&quot; для збереження в CMS</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard__section">
        <div className="dashboard__section-header">
          <h2>База автомобілів</h2>
          <button onClick={fetchVehiclesStatus} className="dashboard__refresh-btn" title="Оновити">↻</button>
        </div>
        <div className="dashboard__vehicles">
          <div className="dashboard__vehicles-stats">
            <div className="dashboard__vehicles-stat">
              <span className="dashboard__vehicles-value">{vehiclesStatus?.dbStats?.brands ?? 0}</span>
              <span className="dashboard__vehicles-label">Марок</span>
            </div>
            <div className="dashboard__vehicles-stat">
              <span className="dashboard__vehicles-value">{vehiclesStatus?.dbStats?.models ?? 0}</span>
              <span className="dashboard__vehicles-label">Моделей</span>
            </div>
            <div className="dashboard__vehicles-stat">
              <span className="dashboard__vehicles-value">{vehiclesStatus?.dbStats?.kits ?? 0}</span>
              <span className="dashboard__vehicles-label">Комплектацій</span>
            </div>
            <div className="dashboard__vehicles-stat">
              <span className="dashboard__vehicles-value">{vehiclesStatus?.dbStats?.tyreSizes ?? 0}</span>
              <span className="dashboard__vehicles-label">Розмірів шин</span>
            </div>
          </div>

          {/* Progress bar */}
          {vehiclesStatus?.progress.stage && vehiclesStatus.progress.stage !== 'idle' && (
            <div className="dashboard__vehicles-progress">
              <div className="dashboard__vehicles-progress-header">
                <span>Прогрес імпорту</span>
                <span className={`dashboard__vehicles-stage dashboard__vehicles-stage--${vehiclesStatus.progress.stage}`}>
                  {vehiclesStageLabels[vehiclesStatus.progress.stage]}
                </span>
              </div>
              <div className="dashboard__vehicles-progress-bar">
                {(['brands', 'models', 'kits', 'sizes', 'indexing'] as const).map((stage, index) => {
                  const stages = ['brands', 'models', 'kits', 'sizes', 'indexing']
                  const currentIndex = stages.indexOf(vehiclesStatus.progress.stage)
                  let bgClass = 'dashboard__vehicles-progress-step'
                  if (vehiclesStatus.progress.stage === 'done') {
                    bgClass += ' dashboard__vehicles-progress-step--done'
                  } else if (vehiclesStatus.progress.stage === 'error' && index <= currentIndex) {
                    bgClass += ' dashboard__vehicles-progress-step--error'
                  } else if (index < currentIndex) {
                    bgClass += ' dashboard__vehicles-progress-step--done'
                  } else if (index === currentIndex && isVehiclesImportRunning) {
                    bgClass += ' dashboard__vehicles-progress-step--active'
                  }
                  return <div key={stage} className={bgClass} />
                })}
              </div>
              <div className="dashboard__vehicles-progress-info">
                <span>Таблиця: {vehiclesStatus.progress.currentTable || '—'}</span>
                <span>Рядків: {vehiclesStatus.progress.processedRows.toLocaleString('uk-UA')}</span>
              </div>
              {vehiclesStatus.progress.error && (
                <div className="dashboard__vehicles-error">{vehiclesStatus.progress.error}</div>
              )}
            </div>
          )}

          <div className="dashboard__vehicles-actions">
            <button
              onClick={startVehiclesImport}
              disabled={vehiclesAction !== null || isVehiclesImportRunning}
              className="dashboard__action dashboard__action--primary"
            >
              {vehiclesAction === 'import' || isVehiclesImportRunning ? 'Імпорт...' : 'Запустити імпорт'}
            </button>
            <button
              onClick={resetVehiclesTables}
              disabled={vehiclesAction !== null || isVehiclesImportRunning}
              className="dashboard__action dashboard__action--danger"
            >
              {vehiclesAction === 'reset' ? 'Скидання...' : 'Скинути таблиці'}
            </button>
          </div>
          <div className="dashboard__vehicles-info">
            <p>Джерело: CSV файли (db_size_auto/) • Фільтр: авто з 2005 року</p>
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

      <div className="dashboard__section">
        <div className="dashboard__section-header">
          <h2>AI Провайдери</h2>
          <div className="dashboard__section-actions">
            <button onClick={refreshProviders} className="dashboard__refresh-btn" title="Оновити">↻</button>
            <button
              onClick={seedProviders}
              disabled={providersLoading}
              className="dashboard__action"
            >
              {providersLoading ? 'Завантаження...' : providers.length === 0 ? 'Ініціалізувати' : 'Додати відсутні'}
            </button>
          </div>
        </div>

        {providers.length === 0 && !loading && (
          <div className="dashboard__providers-empty">
            <p>Провайдери не налаштовані. Натисніть &quot;Ініціалізувати&quot; щоб додати стандартні провайдери.</p>
          </div>
        )}

        {providers.length > 0 && (
          <div className="dashboard__providers">
            <div className="dashboard__providers-group">
              <h3>LLM (текст)</h3>
              <div className="dashboard__providers-list">
                {llmProviders.map((provider) => (
                  <div key={provider.name} className={`dashboard__provider ${provider.enabled ? 'dashboard__provider--enabled' : ''}`}>
                    <div className="dashboard__provider-header">
                      <label className="dashboard__provider-toggle">
                        <input
                          type="checkbox"
                          checked={provider.enabled}
                          onChange={() => toggleProvider(provider.name)}
                        />
                        <span className="dashboard__provider-name">{provider.name}</span>
                      </label>
                      <span className={`dashboard__provider-key ${provider.hasApiKey ? 'dashboard__provider-key--ok' : 'dashboard__provider-key--missing'}`}>
                        {provider.hasApiKey ? '🔑' : '⚠️'}
                      </span>
                    </div>
                    {provider.enabled && provider.availableModels.length > 0 && (
                      <select
                        value={provider.defaultModel}
                        onChange={(e) => updateProviderModel(provider.name, e.target.value)}
                        className="dashboard__provider-model"
                      >
                        {provider.availableModels.map((m) => (
                          <option key={m.model} value={m.model}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {!provider.enabled && (
                      <div className="dashboard__provider-model-disabled">{provider.defaultModel}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard__providers-group">
              <h3>Зображення</h3>
              <div className="dashboard__providers-list">
                {imageProviders.map((provider) => (
                  <div key={provider.name} className={`dashboard__provider ${provider.enabled ? 'dashboard__provider--enabled' : ''}`}>
                    <div className="dashboard__provider-header">
                      <label className="dashboard__provider-toggle">
                        <input
                          type="checkbox"
                          checked={provider.enabled}
                          onChange={() => toggleProvider(provider.name)}
                        />
                        <span className="dashboard__provider-name">{provider.name}</span>
                      </label>
                      <span className={`dashboard__provider-key ${provider.hasApiKey ? 'dashboard__provider-key--ok' : 'dashboard__provider-key--missing'}`}>
                        {provider.hasApiKey ? '🔑' : '⚠️'}
                      </span>
                    </div>
                    {provider.enabled && provider.availableModels.length > 0 && (
                      <select
                        value={provider.defaultModel}
                        onChange={(e) => updateProviderModel(provider.name, e.target.value)}
                        className="dashboard__provider-model"
                      >
                        {provider.availableModels.map((m) => (
                          <option key={m.model} value={m.model}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {taskRouting.length > 0 && (
              <div className="dashboard__task-routing">
                <h3>Маршрутизація задач</h3>
                <div className="dashboard__routing-list">
                  {taskRouting.map((route) => {
                    const status = getProviderStatus(route.preferredProvider)
                    const isExpanded = expandedTask === route.task
                    // Determine if this is an image task
                    const isImageTask = route.task.startsWith('image-')
                    const relevantProviders = isImageTask ? imageProviders : llmProviders
                    // Check if current provider is valid for task type
                    const isProviderValidForTaskType = relevantProviders.some((p) => p.name === route.preferredProvider)
                    return (
                      <div key={route.task} className="dashboard__route-item">
                        <div
                          className="dashboard__route-header"
                          onClick={() => setExpandedTask(isExpanded ? null : route.task)}
                        >
                          <span className="dashboard__route-task">
                            {isImageTask ? '🖼️ ' : '💬 '}{route.task}
                          </span>
                          <div className="dashboard__route-info">
                            <span className={`dashboard__route-status ${!isProviderValidForTaskType ? 'dashboard__route-status--error' : status.hasApiKey && status.enabled ? 'dashboard__route-status--ok' : 'dashboard__route-status--warn'}`}>
                              {!isProviderValidForTaskType ? '✗' : status.hasApiKey && status.enabled ? '✓' : '⚠'}
                            </span>
                            <span className={`dashboard__route-provider ${!isProviderValidForTaskType ? 'dashboard__route-provider--invalid' : ''}`}>
                              {route.preferredProvider}
                              {!isProviderValidForTaskType && ' (невірний тип)'}
                            </span>
                            <span className="dashboard__route-model">{route.preferredModel}</span>
                            <span className="dashboard__route-expand">{isExpanded ? '▼' : '▶'}</span>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="dashboard__route-details">
                            {route.description && (
                              <div className="dashboard__route-desc">{route.description}</div>
                            )}
                            <div className="dashboard__route-config">
                              <div className="dashboard__route-field">
                                <label>Основний провайдер:</label>
                                <select
                                  value={route.preferredProvider}
                                  onChange={(e) => {
                                    const newProvider = e.target.value
                                    // Use relevantProviders to find provider data (matches task type)
                                    const newProviderData = relevantProviders.find((p) => p.name === newProvider)
                                    const newModel = newProviderData?.defaultModel || newProviderData?.availableModels?.[0]?.model || ''
                                    updateTaskRouting(route.task, {
                                      preferredProvider: newProvider,
                                      preferredModel: newModel
                                    })
                                  }}
                                >
                                  {relevantProviders.map((p) => (
                                    <option key={p.name} value={p.name}>
                                      {p.name} {!p.hasApiKey ? '(немає ключа)' : ''} {!p.enabled ? '(вимкнено)' : ''}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="dashboard__route-field">
                                <label>Модель:</label>
                                <select
                                  value={route.preferredModel}
                                  onChange={(e) => updateTaskRouting(route.task, { preferredModel: e.target.value })}
                                >
                                  {(() => {
                                    // Use relevantProviders to find the correct provider for this task type
                                    // This prevents showing LLM models for image tasks (e.g., openai vs openai-dalle)
                                    const currentProvider = relevantProviders.find((p) => p.name === route.preferredProvider)
                                    if (currentProvider?.availableModels?.length) {
                                      return currentProvider.availableModels.map((m) => (
                                        <option key={m.model} value={m.model}>{m.label}</option>
                                      ))
                                    }
                                    // Fallback: show current model if provider not found in relevant list
                                    return <option value={route.preferredModel}>{route.preferredModel}</option>
                                  })()}
                                </select>
                              </div>
                              <div className="dashboard__route-field">
                                <label>Резервні моделі (fallback):</label>
                                <div className="dashboard__route-fallback-models">
                                  {(() => {
                                    const currentProvider = relevantProviders.find((p) => p.name === route.preferredProvider)
                                    if (!currentProvider?.availableModels?.length) return null
                                    const currentFallbackModels = route.fallbackModels?.map((m) => m.model) || []
                                    return currentProvider.availableModels
                                      .filter((m) => m.model !== route.preferredModel)
                                      .map((m) => {
                                        const isSelected = currentFallbackModels.includes(m.model)
                                        return (
                                          <label key={m.model} className={`dashboard__route-fallback ${isSelected ? 'dashboard__route-fallback--active' : ''}`}>
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={(e) => {
                                                const newFallbacks = e.target.checked
                                                  ? [...currentFallbackModels, m.model]
                                                  : currentFallbackModels.filter((f) => f !== m.model)
                                                updateTaskRouting(route.task, {
                                                  fallbackModels: newFallbacks.map((model) => ({ model }))
                                                })
                                              }}
                                            />
                                            <span>{m.label}</span>
                                          </label>
                                        )
                                      })
                                  })()}
                                </div>
                                <div className="dashboard__route-hint">
                                  Якщо основна модель не працює, буде використана резервна
                                </div>
                              </div>
                              <div className="dashboard__route-field">
                                <label>Резервні провайдери:</label>
                                <div className="dashboard__route-fallbacks">
                                  {relevantProviders.map((p) => {
                                    const isFallback = route.fallbackProviders?.includes(p.name)
                                    const pStatus = getProviderStatus(p.name)
                                    return (
                                      <label key={p.name} className={`dashboard__route-fallback ${isFallback ? 'dashboard__route-fallback--active' : ''}`}>
                                        <input
                                          type="checkbox"
                                          checked={isFallback}
                                          onChange={(e) => {
                                            const newFallbacks = e.target.checked
                                              ? [...(route.fallbackProviders || []), p.name]
                                              : (route.fallbackProviders || []).filter((f) => f !== p.name)
                                            updateTaskRouting(route.task, { fallbackProviders: newFallbacks })
                                          }}
                                          disabled={p.name === route.preferredProvider}
                                        />
                                        <span>{p.name}</span>
                                        <span className={pStatus.hasApiKey ? 'key-ok' : 'key-missing'}>
                                          {pStatus.hasApiKey ? '🔑' : '⚠'}
                                        </span>
                                      </label>
                                    )
                                  })}
                                </div>
                              </div>
                              <div className="dashboard__route-meta">
                                <span>Повторів: {route.maxRetries || 2}</span>
                                <span>Таймаут: {((route.timeoutMs || 60000) / 1000).toFixed(0)}с</span>
                                <span>Макс. вартість: ${route.maxCost || 0.5}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
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

        .dashboard__pipeline-progress {
          width: 100%;
          padding: 0.75rem;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-150);
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .dashboard__pipeline-steps {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .dashboard__pipeline-step {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: var(--theme-elevation-500);
          transition: color 0.2s;
        }

        .dashboard__pipeline-step--active {
          color: #f59e0b;
          font-weight: 600;
        }

        .dashboard__pipeline-step--completed {
          color: #16a34a;
        }

        .dashboard__pipeline-step--failed {
          color: #dc2626;
          font-weight: 600;
        }

        .dashboard__pipeline-step--pending {
          color: var(--theme-elevation-400);
        }

        .dashboard__pipeline-step-icon {
          font-size: 0.85rem;
        }

        .dashboard__pipeline-bar {
          width: 100%;
          height: 6px;
          background: var(--theme-elevation-150);
          border-radius: 3px;
          overflow: hidden;
        }

        .dashboard__pipeline-bar-fill {
          height: 100%;
          background: #f59e0b;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .dashboard__pipeline-bar-fill--completed {
          background: #16a34a;
        }

        .dashboard__pipeline-bar-fill--failed {
          background: #dc2626;
        }

        .dashboard__pipeline-error {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #dc2626;
          word-break: break-word;
        }

        .dashboard__section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .dashboard__section-header h2 {
          margin: 0;
        }

        .dashboard__section-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .dashboard__providers {
          padding: 1rem;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-100);
          border-radius: 8px;
        }

        .dashboard__providers-group {
          margin-bottom: 1.5rem;
        }

        .dashboard__providers-group:last-child {
          margin-bottom: 0;
        }

        .dashboard__providers-group h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--theme-elevation-800);
          margin: 0 0 0.75rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dashboard__providers-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .dashboard__provider {
          padding: 0.75rem;
          background: var(--theme-elevation-100);
          border: 1px solid var(--theme-elevation-150);
          border-radius: 6px;
          opacity: 0.6;
          transition: all 0.2s ease;
        }

        .dashboard__provider--enabled {
          opacity: 1;
          border-color: #16a34a;
          background: var(--theme-elevation-50);
        }

        .dashboard__provider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .dashboard__provider-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .dashboard__provider-toggle input {
          cursor: pointer;
        }

        .dashboard__provider-name {
          font-weight: 500;
          color: var(--theme-text);
          text-transform: capitalize;
        }

        .dashboard__provider-key--ok {
          opacity: 1;
        }

        .dashboard__provider-key--missing {
          opacity: 0.8;
        }

        .dashboard__provider-model {
          width: 100%;
          padding: 0.375rem 0.5rem;
          background: var(--theme-elevation-100);
          border: 1px solid var(--theme-elevation-200);
          border-radius: 4px;
          color: var(--theme-text);
          font-size: 0.75rem;
          cursor: pointer;
        }

        .dashboard__provider-model-disabled {
          font-size: 0.75rem;
          color: var(--theme-elevation-600);
          font-family: monospace;
        }

        .dashboard__task-routing {
          border-top: 1px solid var(--theme-elevation-100);
          padding-top: 1rem;
          margin-top: 1rem;
        }

        .dashboard__task-routing h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--theme-elevation-800);
          margin: 0 0 0.75rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dashboard__routing-list {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .dashboard__route-item {
          background: var(--theme-elevation-100);
          border-radius: 6px;
          margin-bottom: 0.5rem;
          overflow: hidden;
        }

        .dashboard__route-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dashboard__route-header:hover {
          background: var(--theme-elevation-150);
        }

        .dashboard__route-task {
          font-weight: 500;
          color: var(--theme-text);
          font-size: 0.875rem;
        }

        .dashboard__route-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.75rem;
        }

        .dashboard__route-status {
          font-size: 0.875rem;
        }

        .dashboard__route-status--ok {
          color: #16a34a;
        }

        .dashboard__route-status--warn {
          color: #f59e0b;
        }

        .dashboard__route-status--error {
          color: #dc2626;
        }

        .dashboard__route-provider {
          color: #16a34a;
          text-transform: capitalize;
        }

        .dashboard__route-provider--invalid {
          color: #dc2626;
        }

        .dashboard__route-model {
          color: var(--theme-elevation-600);
          font-family: monospace;
          max-width: 150px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .dashboard__route-expand {
          color: var(--theme-elevation-500);
          font-size: 0.625rem;
        }

        .dashboard__route-details {
          padding: 0 1rem 1rem;
          border-top: 1px solid var(--theme-elevation-150);
        }

        .dashboard__route-desc {
          font-size: 0.75rem;
          color: var(--theme-elevation-600);
          padding: 0.75rem 0;
          font-style: italic;
        }

        .dashboard__route-config {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .dashboard__route-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .dashboard__route-field label {
          font-size: 0.75rem;
          color: var(--theme-elevation-600);
          font-weight: 500;
        }

        .dashboard__route-field select {
          padding: 0.5rem;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-200);
          border-radius: 4px;
          color: var(--theme-text);
          font-size: 0.8125rem;
        }

        .dashboard__route-fallbacks {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .dashboard__route-fallback {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.625rem;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-200);
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dashboard__route-fallback:hover {
          border-color: var(--theme-elevation-300);
        }

        .dashboard__route-fallback--active {
          background: rgba(22, 163, 74, 0.1);
          border-color: #16a34a;
        }

        .dashboard__route-fallback input {
          cursor: pointer;
        }

        .dashboard__route-fallback .key-ok {
          opacity: 1;
        }

        .dashboard__route-fallback .key-missing {
          opacity: 0.6;
        }

        .dashboard__route-fallback-models {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .dashboard__route-hint {
          font-size: 0.7rem;
          color: var(--theme-elevation-500);
          margin-top: 0.375rem;
          font-style: italic;
        }

        .dashboard__route-meta {
          display: flex;
          gap: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--theme-elevation-150);
          font-size: 0.75rem;
          color: var(--theme-elevation-500);
        }

        .dashboard__providers-empty {
          padding: 1.5rem;
          background: var(--theme-elevation-50);
          border: 1px dashed var(--theme-elevation-200);
          border-radius: 8px;
          text-align: center;
        }

        .dashboard__providers-empty p {
          margin: 0;
          color: var(--theme-elevation-600);
          font-size: 0.875rem;
        }

        /* Vehicles import section */
        .dashboard__vehicles {
          padding: 1rem;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-100);
          border-radius: 8px;
        }

        .dashboard__vehicles-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .dashboard__vehicles-stat {
          text-align: center;
          padding: 0.75rem;
          background: var(--theme-elevation-100);
          border-radius: 6px;
        }

        .dashboard__vehicles-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--theme-text);
        }

        .dashboard__vehicles-label {
          font-size: 0.75rem;
          color: var(--theme-elevation-600);
        }

        .dashboard__vehicles-progress {
          padding: 1rem;
          background: var(--theme-elevation-100);
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .dashboard__vehicles-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }

        .dashboard__vehicles-stage {
          font-weight: 500;
        }

        .dashboard__vehicles-stage--done {
          color: #16a34a;
        }

        .dashboard__vehicles-stage--error {
          color: #dc2626;
        }

        .dashboard__vehicles-stage--brands,
        .dashboard__vehicles-stage--models,
        .dashboard__vehicles-stage--kits,
        .dashboard__vehicles-stage--sizes,
        .dashboard__vehicles-stage--indexing,
        .dashboard__vehicles-stage--preparing {
          color: #2563eb;
        }

        .dashboard__vehicles-progress-bar {
          display: flex;
          gap: 4px;
          margin-bottom: 0.75rem;
        }

        .dashboard__vehicles-progress-step {
          flex: 1;
          height: 6px;
          background: var(--theme-elevation-200);
          border-radius: 3px;
          transition: background 0.3s;
        }

        .dashboard__vehicles-progress-step--done {
          background: #16a34a;
        }

        .dashboard__vehicles-progress-step--error {
          background: #dc2626;
        }

        .dashboard__vehicles-progress-step--active {
          background: #2563eb;
          animation: pulse 1.5s infinite;
        }

        .dashboard__vehicles-progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--theme-elevation-600);
        }

        .dashboard__vehicles-error {
          margin-top: 0.75rem;
          padding: 0.5rem 0.75rem;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 4px;
          color: #dc2626;
          font-size: 0.875rem;
        }

        .dashboard__vehicles-actions {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .dashboard__action--danger {
          background: #dc2626;
          border-color: #dc2626;
          color: white;
        }

        .dashboard__action--danger:hover {
          background: #b91c1c;
        }

        .dashboard__vehicles-info {
          font-size: 0.75rem;
          color: var(--theme-elevation-500);
        }

        .dashboard__vehicles-info p {
          margin: 0;
        }

        /* Automation Dashboard styles */
        .dashboard__automation-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .dashboard__automation-stat {
          text-align: center;
          padding: 0.75rem;
          background: var(--theme-elevation-100);
          border-radius: 6px;
        }

        .dashboard__automation-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--theme-text);
        }

        .dashboard__automation-value--error {
          color: #dc2626;
        }

        .dashboard__automation-label {
          font-size: 0.7rem;
          color: var(--theme-elevation-600);
        }

        .dashboard__automation-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .dashboard__automation-schedule,
        .dashboard__automation-actions-panel {
          padding: 1rem;
          background: var(--theme-elevation-100);
          border-radius: 6px;
        }

        .dashboard__automation-schedule h3,
        .dashboard__automation-actions-panel h3,
        .dashboard__automation-jobs h3 {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          color: var(--theme-text);
        }

        .dashboard__automation-schedule-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .dashboard__automation-schedule-label {
          color: var(--theme-elevation-600);
        }

        .dashboard__automation-schedule-value {
          font-weight: 500;
          color: var(--theme-text);
        }

        .dashboard__automation-schedule-hint {
          font-size: 0.75rem;
          color: var(--theme-elevation-500);
          padding: 0.5rem;
          background: var(--theme-elevation-50);
          border-radius: 4px;
          margin-top: 0.5rem;
        }

        .dashboard__scheduler-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .dashboard__toggle {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
          cursor: pointer;
        }

        .dashboard__toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .dashboard__toggle-slider {
          position: absolute;
          inset: 0;
          background: var(--theme-elevation-200);
          border-radius: 22px;
          transition: background 0.2s;
        }

        .dashboard__toggle-slider::before {
          content: '';
          position: absolute;
          left: 2px;
          bottom: 2px;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s;
        }

        .dashboard__toggle input:checked + .dashboard__toggle-slider {
          background: #22c55e;
        }

        .dashboard__toggle input:checked + .dashboard__toggle-slider::before {
          transform: translateX(18px);
        }

        .dashboard__toggle input:disabled + .dashboard__toggle-slider {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dashboard__toggle-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--theme-text);
        }

        .dashboard__cron-input-row {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .dashboard__cron-input {
          flex: 1;
          padding: 0.4rem 0.6rem;
          font-family: monospace;
          font-size: 0.85rem;
          border: 1px solid var(--theme-elevation-200);
          border-radius: 4px;
          background: var(--theme-input-bg);
          color: var(--theme-text);
        }

        .dashboard__cron-input:focus {
          outline: none;
          border-color: var(--theme-elevation-400);
        }

        .dashboard__cron-input--error {
          border-color: #ef4444;
        }

        .dashboard__cron-save {
          padding: 0.4rem 0.75rem;
          font-size: 0.8rem;
          border: 1px solid var(--theme-elevation-200);
          border-radius: 4px;
          background: var(--theme-elevation-100);
          color: var(--theme-text);
          cursor: pointer;
          white-space: nowrap;
        }

        .dashboard__cron-save:hover:not(:disabled) {
          background: var(--theme-elevation-200);
        }

        .dashboard__cron-save:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .dashboard__cron-error {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .dashboard__automation-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .dashboard__automation-buttons-row {
          display: flex;
          gap: 0.5rem;
        }

        .dashboard__automation-jobs {
          padding: 1rem;
          background: var(--theme-elevation-100);
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        /* Content Generation styles */
        .dashboard__content-gen {
          padding: 1rem;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-100);
          border-radius: 8px;
        }

        .dashboard__content-gen-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .dashboard__content-gen-stat {
          text-align: center;
          padding: 0.75rem;
          background: var(--theme-elevation-100);
          border-radius: 6px;
        }

        .dashboard__content-gen-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--theme-text);
        }

        .dashboard__content-gen-value--success {
          color: #16a34a;
        }

        .dashboard__content-gen-value--warning {
          color: #f59e0b;
        }

        .dashboard__content-gen-label {
          font-size: 0.7rem;
          color: var(--theme-elevation-600);
        }

        .dashboard__content-gen-selector {
          margin-bottom: 1rem;
        }

        .dashboard__content-gen-selector label {
          display: block;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          color: var(--theme-elevation-600);
        }

        .dashboard__content-gen-select {
          width: 100%;
          padding: 0.75rem;
          background: var(--theme-elevation-100);
          border: 1px solid var(--theme-elevation-200);
          border-radius: 6px;
          color: var(--theme-text);
          font-size: 0.875rem;
        }

        .dashboard__content-gen-status {
          padding: 1rem;
          background: var(--theme-elevation-100);
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .dashboard__content-gen-status-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .dashboard__content-gen-status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.75rem;
          background: var(--theme-elevation-50);
          border-radius: 6px;
          font-size: 0.8125rem;
          color: var(--theme-elevation-600);
        }

        .dashboard__content-gen-status-item--ok {
          background: rgba(22, 163, 74, 0.1);
          color: #16a34a;
        }

        .dashboard__content-gen-status-date {
          font-size: 0.7rem;
          opacity: 0.8;
        }

        .dashboard__content-gen-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .dashboard__content-gen-preview {
          padding: 1rem;
          background: var(--theme-elevation-100);
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .dashboard__content-gen-preview h3 {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }

        .dashboard__content-gen-fields {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
          align-items: center;
        }

        .dashboard__content-gen-fields > span {
          font-size: 0.75rem;
          color: var(--theme-elevation-600);
          margin-right: 0.5rem;
        }

        .dashboard__content-gen-field {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-200);
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dashboard__content-gen-field:hover {
          border-color: var(--theme-elevation-300);
        }

        .dashboard__content-gen-field--active {
          background: rgba(22, 163, 74, 0.1);
          border-color: #16a34a;
        }

        .dashboard__content-gen-field input {
          cursor: pointer;
        }

        .dashboard__content-gen-preview-content {
          background: var(--theme-elevation-50);
          border-radius: 6px;
          padding: 1rem;
        }

        .dashboard__content-gen-preview-item {
          margin-bottom: 1rem;
        }

        .dashboard__content-gen-preview-item:last-child {
          margin-bottom: 0;
        }

        .dashboard__content-gen-preview-item strong {
          display: block;
          font-size: 0.75rem;
          color: var(--theme-elevation-600);
          margin-bottom: 0.25rem;
        }

        .dashboard__content-gen-preview-item p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--theme-text);
        }

        .dashboard__content-gen-preview-item ul {
          margin: 0;
          padding-left: 1.25rem;
          font-size: 0.875rem;
        }

        .dashboard__content-gen-preview-item li {
          margin-bottom: 0.25rem;
        }

        .dashboard__content-gen-preview-meta {
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--theme-elevation-200);
          font-size: 0.75rem;
          color: var(--theme-elevation-500);
        }

        .dashboard__content-gen-publish {
          margin-top: 1rem;
        }

        .dashboard__content-gen-help {
          padding: 1rem;
          background: rgba(37, 99, 235, 0.05);
          border: 1px solid rgba(37, 99, 235, 0.2);
          border-radius: 6px;
        }

        .dashboard__content-gen-help strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #2563eb;
        }

        .dashboard__content-gen-help ol {
          margin: 0;
          padding-left: 1.25rem;
          font-size: 0.875rem;
          color: var(--theme-elevation-700);
        }

        .dashboard__content-gen-help li {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  )
}

export default Dashboard
