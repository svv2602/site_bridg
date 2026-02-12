'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'

interface Article {
  id: number
  title: string
  slug: string
  hasImage: boolean
  imageUrl?: string
  tags: string[]
}

interface JobStatus {
  id: string
  status: 'running' | 'completed' | 'failed'
  stepLabel?: string
  currentStep?: number
  totalSteps?: number
  error?: string
  output?: string
}

interface BatchResult {
  success: number
  failed: number
  results: Array<{ articleId: number; success: boolean; error?: string }>
}

export const BatchHeroRegenSection: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [filterText, setFilterText] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'with-image' | 'without-image'>('all')

  const [generating, setGenerating] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null)
  const [error, setError] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadArticles = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await fetch('/api/image-regeneration/batch-heroes/list', {
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setArticles(data.data?.articles || [])
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Не вдалося завантажити')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArticles()
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [loadArticles])

  // Poll job status
  useEffect(() => {
    if (!jobId || !generating) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/content/job/${jobId}`, { credentials: 'include' })
        if (!res.ok) return
        const data: JobStatus = await res.json()
        setJobStatus(data)

        if (data.status !== 'running') {
          setGenerating(false)
          clearInterval(interval)

          if (data.status === 'completed' && data.output) {
            try {
              const result: BatchResult = JSON.parse(data.output)
              setBatchResult(result)
            } catch {
              // ignore parse error
            }
          }

          setTimeout(loadArticles, 1000)
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000)

    pollRef.current = interval
    return () => clearInterval(interval)
  }, [jobId, generating, loadArticles])

  const filteredArticles = articles.filter((a) => {
    const matchesText =
      !filterText ||
      a.title.toLowerCase().includes(filterText.toLowerCase()) ||
      a.slug.toLowerCase().includes(filterText.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(filterText.toLowerCase()))

    const matchesFilter =
      filterMode === 'all' ||
      (filterMode === 'with-image' && a.hasImage) ||
      (filterMode === 'without-image' && !a.hasImage)

    return matchesText && matchesFilter
  })

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelected(new Set(filteredArticles.map((a) => a.id)))
  }

  const deselectAll = () => {
    setSelected(new Set())
  }

  const handleRegenerate = async () => {
    if (selected.size === 0) return

    setGenerating(true)
    setError('')
    setJobStatus(null)
    setBatchResult(null)

    try {
      const res = await fetch('/api/image-regeneration/batch-heroes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleIds: Array.from(selected) }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || `Помилка: ${res.status}`)
        setGenerating(false)
        return
      }

      const id = data.data?.jobId || data.jobId
      setJobId(id)
      setJobStatus({
        id,
        status: 'running',
        stepLabel: 'Підготовка...',
        currentStep: 0,
        totalSteps: selected.size,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка')
      setGenerating(false)
    }
  }

  const handleReset = () => {
    setGenerating(false)
    setJobStatus(null)
    setBatchResult(null)
    setError('')
    setSelected(new Set())
    loadArticles()
  }

  const isCompleted = jobStatus?.status === 'completed'
  const isFailed = jobStatus?.status === 'failed'
  const estimatedCost = (selected.size * 0.04).toFixed(2)
  const progressPercent =
    jobStatus?.totalSteps && jobStatus.totalSteps > 0 && jobStatus?.currentStep != null
      ? Math.round((jobStatus.currentStep / jobStatus.totalSteps) * 100)
      : 0

  return (
    <div className="dashboard__section">
      <div className="dashboard__section-header">
        <h2>Перегенерація hero-зображень</h2>
        <button onClick={loadArticles} className="dashboard__refresh-btn" title="Оновити">
          ↻
        </button>
      </div>

      <div className="batch-heroes">
        {/* Success */}
        {isCompleted && batchResult && (
          <div className="batch-heroes__result batch-heroes__result--success">
            <strong>Генерацію завершено!</strong>
            <p>
              Успішно: {batchResult.success}, помилок: {batchResult.failed}
            </p>
            {batchResult.results.some((r) => !r.success) && (
              <details className="batch-heroes__error-details">
                <summary>Показати помилки ({batchResult.failed})</summary>
                <ul>
                  {batchResult.results
                    .filter((r) => !r.success)
                    .map((r) => (
                      <li key={r.articleId}>
                        ID {r.articleId}: {r.error}
                      </li>
                    ))}
                </ul>
              </details>
            )}
            <button onClick={handleReset} className="dashboard__action dashboard__action--primary">
              Згенерувати ще
            </button>
          </div>
        )}

        {/* Error */}
        {(isFailed || error) && (
          <div className="batch-heroes__result batch-heroes__result--error">
            <strong>Помилка</strong>
            <p>{jobStatus?.error || error}</p>
            <button onClick={handleReset} className="dashboard__action">
              Спробувати знову
            </button>
          </div>
        )}

        {/* Progress */}
        {generating && jobStatus && (
          <div className="batch-heroes__progress">
            <div className="batch-heroes__progress-header">
              <span className="batch-heroes__spinner" />
              <span>{jobStatus.stepLabel || 'Генерація...'}</span>
            </div>
            <div className="batch-heroes__progress-bar">
              <div
                className="batch-heroes__progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="batch-heroes__progress-text">{progressPercent}%</div>
          </div>
        )}

        {/* Filters & table (hide during progress/result) */}
        {!generating && !isCompleted && !isFailed && (
          <>
            {/* Filters */}
            <div className="batch-heroes__controls">
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Пошук за назвою, slug або тегами..."
                className="batch-heroes__search"
              />
              <select
                value={filterMode}
                onChange={(e) =>
                  setFilterMode(e.target.value as 'all' | 'with-image' | 'without-image')
                }
                className="batch-heroes__filter-select"
              >
                <option value="all">Всі статті</option>
                <option value="with-image">З зображенням</option>
                <option value="without-image">Без зображення</option>
              </select>
            </div>

            {/* Selection controls */}
            <div className="batch-heroes__select-actions">
              <button onClick={selectAll} className="dashboard__action">
                Обрати всі ({filteredArticles.length})
              </button>
              <button onClick={deselectAll} className="dashboard__action">
                Зняти вибір
              </button>
              <span className="batch-heroes__count">Обрано: {selected.size}</span>
            </div>

            {/* Loading */}
            {loading && <div className="batch-heroes__loading">Завантаження статей...</div>}

            {/* Load error */}
            {loadError && (
              <div className="batch-heroes__result batch-heroes__result--error">
                <p>{loadError}</p>
                <button onClick={loadArticles} className="dashboard__action">
                  Спробувати знову
                </button>
              </div>
            )}

            {/* Table */}
            {!loading && !loadError && (
              <div className="batch-heroes__table-wrap">
                <table className="batch-heroes__table">
                  <thead>
                    <tr>
                      <th className="batch-heroes__th-check">
                        <input
                          type="checkbox"
                          checked={
                            filteredArticles.length > 0 &&
                            filteredArticles.every((a) => selected.has(a.id))
                          }
                          onChange={(e) => {
                            if (e.target.checked) selectAll()
                            else deselectAll()
                          }}
                        />
                      </th>
                      <th className="batch-heroes__th-image">Фото</th>
                      <th>Назва</th>
                      <th>Теги</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticles.map((article) => (
                      <tr
                        key={article.id}
                        className={selected.has(article.id) ? 'batch-heroes__row--selected' : ''}
                        onClick={() => toggleSelect(article.id)}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.has(article.id)}
                            onChange={() => toggleSelect(article.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td>
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt=""
                              className="batch-heroes__thumbnail"
                            />
                          ) : (
                            <div className="batch-heroes__no-image">--</div>
                          )}
                        </td>
                        <td>
                          <div className="batch-heroes__td-title">{article.title}</div>
                          <div className="batch-heroes__td-slug">{article.slug}</div>
                        </td>
                        <td>
                          <div className="batch-heroes__tags">
                            {article.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="batch-heroes__tag">
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 3 && (
                              <span className="batch-heroes__tag-more">
                                +{article.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredArticles.length === 0 && (
                      <tr>
                        <td colSpan={4} className="batch-heroes__empty">
                          Статей не знайдено
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Action bar */}
            {selected.size > 0 && (
              <div className="batch-heroes__action-bar">
                <button
                  onClick={handleRegenerate}
                  disabled={generating}
                  className="dashboard__action dashboard__action--primary"
                >
                  {generating
                    ? 'Запуск...'
                    : `Перегенерувати ${selected.size} зображень`}
                </button>
                <span className="batch-heroes__cost">
                  Орієнтовна вартість: ~${estimatedCost} ({selected.size} x $0.04)
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .batch-heroes {
          padding: 1rem;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-100);
          border-radius: 8px;
        }

        .batch-heroes__controls {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .batch-heroes__search {
          flex: 1;
          padding: 0.5rem 0.625rem;
          font-size: 0.8125rem;
          background: var(--theme-elevation-0);
          border: 1px solid var(--theme-elevation-200);
          border-radius: 4px;
          color: var(--theme-text);
        }

        .batch-heroes__search:focus {
          outline: none;
          border-color: var(--theme-elevation-400);
        }

        .batch-heroes__filter-select {
          padding: 0.5rem 0.625rem;
          font-size: 0.8125rem;
          background: var(--theme-elevation-0);
          border: 1px solid var(--theme-elevation-200);
          border-radius: 4px;
          color: var(--theme-text);
        }

        .batch-heroes__select-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .batch-heroes__count {
          font-size: 0.8125rem;
          color: var(--theme-elevation-800);
          margin-left: auto;
        }

        .batch-heroes__loading {
          color: var(--theme-elevation-800);
          font-size: 0.875rem;
          font-style: italic;
          padding: 1rem 0;
        }

        .batch-heroes__table-wrap {
          overflow-x: auto;
          max-height: 500px;
          overflow-y: auto;
        }

        .batch-heroes__table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }

        .batch-heroes__table thead {
          position: sticky;
          top: 0;
          background: var(--theme-elevation-50);
          z-index: 1;
        }

        .batch-heroes__table th {
          text-align: left;
          padding: 0.5rem;
          border-bottom: 2px solid var(--theme-elevation-200);
          color: var(--theme-elevation-800);
          font-weight: 600;
          white-space: nowrap;
        }

        .batch-heroes__th-check {
          width: 32px;
        }

        .batch-heroes__th-image {
          width: 60px;
        }

        .batch-heroes__table td {
          padding: 0.5rem;
          border-bottom: 1px solid var(--theme-elevation-100);
          color: var(--theme-text);
        }

        .batch-heroes__table tbody tr {
          cursor: pointer;
        }

        .batch-heroes__table tbody tr:hover {
          background: var(--theme-elevation-100);
        }

        .batch-heroes__row--selected {
          background: var(--theme-elevation-75);
        }

        .batch-heroes__thumbnail {
          width: 48px;
          height: 32px;
          object-fit: cover;
          border-radius: 3px;
        }

        .batch-heroes__no-image {
          width: 48px;
          height: 32px;
          background: var(--theme-elevation-150);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--theme-elevation-500);
          font-size: 0.75rem;
        }

        .batch-heroes__td-title {
          font-weight: 500;
          max-width: 350px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .batch-heroes__td-slug {
          font-size: 0.75rem;
          color: var(--theme-elevation-600);
        }

        .batch-heroes__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .batch-heroes__tag {
          display: inline-block;
          padding: 0.125rem 0.5rem;
          background: var(--theme-elevation-150);
          border-radius: 9999px;
          font-size: 0.75rem;
          color: var(--theme-elevation-800);
        }

        .batch-heroes__tag-more {
          font-size: 0.75rem;
          color: var(--theme-elevation-500);
        }

        .batch-heroes__empty {
          text-align: center;
          color: var(--theme-elevation-600);
          font-style: italic;
          padding: 1.5rem !important;
        }

        .batch-heroes__action-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--theme-elevation-100);
        }

        .batch-heroes__cost {
          font-size: 0.75rem;
          color: var(--theme-elevation-600);
        }

        .batch-heroes__progress {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: var(--theme-elevation-0);
          border: 1px solid var(--theme-elevation-150);
          border-radius: 6px;
        }

        .batch-heroes__progress-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--theme-text);
          margin-bottom: 0.5rem;
        }

        .batch-heroes__spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid var(--theme-elevation-200);
          border-top-color: var(--theme-text);
          border-radius: 50%;
          animation: batch-heroes-spin 0.8s linear infinite;
        }

        @keyframes batch-heroes-spin {
          to { transform: rotate(360deg); }
        }

        .batch-heroes__progress-bar {
          height: 8px;
          background: var(--theme-elevation-150);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.375rem;
        }

        .batch-heroes__progress-fill {
          height: 100%;
          background: #E31837;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .batch-heroes__progress-text {
          font-size: 0.8125rem;
          color: var(--theme-elevation-800);
        }

        .batch-heroes__result {
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .batch-heroes__result strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .batch-heroes__result p {
          margin: 0 0 0.5rem 0;
          font-size: 0.8125rem;
        }

        .batch-heroes__result--success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
        }

        .batch-heroes__result--error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .batch-heroes__error-details {
          margin: 0.5rem 0;
        }

        .batch-heroes__error-details summary {
          cursor: pointer;
          font-size: 0.8125rem;
          color: #dc2626;
        }

        .batch-heroes__error-details ul {
          margin: 0.375rem 0 0 1rem;
          padding: 0;
          list-style: disc;
        }

        .batch-heroes__error-details li {
          font-size: 0.75rem;
          color: #dc2626;
        }
      `}</style>
    </div>
  )
}

export default BatchHeroRegenSection
