'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

type ArticleType =
  | 'seasonal-guide'
  | 'model-review'
  | 'test-summary'
  | 'comparison'
  | 'technology'
  | 'tips';

interface JobStatus {
  id: string;
  status: 'running' | 'completed' | 'failed';
  stepLabel?: string;
  currentStep?: number;
  totalSteps?: number;
  error?: string;
  output?: string;
  targetName?: string; // payloadId on success
}

const ARTICLE_TYPES: { value: ArticleType; label: string }[] = [
  { value: 'seasonal-guide', label: 'Сезонний гід' },
  { value: 'model-review', label: 'Огляд моделі' },
  { value: 'test-summary', label: 'Підсумок тесту' },
  { value: 'comparison', label: 'Порівняння' },
  { value: 'technology', label: 'Технологія' },
  { value: 'tips', label: 'Поради' },
];

const PAYLOAD_ADMIN_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';

export default function GenerateArticlePage() {
  const [topic, setTopic] = useState('');
  const [articleType, setArticleType] = useState<ArticleType>('seasonal-guide');
  const [keywords, setKeywords] = useState('');
  const [brand, setBrand] = useState<'bridgestone' | 'firestone'>('bridgestone');
  const [relatedTyres, setRelatedTyres] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

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
        }
      } catch {
        // Ignore polling errors — will retry
      }
    }, 3000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setJobStatus(null);

    const keywordsArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const relatedTyresArray = relatedTyres
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/admin/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          articleType,
          ...(keywordsArray.length ? { keywords: keywordsArray } : {}),
          ...(relatedTyresArray.length ? { relatedTyres: relatedTyresArray } : {}),
          brand,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || `Помилка: ${res.status}`);
        setIsSubmitting(false);
        return;
      }

      // Start polling
      setJobStatus({
        id: data.jobId,
        status: 'running',
        stepLabel: 'Запуск генерації...',
        currentStep: 1,
        totalSteps: 3,
      });
      pollJobStatus(data.jobId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Невідома помилка');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitting(false);
    setJobStatus(null);
    setErrorMessage('');
  };

  const isRunning = jobStatus?.status === 'running';
  const isCompleted = jobStatus?.status === 'completed';
  const isFailed = jobStatus?.status === 'failed';

  // Extract payloadId from targetName or output
  let payloadId: string | null = null;
  if (isCompleted && jobStatus) {
    if (jobStatus.targetName) {
      payloadId = jobStatus.targetName;
    } else if (jobStatus.output) {
      try {
        const lines = jobStatus.output.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const parsed = JSON.parse(lastLine);
        if (parsed.payloadId) payloadId = parsed.payloadId;
      } catch {
        // ignore
      }
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Генерація статті
        </h1>
        <p className="text-stone-600 dark:text-stone-400 mb-8">
          Створіть нову статтю, вказавши тему та параметри. Стаття буде згенерована за допомогою AI
          та збережена як чернетка для перевірки.
        </p>

        {/* Success message */}
        {isCompleted && (
          <div className="mb-6 rounded-lg border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/50 p-4">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">
              Статтю згенеровано!
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm mb-3">
              Стаття збережена як чернетка та готова до перевірки.
            </p>
            {payloadId && (
              <a
                href={`${PAYLOAD_ADMIN_URL}/admin/collections/articles/${payloadId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-md bg-green-700 dark:bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 dark:hover:bg-green-700 transition-colors"
              >
                Відкрити в CMS
              </a>
            )}
            <button
              onClick={handleReset}
              className="ml-3 inline-block rounded-md bg-stone-200 dark:bg-stone-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
            >
              Створити ще
            </button>
          </div>
        )}

        {/* Error message */}
        {(isFailed || errorMessage) && (
          <div className="mb-6 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/50 p-4">
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
              Помилка генерації
            </h3>
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

        {/* Progress indicator */}
        {isRunning && jobStatus && (
          <div className="mb-6 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 dark:border-stone-600 border-t-stone-700 dark:border-t-stone-300" />
              <span className="font-medium text-stone-800 dark:text-stone-200">
                {jobStatus.stepLabel || 'Генерація...'}
              </span>
            </div>
            {jobStatus.totalSteps && (
              <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2">
                <div
                  className="bg-stone-600 dark:bg-stone-400 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${((jobStatus.currentStep || 1) / jobStatus.totalSteps) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 space-y-5"
        >
          {/* Topic */}
          <div>
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              Тема статті *
            </label>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Наприклад: Як обрати зимові шини для SUV у 2026 році"
              required
              minLength={10}
              maxLength={500}
              rows={3}
              disabled={isRunning}
              className="w-full rounded-md border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-stone-500 dark:focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              {topic.length}/500 символів (мінімум 10)
            </p>
          </div>

          {/* Article Type */}
          <div>
            <label
              htmlFor="articleType"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              Тип статті *
            </label>
            <select
              id="articleType"
              value={articleType}
              onChange={(e) => setArticleType(e.target.value as ArticleType)}
              disabled={isRunning}
              className="w-full rounded-md border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-stone-900 dark:text-stone-100 focus:border-stone-500 dark:focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 disabled:opacity-50"
            >
              {ARTICLE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label
              htmlFor="brand"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              Бренд
            </label>
            <select
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value as 'bridgestone' | 'firestone')}
              disabled={isRunning}
              className="w-full rounded-md border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-stone-900 dark:text-stone-100 focus:border-stone-500 dark:focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 disabled:opacity-50"
            >
              <option value="bridgestone">Bridgestone</option>
              <option value="firestone">Firestone</option>
            </select>
          </div>

          {/* Keywords */}
          <div>
            <label
              htmlFor="keywords"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              Ключові слова
            </label>
            <input
              id="keywords"
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="зимові шини, SUV, безпека"
              disabled={isRunning}
              className="w-full rounded-md border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-stone-500 dark:focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Через кому. Будуть додані до автоматичних ключових слів.
            </p>
          </div>

          {/* Related Tyres */}
          <div>
            <label
              htmlFor="relatedTyres"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              Пов&apos;язані шини (slugs)
            </label>
            <input
              id="relatedTyres"
              type="text"
              value={relatedTyres}
              onChange={(e) => setRelatedTyres(e.target.value)}
              placeholder="blizzak-lm005, turanza-t005"
              disabled={isRunning}
              className="w-full rounded-md border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-stone-500 dark:focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Через кому. Slug моделей шин з CMS для автоматичного зв&apos;язування.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isRunning || isSubmitting || topic.trim().length < 10}
            className="w-full rounded-md bg-stone-800 dark:bg-stone-200 px-4 py-2.5 text-sm font-medium text-white dark:text-stone-900 hover:bg-stone-900 dark:hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Генерація...' : 'Згенерувати статтю'}
          </button>
        </form>
      </div>
    </div>
  );
}
