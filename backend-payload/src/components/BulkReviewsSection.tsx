'use client'

import React, { useEffect, useState, useCallback } from 'react'

interface TyreStat {
  id: number
  name: string
  brand: string
  season: string
  reviewCount: number
  averageRating: number
}

interface BulkStatsSummary {
  totalTyres: number
  totalReviews: number
  tyresWithoutReviews: number
}

interface BatchJobStatus {
  id: string
  status: 'running' | 'completed' | 'failed'
  currentStep?: number
  totalSteps?: number
  stepLabel?: string
  error?: string
  output?: string
  progress?: {
    totalTyres: number
    completedTyres: number
    failedTyres: number
    totalReviewsCreated: number
    errors: Array<{ tyreId: number; error: string }>
  }
}

const SEASON_LABELS: Record<string, string> = {
  summer: 'Літня',
  winter: 'Зимова',
  allseason: 'Всесезонна',
}

export const BulkReviewsSection: React.FC = () => {
  const [tyres, setTyres] = useState<TyreStat[]>([])
  const [summary, setSummary] = useState<BulkStatsSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [reviewCount, setReviewCount] = useState(3)
  const [generating, setGenerating] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<BatchJobStatus | null>(null)
  const [filter, setFilter] = useState<'all' | 'no-reviews'>('all')
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/reviews/bulk-stats', { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const data = json.data || json
      setTyres(data.tyres || [])
      setSummary(data.summary || null)
    } catch (err) {
      setError(`Не вдалося завантажити: ${err}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Poll job status
  useEffect(() => {
    if (!jobId || !generating) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/reviews/generate/batch/status/${jobId}`, {
          credentials: 'include',
        })
        if (!res.ok) return
        const status: BatchJobStatus = await res.json()
        setJobStatus(status)

        if (status.status === 'completed' || status.status === 'failed') {
          setGenerating(false)
          clearInterval(interval)
          // Refresh stats after completion
          setTimeout(fetchStats, 1000)
        }
      } catch {
        // Ignore polling errors
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [jobId, generating, fetchStats])

  const filteredTyres = filter === 'no-reviews'
    ? tyres.filter((t) => t.reviewCount === 0)
    : tyres

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelected(new Set(filteredTyres.map((t) => t.id)))
  }

  const selectNone = () => {
    setSelected(new Set())
  }

  const selectWithoutReviews = () => {
    setSelected(new Set(tyres.filter((t) => t.reviewCount === 0).map((t) => t.id)))
    setFilter('no-reviews')
  }

  const handleGenerate = async () => {
    if (selected.size === 0) return

    setGenerating(true)
    setJobStatus(null)
    setError(null)

    try {
      const items = Array.from(selected).map((tyreId) => ({ tyreId }))
      const res = await fetch('/api/reviews/generate/batch', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, defaultCount: reviewCount }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }

      const json = await res.json()
      const data = json.data || json
      setJobId(data.jobId)
    } catch (err) {
      setError(`Помилка запуску: ${err}`)
      setGenerating(false)
    }
  }

  const progressPercent =
    jobStatus?.totalSteps && jobStatus?.currentStep
      ? Math.round((jobStatus.currentStep / jobStatus.totalSteps) * 100)
      : 0

  return (
    <div className="dashboard__section">
      <div className="dashboard__section-header">
        <h2>Генерація відгуків</h2>
        <button onClick={fetchStats} className="dashboard__refresh-btn" title="Оновити">
          ↻
        </button>
      </div>

      <div className="bulk-reviews">
        {/* Summary cards */}
        {summary && (
          <div className="bulk-reviews__summary">
            <div className="bulk-reviews__stat">
              <span className="bulk-reviews__stat-value">{summary.totalTyres}</span>
              <span className="bulk-reviews__stat-label">Всього шин</span>
            </div>
            <div className="bulk-reviews__stat">
              <span className="bulk-reviews__stat-value">{summary.totalReviews}</span>
              <span className="bulk-reviews__stat-label">Всього відгуків</span>
            </div>
            <div className="bulk-reviews__stat">
              <span className="bulk-reviews__stat-value bulk-reviews__stat-value--warning">
                {summary.tyresWithoutReviews}
              </span>
              <span className="bulk-reviews__stat-label">Без відгуків</span>
            </div>
          </div>
        )}

        {error && <div className="bulk-reviews__error">{error}</div>}

        {/* Controls */}
        <div className="bulk-reviews__controls">
          <div className="bulk-reviews__select-actions">
            <button onClick={selectAll} className="dashboard__action" disabled={generating}>
              Вибрати всі
            </button>
            <button onClick={selectNone} className="dashboard__action" disabled={generating}>
              Скасувати
            </button>
            <button
              onClick={selectWithoutReviews}
              className="dashboard__action"
              disabled={generating}
            >
              Без відгуків
            </button>
            <label className="bulk-reviews__filter">
              <input
                type="checkbox"
                checked={filter === 'no-reviews'}
                onChange={(e) => setFilter(e.target.checked ? 'no-reviews' : 'all')}
              />
              Тільки без відгуків
            </label>
          </div>

          <div className="bulk-reviews__generate-actions">
            <label className="bulk-reviews__count-label">
              Кількість:
              <select
                value={reviewCount}
                onChange={(e) => setReviewCount(Number(e.target.value))}
                className="bulk-reviews__count-select"
                disabled={generating}
              >
                {[1, 2, 3, 5, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={handleGenerate}
              className="dashboard__action dashboard__action--primary"
              disabled={generating || selected.size === 0}
            >
              {generating
                ? 'Генерація...'
                : `Генерувати (${selected.size} шин)`}
            </button>
          </div>
        </div>

        {/* Progress */}
        {generating && jobStatus && (
          <div className="bulk-reviews__progress">
            <div className="bulk-reviews__progress-bar">
              <div
                className="bulk-reviews__progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="bulk-reviews__progress-text">
              {jobStatus.stepLabel || `${progressPercent}%`}
            </div>
          </div>
        )}

        {/* Result */}
        {!generating && jobStatus?.status === 'completed' && jobStatus.progress && (
          <div className="bulk-reviews__result bulk-reviews__result--success">
            Створено {jobStatus.progress.totalReviewsCreated} відгуків для{' '}
            {jobStatus.progress.completedTyres - jobStatus.progress.failedTyres} шин
            {jobStatus.progress.failedTyres > 0 && (
              <span className="bulk-reviews__result-errors">
                {' '}
                ({jobStatus.progress.failedTyres} помилок)
              </span>
            )}
          </div>
        )}

        {!generating && jobStatus?.status === 'failed' && (
          <div className="bulk-reviews__result bulk-reviews__result--error">
            Помилка: {jobStatus.error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bulk-reviews__loading">Завантаження...</div>
        ) : (
          <div className="bulk-reviews__table-wrap">
            <table className="bulk-reviews__table">
              <thead>
                <tr>
                  <th className="bulk-reviews__th-check">
                    <input
                      type="checkbox"
                      checked={
                        filteredTyres.length > 0 &&
                        filteredTyres.every((t) => selected.has(t.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) selectAll()
                        else selectNone()
                      }}
                      disabled={generating}
                    />
                  </th>
                  <th>Назва</th>
                  <th>Бренд</th>
                  <th>Сезон</th>
                  <th>Відгуки</th>
                  <th>Рейтинг</th>
                </tr>
              </thead>
              <tbody>
                {filteredTyres.map((tyre) => (
                  <tr
                    key={tyre.id}
                    className={selected.has(tyre.id) ? 'bulk-reviews__row--selected' : ''}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(tyre.id)}
                        onChange={() => toggleSelect(tyre.id)}
                        disabled={generating}
                      />
                    </td>
                    <td className="bulk-reviews__td-name">{tyre.name}</td>
                    <td>{tyre.brand === 'bridgestone' ? 'Bridgestone' : 'Firestone'}</td>
                    <td>{SEASON_LABELS[tyre.season] || tyre.season}</td>
                    <td className={tyre.reviewCount === 0 ? 'bulk-reviews__td--warning' : ''}>
                      {tyre.reviewCount}
                    </td>
                    <td>
                      {tyre.averageRating > 0 ? `${tyre.averageRating} ★` : '—'}
                    </td>
                  </tr>
                ))}
                {filteredTyres.length === 0 && (
                  <tr>
                    <td colSpan={6} className="bulk-reviews__empty">
                      {filter === 'no-reviews' ? 'Всі шини мають відгуки' : 'Шини не знайдені'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .bulk-reviews {
          padding: 1rem;
          background: var(--theme-elevation-50);
          border: 1px solid var(--theme-elevation-100);
          border-radius: 8px;
        }

        .bulk-reviews__summary {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .bulk-reviews__stat {
          display: flex;
          flex-direction: column;
        }

        .bulk-reviews__stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--theme-text);
        }

        .bulk-reviews__stat-value--warning {
          color: #ea580c;
        }

        .bulk-reviews__stat-label {
          font-size: 0.75rem;
          color: var(--theme-elevation-800);
        }

        .bulk-reviews__error {
          padding: 0.5rem 0.75rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 4px;
          color: #dc2626;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .bulk-reviews__controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .bulk-reviews__select-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .bulk-reviews__filter {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8125rem;
          color: var(--theme-elevation-800);
          cursor: pointer;
        }

        .bulk-reviews__generate-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .bulk-reviews__count-label {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          color: var(--theme-elevation-800);
        }

        .bulk-reviews__count-select {
          padding: 0.375rem 0.5rem;
          font-size: 0.8125rem;
          background: var(--theme-elevation-0);
          border: 1px solid var(--theme-elevation-200);
          border-radius: 4px;
          color: var(--theme-text);
        }

        .bulk-reviews__progress {
          margin-bottom: 1rem;
        }

        .bulk-reviews__progress-bar {
          height: 8px;
          background: var(--theme-elevation-150);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.375rem;
        }

        .bulk-reviews__progress-fill {
          height: 100%;
          background: #E31837;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .bulk-reviews__progress-text {
          font-size: 0.8125rem;
          color: var(--theme-elevation-800);
        }

        .bulk-reviews__result {
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .bulk-reviews__result--success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
        }

        .bulk-reviews__result--error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .bulk-reviews__result-errors {
          color: #ea580c;
        }

        .bulk-reviews__loading {
          color: var(--theme-elevation-800);
          font-size: 0.875rem;
          font-style: italic;
          padding: 1rem 0;
        }

        .bulk-reviews__table-wrap {
          overflow-x: auto;
          max-height: 500px;
          overflow-y: auto;
        }

        .bulk-reviews__table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }

        .bulk-reviews__table thead {
          position: sticky;
          top: 0;
          background: var(--theme-elevation-50);
          z-index: 1;
        }

        .bulk-reviews__table th {
          text-align: left;
          padding: 0.5rem;
          border-bottom: 2px solid var(--theme-elevation-200);
          color: var(--theme-elevation-800);
          font-weight: 600;
          white-space: nowrap;
        }

        .bulk-reviews__th-check {
          width: 32px;
        }

        .bulk-reviews__table td {
          padding: 0.5rem;
          border-bottom: 1px solid var(--theme-elevation-100);
          color: var(--theme-text);
        }

        .bulk-reviews__table tbody tr:hover {
          background: var(--theme-elevation-100);
        }

        .bulk-reviews__row--selected {
          background: var(--theme-elevation-75);
        }

        .bulk-reviews__td-name {
          font-weight: 500;
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bulk-reviews__td--warning {
          color: #ea580c;
          font-weight: 600;
        }

        .bulk-reviews__empty {
          text-align: center;
          color: var(--theme-elevation-600);
          font-style: italic;
          padding: 1.5rem !important;
        }
      `}</style>
    </div>
  )
}

export default BulkReviewsSection
