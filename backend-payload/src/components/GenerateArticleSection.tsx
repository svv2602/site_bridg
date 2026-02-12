'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'

type ArticleType =
  | 'seasonal-guide'
  | 'model-review'
  | 'test-summary'
  | 'comparison'
  | 'technology'
  | 'tips'

interface JobStatus {
  id: string
  status: 'running' | 'completed' | 'failed'
  stepLabel?: string
  currentStep?: number
  totalSteps?: number
  error?: string
  output?: string
  targetName?: string
}

const ARTICLE_TYPES: { value: ArticleType; label: string }[] = [
  { value: 'seasonal-guide', label: 'Сезонний гід' },
  { value: 'model-review', label: 'Огляд моделі' },
  { value: 'test-summary', label: 'Підсумок тесту' },
  { value: 'comparison', label: 'Порівняння' },
  { value: 'technology', label: 'Технологія' },
  { value: 'tips', label: 'Поради' },
]

export const GenerateArticleSection: React.FC = () => {
  const [topic, setTopic] = useState('')
  const [articleType, setArticleType] = useState<ArticleType>('seasonal-guide')
  const [keywords, setKeywords] = useState('')
  const [brand, setBrand] = useState<'bridgestone' | 'firestone'>('bridgestone')
  const [relatedTyres, setRelatedTyres] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [error, setError] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const pollJobStatus = useCallback((jobId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/content/job/${jobId}`, { credentials: 'include' })
        if (!res.ok) return
        const data: JobStatus = await res.json()
        setJobStatus(data)

        if (data.status !== 'running') {
          if (pollRef.current) {
            clearInterval(pollRef.current)
            pollRef.current = null
          }
          setIsSubmitting(false)
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setJobStatus(null)

    const keywordsArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
    const relatedTyresArray = relatedTyres
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    try {
      const res = await fetch('/api/content/generate-article', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          articleType,
          ...(keywordsArray.length ? { keywords: keywordsArray } : {}),
          ...(relatedTyresArray.length ? { relatedTyres: relatedTyresArray } : {}),
          brand,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || `Помилка: ${res.status}`)
        setIsSubmitting(false)
        return
      }

      setJobStatus({
        id: data.jobId,
        status: 'running',
        stepLabel: 'Запуск генерації...',
        currentStep: 1,
        totalSteps: 3,
      })
      pollJobStatus(data.jobId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка')
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setIsSubmitting(false)
    setJobStatus(null)
    setError('')
  }

  const isRunning = jobStatus?.status === 'running'
  const isCompleted = jobStatus?.status === 'completed'
  const isFailed = jobStatus?.status === 'failed'

  let payloadId: string | null = null
  if (isCompleted && jobStatus) {
    if (jobStatus.targetName) {
      payloadId = jobStatus.targetName
    } else if (jobStatus.output) {
      try {
        const lines = jobStatus.output.trim().split('\n')
        const lastLine = lines[lines.length - 1]
        const parsed = JSON.parse(lastLine)
        if (parsed.payloadId) payloadId = parsed.payloadId
      } catch {
        // ignore
      }
    }
  }

  const progressPercent =
    jobStatus?.totalSteps && jobStatus?.currentStep
      ? Math.round((jobStatus.currentStep / jobStatus.totalSteps) * 100)
      : 0

  return (
    <div className="dashboard__section">
      <div className="dashboard__section-header">
        <h2>Генерація статті</h2>
      </div>

      <div className="gen-article">
        <p className="gen-article__description">
          Створіть нову статтю, вказавши тему та параметри. Стаття буде згенерована за допомогою AI
          та збережена як чернетка.
        </p>

        {/* Success */}
        {isCompleted && (
          <div className="gen-article__result gen-article__result--success">
            <strong>Статтю згенеровано!</strong>
            <p>Стаття збережена як чернетка та готова до перевірки.</p>
            <div className="gen-article__result-actions">
              {payloadId && (
                <a
                  href={`/admin/collections/articles/${payloadId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dashboard__action dashboard__action--primary"
                >
                  Відкрити в CMS
                </a>
              )}
              <button onClick={handleReset} className="dashboard__action">
                Створити ще
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {(isFailed || error) && (
          <div className="gen-article__result gen-article__result--error">
            <strong>Помилка генерації</strong>
            <p>{jobStatus?.error || error}</p>
            <button onClick={handleReset} className="dashboard__action">
              Спробувати знову
            </button>
          </div>
        )}

        {/* Progress */}
        {isRunning && jobStatus && (
          <div className="gen-article__progress">
            <div className="gen-article__progress-header">
              <span className="gen-article__spinner" />
              <span>{jobStatus.stepLabel || 'Генерація...'}</span>
            </div>
            {jobStatus.totalSteps && (
              <div className="gen-article__progress-bar">
                <div
                  className="gen-article__progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Form */}
        {!isCompleted && !isFailed && (
          <form onSubmit={handleSubmit} className="gen-article__form">
            <div className="gen-article__field">
              <label htmlFor="ga-topic">Тема статті *</label>
              <textarea
                id="ga-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Наприклад: Як обрати зимові шини для SUV у 2026 році"
                required
                minLength={10}
                maxLength={500}
                rows={3}
                disabled={isRunning}
              />
              <span className="gen-article__hint">{topic.length}/500 символів (мінімум 10)</span>
            </div>

            <div className="gen-article__row">
              <div className="gen-article__field">
                <label htmlFor="ga-type">Тип статті *</label>
                <select
                  id="ga-type"
                  value={articleType}
                  onChange={(e) => setArticleType(e.target.value as ArticleType)}
                  disabled={isRunning}
                >
                  {ARTICLE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="gen-article__field">
                <label htmlFor="ga-brand">Бренд</label>
                <select
                  id="ga-brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value as 'bridgestone' | 'firestone')}
                  disabled={isRunning}
                >
                  <option value="bridgestone">Bridgestone</option>
                  <option value="firestone">Firestone</option>
                </select>
              </div>
            </div>

            <div className="gen-article__field">
              <label htmlFor="ga-keywords">Ключові слова</label>
              <input
                id="ga-keywords"
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="зимові шини, SUV, безпека"
                disabled={isRunning}
              />
              <span className="gen-article__hint">
                Через кому. Будуть додані до автоматичних ключових слів.
              </span>
            </div>

            <div className="gen-article__field">
              <label htmlFor="ga-tyres">Пов&#39;язані шини (slugs)</label>
              <input
                id="ga-tyres"
                type="text"
                value={relatedTyres}
                onChange={(e) => setRelatedTyres(e.target.value)}
                placeholder="blizzak-lm005, turanza-t005"
                disabled={isRunning}
              />
              <span className="gen-article__hint">
                Через кому. Slug моделей шин з CMS для автоматичного зв&#39;язування.
              </span>
            </div>

            <button
              type="submit"
              disabled={isRunning || isSubmitting || topic.trim().length < 10}
              className="dashboard__action dashboard__action--primary"
            >
              {isRunning ? 'Генерація...' : 'Згенерувати статтю'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .gen-article {
          padding: 1rem;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-100);
          border-radius: 8px;
        }

        .gen-article__description {
          font-size: 0.8125rem;
          color: var(--theme-elevation-800);
          margin: 0 0 1rem 0;
        }

        .gen-article__form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .gen-article__row {
          display: flex;
          gap: 1rem;
        }

        .gen-article__row .gen-article__field {
          flex: 1;
        }

        .gen-article__field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .gen-article__field label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--theme-text);
        }

        .gen-article__field input,
        .gen-article__field select,
        .gen-article__field textarea {
          padding: 0.5rem 0.625rem;
          font-size: 0.8125rem;
          background: var(--theme-elevation-0);
          border: 1px solid var(--theme-elevation-200);
          border-radius: 4px;
          color: var(--theme-text);
          font-family: inherit;
          resize: vertical;
        }

        .gen-article__field input:focus,
        .gen-article__field select:focus,
        .gen-article__field textarea:focus {
          outline: none;
          border-color: var(--theme-elevation-400);
        }

        .gen-article__field input:disabled,
        .gen-article__field select:disabled,
        .gen-article__field textarea:disabled {
          opacity: 0.5;
        }

        .gen-article__hint {
          font-size: 0.75rem;
          color: var(--theme-elevation-600);
        }

        .gen-article__progress {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: var(--theme-elevation-0);
          border: 1px solid var(--theme-elevation-150);
          border-radius: 6px;
        }

        .gen-article__progress-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--theme-text);
          margin-bottom: 0.5rem;
        }

        .gen-article__spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid var(--theme-elevation-200);
          border-top-color: var(--theme-text);
          border-radius: 50%;
          animation: gen-article-spin 0.8s linear infinite;
        }

        @keyframes gen-article-spin {
          to { transform: rotate(360deg); }
        }

        .gen-article__progress-bar {
          height: 8px;
          background: var(--theme-elevation-150);
          border-radius: 4px;
          overflow: hidden;
        }

        .gen-article__progress-fill {
          height: 100%;
          background: #E31837;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .gen-article__result {
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .gen-article__result strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .gen-article__result p {
          margin: 0 0 0.5rem 0;
          font-size: 0.8125rem;
        }

        .gen-article__result--success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
        }

        .gen-article__result--error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .gen-article__result-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  )
}

export default GenerateArticleSection
