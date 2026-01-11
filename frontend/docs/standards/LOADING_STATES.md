# Состояния Загрузки

**Версия:** 1.0
**Дата:** 2026-01-11

---

## loading.tsx (App Router)

Каждая директория страницы может иметь `loading.tsx`:

```
app/
├── passenger-tyres/
│   ├── page.tsx
│   └── loading.tsx    ← Показывается при загрузке
```

### Пример

```typescript
// app/passenger-tyres/loading.tsx
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="bg-background">
      {/* Hero Skeleton */}
      <section className="hero-dark py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <LoadingSkeleton className="mb-4 h-10 w-3/4" />
          <LoadingSkeleton className="h-6 w-1/2" />
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TyreCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## Skeleton Компоненты

### Базовый LoadingSkeleton

```typescript
// components/ui/LoadingSkeleton.tsx
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-stone-200 dark:bg-stone-700',
        className
      )}
    />
  );
}
```

### TyreCard Skeleton

```typescript
export function TyreCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Image placeholder */}
      <div className="aspect-square bg-stone-200 dark:bg-stone-700 animate-pulse" />

      {/* Content */}
      <div className="p-4 space-y-3">
        <LoadingSkeleton className="h-5 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
```

### Article Skeleton

```typescript
export function ArticleCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="aspect-video bg-stone-200 dark:bg-stone-700 animate-pulse" />
      <div className="p-6 space-y-3">
        <LoadingSkeleton className="h-6 w-3/4" />
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
```

---

## Spinner

```typescript
// components/ui/Spinner.tsx
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        'animate-spin text-primary',
        SIZES[size],
        className
      )}
    />
  );
}
```

---

## Кнопка с Загрузкой

```typescript
interface ButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
}

function Button({ isLoading, children }: ButtonProps) {
  return (
    <button
      disabled={isLoading}
      className="inline-flex items-center gap-2 rounded-full bg-primary
                 px-4 py-2 font-semibold text-white
                 disabled:opacity-70"
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {isLoading ? 'Завантаження...' : children}
    </button>
  );
}
```

---

## Suspense Boundaries

```typescript
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <h1>Заголовок</h1>

      <Suspense fallback={<TyreGridSkeleton />}>
        <TyreGrid />
      </Suspense>

      <Suspense fallback={<ArticlesSkeleton />}>
        <Articles />
      </Suspense>
    </div>
  );
}
```

---

## Full Page Loading

```typescript
export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Завантаження...</p>
      </div>
    </div>
  );
}
```

---

## Client-Side Loading State

```typescript
"use client";

import { useState, useEffect } from 'react';

export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/search?q=${query}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data.results);
      } catch (err) {
        setError('Помилка пошуку');
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  if (isLoading) return <SearchResultsSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (results.length === 0) return <EmptyState />;

  return <ResultsList results={results} />;
}
```

---

## Правила

### DO

```typescript
// Skeleton соответствует структуре контента
<div className="p-4 space-y-3">
  <LoadingSkeleton className="h-5 w-3/4" />  // Заголовок
  <LoadingSkeleton className="h-4 w-1/2" />  // Подзаголовок
</div>

// Используйте stone palette для skeleton
className="bg-stone-200 dark:bg-stone-700"

// Disabled состояние при загрузке
<button disabled={isLoading}>
```

### DON'T

```typescript
// Не показывайте пустую страницу
if (isLoading) return null; //

// Не используйте только текст
if (isLoading) return <p>Loading...</p>; //

// Не забывайте про dark mode
className="bg-gray-200" // Не адаптируется к теме
```

---

## Связанные Документы

- [Структура Компонентов](./COMPONENT_STRUCTURE.md)
- [Error Handling](./ERROR_HANDLING.md)
- [Система Цветов](./COLOR_SYSTEM.md)
