# Обработка Ошибок

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Типы Ошибок

| Тип | Пример | Обработка |
|-----|--------|-----------|
| **404** | Страница не найдена | `not-found.tsx` |
| **500** | Server error | `error.tsx` |
| **API Error** | Payload CMS недоступен | Fallback data |
| **Validation** | Неверный ввод пользователя | Inline errors |
| **Network** | Timeout, offline | Retry / сообщение |

---

## Error Boundaries (error.tsx)

### Глобальный Error Boundary

```typescript
// app/error.tsx
"use client";

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Логирование ошибки (Sentry, LogRocket, etc.)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Щось пішло не так
        </h1>
        <p className="mt-2 text-muted-foreground">
          Виникла помилка при завантаженні сторінки.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3
                       font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            Спробувати знову
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border
                       px-6 py-3 font-semibold hover:bg-muted transition-colors"
          >
            На головну
          </a>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-8 max-w-lg overflow-auto rounded-lg bg-stone-100 p-4
                          text-left text-sm text-red-600 dark:bg-stone-800">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}
```

### Локальный Error Boundary

```typescript
// app/passenger-tyres/error.tsx
"use client";

import { ErrorState } from '@/components/ui/ErrorState';

export default function PassengerTyresError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <ErrorState
        title="Помилка завантаження шин"
        message="Не вдалося завантажити каталог. Спробуйте оновити сторінку."
        onRetry={reset}
      />
    </div>
  );
}
```

---

## Not Found (not-found.tsx)

### Глобальный 404

```typescript
// app/not-found.tsx
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-stone-200 dark:text-stone-700">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-bold text-foreground">
          Сторінку не знайдено
        </h2>
        <p className="mt-2 text-muted-foreground">
          Сторінка, яку ви шукаєте, не існує або була переміщена.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2
                       rounded-full bg-primary px-6 py-3
                       font-semibold text-white hover:bg-primary/90"
          >
            <Home className="h-5 w-5" />
            На головну
          </Link>
          <Link
            href="/tyre-search"
            className="inline-flex items-center justify-center gap-2
                       rounded-full border border-border px-6 py-3
                       font-semibold hover:bg-muted"
          >
            <Search className="h-5 w-5" />
            Пошук шин
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Программный 404

```typescript
// app/shyny/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getTyreBySlug } from '@/lib/api/tyres';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TyrePage({ params }: PageProps) {
  const { slug } = await params;
  const tyre = await getTyreBySlug(slug);

  // Если шина не найдена — показываем 404
  if (!tyre) {
    notFound();
  }

  return <TyreDetails tyre={tyre} />;
}
```

---

## ErrorState Компонент

```typescript
// components/ui/ErrorState.tsx
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Помилка',
  message = 'Щось пішло не так. Спробуйте пізніше.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-full
                     bg-primary px-4 py-2 text-sm font-semibold text-white
                     hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Спробувати знову
        </button>
      )}
    </div>
  );
}
```

---

## API Errors с Fallback

### Паттерн Fallback Data

```typescript
// lib/api/tyres.ts

export async function getTyreModels(): Promise<TyreModel[]> {
  try {
    const response = await fetch(
      `${PAYLOAD_URL}/api/tyres?depth=2`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.docs;
  } catch (error) {
    console.warn('Payload CMS unavailable, using mock data:', error);
    // Возвращаем mock data как fallback
    return getMockTyreModels();
  }
}
```

### Empty State

```typescript
// components/ui/EmptyState.tsx
import { Package } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title = 'Нічого не знайдено',
  message = 'Спробуйте змінити параметри пошуку.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-stone-100 p-4 dark:bg-stone-800">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
```

---

## Client-Side Error Handling

### Форма с Обработкой Ошибок

```typescript
"use client";

import { useState } from 'react';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Помилка відправки');
      }

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Невідома помилка'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}

      {status === 'error' && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700
                        dark:bg-red-900/20 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {status === 'success' && (
        <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-700
                        dark:bg-green-900/20 dark:text-green-400">
          Повідомлення успішно відправлено!
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-4 rounded-full bg-primary px-6 py-3 font-semibold text-white
                   disabled:opacity-70"
      >
        {status === 'loading' ? 'Відправка...' : 'Відправити'}
      </button>
    </form>
  );
}
```

---

## Логирование Ошибок

### Development

```typescript
// В development показываем полную информацию
if (process.env.NODE_ENV === 'development') {
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    digest: error.digest,
  });
}
```

### Production (Future: Sentry)

```typescript
// Будущая интеграция с Sentry
// import * as Sentry from '@sentry/nextjs';
//
// Sentry.captureException(error, {
//   tags: { page: 'tyre-search' },
//   extra: { searchParams },
// });
```

---

## Чеклист

- [ ] Глобальный `app/error.tsx` для 500 ошибок
- [ ] Глобальный `app/not-found.tsx` для 404
- [ ] Локальные error.tsx для критичных секций
- [ ] `notFound()` для несуществующих ресурсов
- [ ] Fallback data при недоступности API
- [ ] ErrorState компонент для inline ошибок
- [ ] EmptyState для пустых результатов
- [ ] Сообщения на украинском языке

---

## Связанные Документы

- [API Интеграция](./API_INTEGRATION.md)
- [Состояния Загрузки](./LOADING_STATES.md)
- [Формы и Валидация](./FORMS_VALIDATION.md)
