'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

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
    <div role="alert" className="rounded-2xl border border-error/30 bg-error/10 p-12 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-error mb-4" />
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-stone-500 dark:text-stone-400">{message}</p>
      {onRetry && (
        <Button
          variant="danger"
          size="lg"
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-4 w-4" />}
          className="mt-6"
        >
          Спробувати знову
        </Button>
      )}
    </div>
  );
}
