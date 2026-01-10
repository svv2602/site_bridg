'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Щось пішло не так',
  message = 'Не вдалося завантажити дані. Спробуйте пізніше.',
  onRetry
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-12 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold text-red-800 dark:text-red-200">{title}</h3>
      <p className="mt-2 text-red-600 dark:text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Спробувати знову
        </button>
      )}
    </div>
  );
}
