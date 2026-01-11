# Производительность

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Core Web Vitals

| Метрика | Цель | Описание |
|---------|------|----------|
| **LCP** | < 2.5s | Largest Contentful Paint |
| **INP** | < 200ms | Interaction to Next Paint |
| **CLS** | < 0.1 | Cumulative Layout Shift |

---

## Server Components

### По умолчанию — Server Components

```typescript
// app/passenger-tyres/page.tsx
// Server Component — нет "use client", код не отправляется клиенту

import { getTyreModels } from '@/lib/api/tyres';

export default async function Page() {
  const tyres = await getTyreModels();
  return <TyreGrid tyres={tyres} />;
}
```

### Client Components — Только когда нужно

```typescript
// "use client" — только для:
// - useState, useEffect
// - Event handlers (onClick, onChange)
// - Browser APIs
// - Сторонние библиотеки без SSR

"use client";

import { useState } from 'react';

export function SearchForm() {
  const [query, setQuery] = useState('');
  // ...
}
```

---

## Image Optimization

### Next.js Image

```typescript
import Image from 'next/image';

// ПРАВИЛЬНО — использовать next/image
<Image
  src={tyre.image.url}
  alt={tyre.name}
  width={400}
  height={400}
  className="object-contain"
  priority={isAboveFold}  // true для hero изображений
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// НЕПРАВИЛЬНО — обычный img
<img src={tyre.image.url} />
```

### Priority для Hero Images

```typescript
// Первое изображение на странице
<Image
  src="/hero-image.webp"
  alt="Bridgestone шини"
  fill
  priority  // Загружается сразу, без lazy loading
  className="object-cover"
/>
```

### Sizes для Responsive

```typescript
// Указывайте sizes для правильного srcset
<Image
  src={image.url}
  alt={image.alt}
  width={800}
  height={600}
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  "
/>
```

---

## Data Fetching

### Revalidation Strategy

```typescript
// Static — revalidate каждые 60 минут
const tyres = await fetch(url, {
  next: { revalidate: 3600 },
});

// Dynamic — каждый запрос
const searchResults = await fetch(url, {
  cache: 'no-store',
});

// Static Generation — build time
export const dynamic = 'force-static';
```

### Parallel Data Fetching

```typescript
// ПРАВИЛЬНО — параллельные запросы
export default async function Page() {
  // Запускаем все запросы одновременно
  const [tyres, articles, dealers] = await Promise.all([
    getTyreModels(),
    getArticles({ limit: 3 }),
    getDealers({ limit: 5 }),
  ]);

  return (
    <>
      <TyreGrid tyres={tyres} />
      <ArticleList articles={articles} />
      <DealerMap dealers={dealers} />
    </>
  );
}

// НЕПРАВИЛЬНО — последовательные запросы (waterfall)
const tyres = await getTyreModels();
const articles = await getArticles();
const dealers = await getDealers();
```

---

## React Optimizations

### React.memo для Списков

```typescript
import { memo } from 'react';

// Мемоизация для предотвращения ре-рендеров
export const TyreCard = memo(function TyreCard({ tyre }: { tyre: TyreModel }) {
  return (
    <article className="rounded-2xl border border-border bg-card">
      <Image src={tyre.image.url} alt={tyre.name} ... />
      <h3>{tyre.name}</h3>
    </article>
  );
});

// Использование в списке
{tyres.map((tyre) => (
  <TyreCard key={tyre.id} tyre={tyre} />
))}
```

### useCallback для Event Handlers

```typescript
"use client";

import { useCallback } from 'react';

export function TyreFilter({ onFilterChange }: Props) {
  // Мемоизируем handler если передаем в дочерние компоненты
  const handleSeasonChange = useCallback((season: string) => {
    onFilterChange({ season });
  }, [onFilterChange]);

  return <SeasonSelect onChange={handleSeasonChange} />;
}
```

### useMemo для Вычислений

```typescript
"use client";

import { useMemo } from 'react';

export function TyreGrid({ tyres, filters }: Props) {
  // Мемоизируем фильтрацию
  const filteredTyres = useMemo(() => {
    return tyres.filter((tyre) => {
      if (filters.season && tyre.season !== filters.season) return false;
      if (filters.width && !tyre.sizes.some(s => s.width === filters.width)) return false;
      return true;
    });
  }, [tyres, filters.season, filters.width]);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredTyres.map((tyre) => (
        <TyreCard key={tyre.id} tyre={tyre} />
      ))}
    </div>
  );
}
```

---

## Bundle Optimization

### Dynamic Imports

```typescript
import dynamic from 'next/dynamic';

// Lazy load тяжёлых компонентов
const DealerMap = dynamic(() => import('@/components/DealerMap'), {
  loading: () => <MapSkeleton />,
  ssr: false, // Карты не нужны на сервере
});

// В компоненте
<Suspense fallback={<MapSkeleton />}>
  <DealerMap dealers={dealers} />
</Suspense>
```

### Tree Shaking Icons

```typescript
// ПРАВИЛЬНО — именованные импорты
import { Search, MapPin, Car } from 'lucide-react';

// НЕПРАВИЛЬНО — импорт всей библиотеки
import * as Icons from 'lucide-react';
```

---

## Layout Stability (CLS)

### Резервируйте Место для Изображений

```typescript
// ПРАВИЛЬНО — указаны width и height
<Image
  src={tyre.image.url}
  alt={tyre.name}
  width={400}
  height={400}
/>

// Или aspect-ratio через CSS
<div className="aspect-square relative">
  <Image src={...} fill className="object-contain" />
</div>
```

### Skeleton Matching Content

```typescript
// Skeleton должен соответствовать финальному контенту
function TyreCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Та же высота что и изображение */}
      <div className="aspect-square bg-stone-200 animate-pulse" />
      <div className="p-4 space-y-3">
        {/* Та же высота что и заголовок */}
        <div className="h-5 w-3/4 bg-stone-200 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-stone-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
```

### Font Loading

```typescript
// app/layout.tsx
import { GeistSans, GeistMono } from 'geist/font';

// Шрифты загружаются с font-display: swap
// Текст отображается сразу с fallback шрифтом
```

---

## Кэширование

### API Responses

```typescript
// lib/api/tyres.ts
export async function getTyreModels() {
  const response = await fetch(`${PAYLOAD_URL}/api/tyres`, {
    // Кэшируем на 1 час, revalidate при изменениях
    next: {
      revalidate: 3600,
      tags: ['tyres'],
    },
  });

  return response.json();
}
```

### Static Generation

```typescript
// app/shyny/[slug]/page.tsx

// Генерируем страницы при build
export async function generateStaticParams() {
  const tyres = await getTyreModels();
  return tyres.map((tyre) => ({
    slug: tyre.slug,
  }));
}

export default async function TyrePage({ params }: PageProps) {
  const { slug } = await params;
  const tyre = await getTyreBySlug(slug);
  // ...
}
```

---

## Измерение

### Web Vitals

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Lighthouse

```bash
# Локальная проверка
npx lighthouse http://localhost:3010 --view

# Цели:
# Performance: > 90
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

---

## Чеклист

### Изображения
- [ ] Использовать next/image
- [ ] Указывать width и height
- [ ] priority для hero изображений
- [ ] sizes для responsive

### Data Fetching
- [ ] Параллельные запросы (Promise.all)
- [ ] Правильная revalidation стратегия
- [ ] Fallback data при ошибках API

### React
- [ ] Server Components по умолчанию
- [ ] memo для карточек в списках
- [ ] useCallback/useMemo где нужно

### Bundle
- [ ] Dynamic imports для тяжёлых компонентов
- [ ] Tree shaking для иконок
- [ ] Минимум клиентского JS

### CLS
- [ ] Зарезервировано место для изображений
- [ ] Skeleton соответствует контенту
- [ ] Нет layout shifts при загрузке

---

## Связанные Документы

- [Структура Компонентов](./COMPONENT_STRUCTURE.md)
- [API Интеграция](./API_INTEGRATION.md)
- [Состояния Загрузки](./LOADING_STATES.md)
