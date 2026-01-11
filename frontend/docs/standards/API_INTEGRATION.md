# API Интеграция — Payload CMS

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Архитектура

```
Frontend (Next.js)          Backend (Payload CMS)
┌─────────────────┐         ┌─────────────────┐
│  Server         │ ──────▶ │  /api/tyres     │
│  Components     │         │  /api/dealers   │
│  (fetch)        │         │  /api/articles  │
├─────────────────┤         └─────────────────┘
│  lib/api/       │
│  - payload.ts   │ ◀────── Mock Data (fallback)
│  - tyres.ts     │
│  - articles.ts  │
└─────────────────┘
```

---

## Конфигурация

### Переменные Окружения

```bash
# frontend/.env.local
NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3001
```

### API URL

```typescript
// lib/api/payload.ts
const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';
```

---

## Базовый Fetch

### fetchPayload — Универсальная Функция

```typescript
// lib/api/payload.ts
interface FetchPayloadOptions {
  endpoint: string;
  query?: Record<string, string | number>;
  cache?: RequestCache;
  revalidate?: number;
}

async function fetchPayload<T>({
  endpoint,
  query = {},
  cache = 'force-cache',
  revalidate,
}: FetchPayloadOptions): Promise<T> {
  const url = new URL(`${PAYLOAD_URL}/api/${endpoint}`);

  // Добавляем query параметры
  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const options: RequestInit = {
    cache,
    next: revalidate ? { revalidate } : undefined,
  };

  try {
    const response = await fetch(url.toString(), options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Payload CMS unavailable: ${error}`);
    throw error;
  }
}
```

---

## API Шин (Tyres)

### Получение Всех Моделей

```typescript
// lib/api/tyres.ts
import { TyreModel, mockTyres } from '@/lib/data';
import { getPayloadTyres } from './payload';

export async function getTyreModels(): Promise<TyreModel[]> {
  try {
    const tyres = await getPayloadTyres();
    return tyres;
  } catch (error) {
    console.log('Using mock data:', error);
    return mockTyres;
  }
}
```

### Фильтрация по Сезону

```typescript
export async function getTyresBySeason(
  season: 'summer' | 'winter' | 'all-season'
): Promise<TyreModel[]> {
  const tyres = await getTyreModels();
  return tyres.filter(t => t.season === season);
}
```

### Получение по Slug

```typescript
export async function getTyreBySlug(
  slug: string
): Promise<TyreModel | null> {
  const tyres = await getTyreModels();
  return tyres.find(t => t.slug === slug) || null;
}
```

---

## Использование в Server Components

### Страница Каталога

```typescript
// app/passenger-tyres/page.tsx
import { getTyreModels } from '@/lib/api/tyres';

export default async function PassengerTyresPage() {
  const tyres = await getTyreModels();
  const passengerTyres = tyres.filter(t =>
    t.vehicleTypes.includes('passenger')
  );

  return (
    <div>
      <h1>Легкові шини</h1>
      <TyreCardGrid tyres={passengerTyres} />
    </div>
  );
}
```

### Динамическая Страница

```typescript
// app/shyny/[slug]/page.tsx
import { getTyreModels, getTyreBySlug } from '@/lib/api/tyres';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const tyres = await getTyreModels();
  return tyres.map(t => ({ slug: t.slug }));
}

export default async function TyrePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tyre = await getTyreBySlug(slug);

  if (!tyre) {
    notFound();
  }

  return <TyreDetails tyre={tyre} />;
}
```

---

## Кэширование

### Static Generation (по умолчанию)

```typescript
// Данные кэшируются на этапе build
const tyres = await fetch(`${PAYLOAD_URL}/api/tyres`, {
  cache: 'force-cache',
});
```

### Revalidation (ISR)

```typescript
// Обновление каждый час
const tyres = await fetch(`${PAYLOAD_URL}/api/tyres`, {
  next: { revalidate: 3600 },
});
```

### Без Кэша

```typescript
// Всегда свежие данные
const tyres = await fetch(`${PAYLOAD_URL}/api/tyres`, {
  cache: 'no-store',
});
```

---

## Fallback на Mock Data

### Паттерн Try/Catch

```typescript
export async function getData(): Promise<Data[]> {
  try {
    // Пробуем получить из Payload
    const response = await fetch(`${PAYLOAD_URL}/api/data`);
    if (!response.ok) throw new Error('API error');
    return response.json();
  } catch (error) {
    // Fallback на mock data
    console.log('Payload unavailable, using mock data');
    return mockData;
  }
}
```

### Почему Это Важно

1. **Development** — backend может быть не запущен
2. **Build time** — CI/CD без доступа к Payload
3. **Reliability** — сайт работает даже при проблемах с CMS

---

## API Routes (Client-Side)

### Route Handlers

```typescript
// app/api/tyres/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTyreModels } from '@/lib/api/tyres';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const width = searchParams.get('width');
  const season = searchParams.get('season');

  const tyres = await getTyreModels();

  let filtered = tyres;

  if (width) {
    filtered = filtered.filter(t =>
      t.sizes.some(s => s.width === parseInt(width))
    );
  }

  if (season) {
    filtered = filtered.filter(t => t.season === season);
  }

  return NextResponse.json({ data: filtered });
}
```

### Использование в Client Component

```typescript
"use client";

import { useState, useEffect } from 'react';

export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const res = await fetch(`/api/tyres/search?${query}`);
        const data = await res.json();
        setResults(data.data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  if (loading) return <Skeleton />;

  return <ResultsList results={results} />;
}
```

---

## Типы Данных

### TyreModel

```typescript
// lib/data.ts
export interface TyreModel {
  id: string;
  slug: string;
  name: string;
  season: 'summer' | 'winter' | 'all-season';
  vehicleTypes: ('passenger' | 'suv' | 'lcv')[];
  sizes: TyreSize[];
  imageUrl?: string;
  shortDescription?: string;
  fullDescription?: any; // Lexical rich text
  technologies?: Technology[];
  euLabel?: EuLabel;
  faqs?: FAQ[];
  isNew?: boolean;
}

export interface TyreSize {
  width: number;
  aspectRatio: number;
  diameter: number;
  loadIndex?: string;
  speedIndex?: string;
}
```

---

## Best Practices

### DO

```typescript
// Используйте типы
const tyres: TyreModel[] = await getTyreModels();

// Обрабатывайте ошибки
try {
  const data = await fetchPayload({ endpoint: 'tyres' });
} catch (error) {
  return mockData;
}

// Используйте Server Components для data fetching
export default async function Page() {
  const data = await getData(); // Выполняется на сервере
}
```

### DON'T

```typescript
// Не делайте fetch в Client Components если можно на сервере
"use client";
export function Component() {
  useEffect(() => {
    fetch('/api/data'); // Лишний запрос
  }, []);
}

// Не забывайте fallback
const data = await fetch(url); // Без try/catch сломается при недоступности API
```

---

## Связанные Документы

- [Структура Компонентов](./COMPONENT_STRUCTURE.md)
- [Error Handling](./ERROR_HANDLING.md)
- [TypeScript Стандарты](./TYPESCRIPT_STANDARDS.md)
