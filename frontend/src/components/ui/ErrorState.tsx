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
    <div className="rounded-2xl border border-error/30 bg-error/10 p-12 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-error mb-4" />
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-error px-6 py-2.5 text-sm font-semibold text-error-foreground hover:bg-error/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Спробувати знову
        </button>
      )}
    </div>
  );
}
