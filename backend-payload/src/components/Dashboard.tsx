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
  const [providers, setProviders] = useState<Provider[]>([])
  const [taskRouting, setTaskRouting] = useState<TaskRoute[]>([])
  const [providersLoading, setProvidersLoading] = useState(false)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [editingRoute, setEditingRoute] = useState<TaskRoute | null>(null)

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
      `}</style>
    </div>
  )
}

export default Dashboard
