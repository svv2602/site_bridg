"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface DataUnavailableProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

/**
 * Компонент для відображення стану "Дані тимчасово недоступні"
 * Використовується коли CMS або API недоступні
 */
export function DataUnavailable({
  title = "Дані тимчасово недоступні",
  message = "Не вдалося завантажити інформацію. Спробуйте оновити сторінку або повторити пізніше.",
  onRetry,
  showRetry = true,
}: DataUnavailableProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-stone-100 p-4 dark:bg-stone-800">
        <AlertTriangle className="h-8 w-8 text-stone-500 dark:text-stone-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-center text-sm text-stone-600 dark:text-stone-400">
        {message}
      </p>
      {showRetry && (
        <button
          onClick={handleRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
        >
          <RefreshCw className="h-4 w-4" />
          Спробувати знову
        </button>
      )}
    </div>
  );
}

/**
 * Компактна версія для використання в картках або списках
 */
export function DataUnavailableCompact({
  message = "Не вдалося завантажити",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-600 dark:bg-stone-800 dark:text-stone-400">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Версія для повноекранних сторінок
 */
export function DataUnavailablePage({
  title = "Сторінка тимчасово недоступна",
  message = "Не вдалося завантажити дані для цієї сторінки. Спробуйте оновити або поверніться пізніше.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <div className="rounded-full bg-stone-100 p-6 dark:bg-stone-800">
        <AlertTriangle className="h-12 w-12 text-stone-500 dark:text-stone-400" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-stone-900 dark:text-stone-100">
        {title}
      </h1>
      <p className="mt-3 max-w-lg text-center text-stone-600 dark:text-stone-400">
        {message}
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
        >
          <RefreshCw className="h-4 w-4" />
          Оновити сторінку
        </button>
        <a
          href="/"
          className="inline-flex items-center rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
        >
          На головну
        </a>
      </div>
    </div>
  );
}
