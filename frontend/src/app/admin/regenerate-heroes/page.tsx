'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface Article {
  id: number;
  title: string;
  slug: string;
  hasImage: boolean;
  imageUrl?: string;
  tags: string[];
}

interface JobStatus {
  id: string;
  status: 'running' | 'completed' | 'failed';
  stepLabel?: string;
  currentStep?: number;
  totalSteps?: number;
  error?: string;
  output?: string;
}

interface BatchResult {
  success: number;
  failed: number;
  results: Array<{ articleId: number; success: boolean; error?: string }>;
}

const PAYLOAD_ADMIN_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';

export default function RegenerateHeroesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filterText, setFilterText] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'with-image' | 'without-image'>('all');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load articles on mount
  useEffect(() => {
    loadArticles();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/admin/regenerate-heroes/list');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setArticles(data.data?.articles || []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = articles.filter((a) => {
    const matchesText =
      !filterText ||
      a.title.toLowerCase().includes(filterText.toLowerCase()) ||
      a.slug.toLowerCase().includes(filterText.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(filterText.toLowerCase()));

    const matchesFilter =
      filterMode === 'all' ||
      (filterMode === 'with-image' && a.hasImage) ||
      (filterMode === 'without-image' && !a.hasImage);

    return matchesText && matchesFilter;
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredArticles.map((a) => a.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const pollJobStatus = useCallback((jobId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/job/${jobId}`);
        if (!res.ok) return;
        const data: JobStatus = await res.json();
        setJobStatus(data);

        if (data.status !== 'running') {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          setIsSubmitting(false);

          // Parse result
          if (data.status === 'completed' && data.output) {
            try {
              const result: BatchResult = JSON.parse(data.output);
              setBatchResult(result);
            } catch {
              // ignore parse error
            }
          }
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000);
  }, []);

  const handleRegenerate = async () => {
    if (selectedIds.size === 0) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setJobStatus(null);
    setBatchResult(null);

    try {
      const res = await fetch('/api/admin/regenerate-heroes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleIds: Array.from(selectedIds) }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || `Помилка: ${res.status}`);
        setIsSubmitting(false);
        return;
      }

      const jobId = data.data?.jobId || data.jobId;
      setJobStatus({
        id: jobId,
        status: 'running',
        stepLabel: 'Підготовка...',
        currentStep: 0,
        totalSteps: selectedIds.size,
      });
      pollJobStatus(jobId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Невідома помилка');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitting(false);
    setJobStatus(null);
    setBatchResult(null);
    setErrorMessage('');
    setSelectedIds(new Set());
    loadArticles();
  };

  const isRunning = jobStatus?.status === 'running';
  const isCompleted = jobStatus?.status === 'completed';
  const isFailed = jobStatus?.status === 'failed';
  const estimatedCost = (selectedIds.size * 0.04).toFixed(2);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Перегенерація hero-зображень
        </h1>
        <p className="text-stone-600 dark:text-stone-400 mb-8">
          Виберіть статті та згенеруйте нові унікальні hero-зображення з різноманітними
          композиціями.
        </p>

        {/* Success */}
        {isCompleted && batchResult && (
          <div className="mb-6 rounded-lg border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/50 p-4">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">
              Генерацію завершено!
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm mb-3">
              Успішно: {batchResult.success}, помилок: {batchResult.failed}
            </p>
            {batchResult.results.some((r) => !r.success) && (
              <details className="mb-3">
                <summary className="text-sm text-red-700 dark:text-red-300 cursor-pointer">
                  Показати помилки ({batchResult.failed})
                </summary>
                <ul className="mt-2 space-y-1">
                  {batchResult.results
                    .filter((r) => !r.success)
                    .map((r) => (
                      <li key={r.articleId} className="text-xs text-red-600 dark:text-red-400">
                        ID {r.articleId}: {r.error}
                      </li>
                    ))}
                </ul>
              </details>
            )}
            <button
              onClick={handleReset}
              className="inline-block rounded-md bg-green-700 dark:bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 dark:hover:bg-green-700 transition-colors"
            >
              Згенерувати ще
            </button>
          </div>
        )}

        {/* Error */}
        {(isFailed || errorMessage) && (
          <div className="mb-6 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/50 p-4">
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Помилка</h3>
            <p className="text-red-700 dark:text-red-300 text-sm">
              {jobStatus?.error || errorMessage}
            </p>
            <button
              onClick={handleReset}
              className="mt-3 inline-block rounded-md bg-red-700 dark:bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 dark:hover:bg-red-700 transition-colors"
            >
              Спробувати знову
            </button>
          </div>
        )}

        {/* Progress */}
        {isRunning && jobStatus && (
          <div className="mb-6 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 dark:border-stone-600 border-t-stone-700 dark:border-t-stone-300" />
              <span className="font-medium text-stone-800 dark:text-stone-200">
                {jobStatus.stepLabel || 'Генерація...'}
              </span>
            </div>
            {jobStatus.totalSteps && jobStatus.totalSteps > 0 && (
              <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2">
                <div
                  className="bg-stone-600 dark:bg-stone-400 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${((jobStatus.currentStep || 0) / jobStatus.totalSteps) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Filters & controls */}
        {!isRunning && !isCompleted && !isFailed && (
          <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6">
            {/* Search + filter row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Пошук за назвою, slug або тегами..."
                className="flex-1 rounded-md border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-stone-500 dark:focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400"
              />
              <select
                value={filterMode}
                onChange={(e) =>
                  setFilterMode(e.target.value as 'all' | 'with-image' | 'without-image')
                }
                className="rounded-md border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 focus:border-stone-500 dark:focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400"
              >
                <option value="all">Всі статті</option>
                <option value="with-image">З зображенням</option>
                <option value="without-image">Без зображення</option>
              </select>
            </div>

            {/* Selection controls */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={selectAll}
                className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 underline"
              >
                Обрати всі ({filteredArticles.length})
              </button>
              <button
                onClick={deselectAll}
                className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 underline"
              >
                Зняти вибір
              </button>
              <span className="text-sm text-stone-500 dark:text-stone-400 ml-auto">
                Обрано: {selectedIds.size}
              </span>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 dark:border-stone-600 border-t-stone-700 dark:border-t-stone-300" />
                <span className="ml-3 text-stone-600 dark:text-stone-400">
                  Завантаження статей...
                </span>
              </div>
            )}

            {/* Load error */}
            {loadError && (
              <div className="py-8 text-center">
                <p className="text-red-600 dark:text-red-400 text-sm mb-3">{loadError}</p>
                <button
                  onClick={loadArticles}
                  className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 underline"
                >
                  Спробувати знову
                </button>
              </div>
            )}

            {/* Article table */}
            {!isLoading && !loadError && (
              <div className="border border-stone-200 dark:border-stone-700 rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-100 dark:bg-stone-800">
                      <th className="w-10 px-3 py-2 text-left">
                        <input
                          type="checkbox"
                          checked={
                            filteredArticles.length > 0 &&
                            filteredArticles.every((a) => selectedIds.has(a.id))
                          }
                          onChange={(e) => {
                            if (e.target.checked) selectAll();
                            else deselectAll();
                          }}
                          className="rounded border-stone-400 dark:border-stone-500"
                        />
                      </th>
                      <th className="w-16 px-3 py-2 text-left text-stone-600 dark:text-stone-400 font-medium">
                        Фото
                      </th>
                      <th className="px-3 py-2 text-left text-stone-600 dark:text-stone-400 font-medium">
                        Назва
                      </th>
                      <th className="px-3 py-2 text-left text-stone-600 dark:text-stone-400 font-medium hidden md:table-cell">
                        Теги
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                    {filteredArticles.map((article) => (
                      <tr
                        key={article.id}
                        onClick={() => toggleSelect(article.id)}
                        className={`cursor-pointer transition-colors ${
                          selectedIds.has(article.id)
                            ? 'bg-stone-100 dark:bg-stone-800/60'
                            : 'hover:bg-stone-50 dark:hover:bg-stone-800/30'
                        }`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(article.id)}
                            onChange={() => toggleSelect(article.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-stone-400 dark:border-stone-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt=""
                              className="w-12 h-8 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-8 rounded bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
                              <span className="text-stone-400 dark:text-stone-500 text-xs">--</span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-stone-900 dark:text-stone-100 font-medium line-clamp-1">
                            {article.title}
                          </div>
                          <div className="text-stone-500 dark:text-stone-400 text-xs">
                            {article.slug}
                          </div>
                        </td>
                        <td className="px-3 py-2 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {article.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-block rounded-full bg-stone-200 dark:bg-stone-700 px-2 py-0.5 text-xs text-stone-600 dark:text-stone-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 3 && (
                              <span className="text-xs text-stone-400 dark:text-stone-500">
                                +{article.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredArticles.length === 0 && (
                  <div className="py-8 text-center text-stone-500 dark:text-stone-400 text-sm">
                    Статей не знайдено
                  </div>
                )}
              </div>
            )}

            {/* Action bar */}
            {selectedIds.size > 0 && (
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
                <button
                  onClick={handleRegenerate}
                  disabled={isSubmitting}
                  className="rounded-md bg-stone-800 dark:bg-stone-200 px-5 py-2.5 text-sm font-medium text-white dark:text-stone-900 hover:bg-stone-900 dark:hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? 'Запуск...'
                    : `Перегенерувати ${selectedIds.size} зображень`}
                </button>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Орієнтовна вартість: ~${estimatedCost} ({selectedIds.size} x $0.04)
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
