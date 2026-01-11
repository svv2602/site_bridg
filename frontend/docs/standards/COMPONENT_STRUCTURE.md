# Структура Компонентов

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Содержание

1. [Общая Структура](#общая-структура)
2. [Организация Файлов](#организация-файлов)
3. [Анатомия Компонента](#анатомия-компонента)
4. [Типы Компонентов](#типы-компонентов)
5. [Best Practices](#best-practices)

---

## Общая Структура

### Директория Компонентов

```
src/
├── app/                       # Next.js App Router страницы
│   ├── page.tsx              # Главная страница
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Глобальные стили + CSS переменные
│   ├── passenger-tyres/      # Страница каталога
│   ├── shyny/[slug]/         # Динамическая страница шины
│   └── api/                  # API Routes
│
├── components/
│   ├── ui/                   # Переиспользуемые UI компоненты
│   │   ├── Badge.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── ErrorState.tsx
│   │   ├── EuLabelBadge.tsx
│   │   └── LoadingSkeleton.tsx
│   │
│   ├── MainHeader.tsx        # Хедер сайта
│   ├── Footer.tsx            # Футер
│   ├── TyreCard.tsx          # Карточка шины
│   ├── QuickSearchForm.tsx   # Форма поиска шин
│   ├── VehicleTyreSelector.tsx # Подбор шин по авто
│   ├── SeasonalHero.tsx      # Hero секция
│   └── ...
│
└── lib/
    ├── api/                  # API клиенты
    │   ├── payload.ts        # Payload CMS клиент
    │   ├── tyres.ts          # API шин
    │   └── articles.ts       # API статей
    ├── data.ts               # Типы и mock data
    └── utils/                # Утилиты
```

### Именование Файлов

**Компоненты:** PascalCase
```
TyreCard.tsx
QuickSearchForm.tsx
EuLabelBadge.tsx
```

**Утилиты и хелперы:** kebab-case или camelCase
```
lib/api/payload.ts
lib/utils/tyres.ts
```

**Типы:** В том же файле или отдельно как `types.ts`

---

## Организация Файлов

### Простой Компонент (один файл)

Для компонентов до 200 строк:

```
components/
└── TyreCard.tsx
```

### Компонент с Подкомпонентами

Для сложных компонентов создайте папку:

```
components/
└── VehicleTyreSelector/
    ├── index.ts              # Re-export
    ├── VehicleTyreSelector.tsx
    ├── SizeSearchTab.tsx
    ├── CarSearchTab.tsx
    └── ResultsGrid.tsx
```

**index.ts:**
```typescript
export { VehicleTyreSelector } from './VehicleTyreSelector';
```

---

## Анатомия Компонента

### Шаблон Стандартного Компонента

```typescript
/**
 * Краткое описание компонента
 */
"use client"; // Только если нужен client-side

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React и Next.js
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 2. Иконки
import { ChevronRight, MapPin, Car } from 'lucide-react';

// 3. Локальные компоненты
import { Badge } from '@/components/ui/Badge';
import { EuLabelBadge } from '@/components/ui/EuLabelBadge';

// 4. Утилиты
import { cn } from '@/lib/utils';
import { seasonLabels } from '@/lib/utils/tyres';

// 5. Типы (последними)
import type { TyreModel } from '@/lib/data';

// ============================================================================
// TYPES
// ============================================================================

interface TyreCardProps {
  /** Модель шины для отображения */
  tyre: TyreModel;
  /** Дополнительные CSS классы */
  className?: string;
  /** Вариант отображения */
  variant?: 'default' | 'compact';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SEASON_BADGE_CLASSES = {
  summer: 'badge-summer',
  winter: 'badge-winter',
  'all-season': 'badge-allseason',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

export function TyreCard({
  tyre,
  className,
  variant = 'default',
}: TyreCardProps) {
  // ------------------------------------------------------------------------
  // Hooks
  // ------------------------------------------------------------------------

  const [isHovered, setIsHovered] = useState(false);

  // ------------------------------------------------------------------------
  // Computed
  // ------------------------------------------------------------------------

  const badgeClass = SEASON_BADGE_CLASSES[tyre.season];
  const sizeCount = tyre.sizes.length;

  // ------------------------------------------------------------------------
  // Event Handlers
  // ------------------------------------------------------------------------

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // ------------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------------

  return (
    <article
      className={cn(
        'group relative rounded-2xl border border-border bg-card',
        'transition-all duration-300 hover:shadow-lg',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-2xl">
        {tyre.imageUrl ? (
          <Image
            src={tyre.imageUrl}
            alt={tyre.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Car className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Season Badge */}
        <Badge className={cn('absolute top-3 left-3', badgeClass)}>
          {seasonLabels[tyre.season]}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2">
          {tyre.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {sizeCount} {sizeCount === 1 ? 'розмір' : 'розмірів'}
        </p>

        {/* Hover Action */}
        {isHovered && (
          <Link
            href={`/shyny/${tyre.slug}`}
            className="absolute inset-0 flex items-end justify-center pb-4"
          >
            <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
              Детальніше
            </span>
          </Link>
        )}
      </div>
    </article>
  );
}
```

---

## Типы Компонентов

### 1. Server Components (по умолчанию в App Router)

**Назначение:** Компоненты с data fetching, без интерактивности

```typescript
// app/passenger-tyres/page.tsx
import { getTyreModels } from '@/lib/api/tyres';
import { TyreCardGrid } from '@/components/TyreCard';

export default async function PassengerTyresPage() {
  const tyres = await getTyreModels();
  const passengerTyres = tyres.filter(t =>
    t.vehicleTypes.includes('passenger')
  );

  return (
    <div>
      <h1>Легкові шини Bridgestone</h1>
      <TyreCardGrid tyres={passengerTyres} />
    </div>
  );
}
```

### 2. Client Components

**Назначение:** Интерактивные компоненты

```typescript
"use client";

import { useState } from 'react';

export function QuickSearchForm() {
  const [width, setWidth] = useState('');
  const [season, setSeason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

### 3. UI Компоненты (Presentational)

**Назначение:** Чисто визуальные, без бизнес-логики

```typescript
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}

export function Badge({
  children,
  className,
  variant = 'default',
}: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      variant === 'default' && 'bg-primary text-primary-foreground',
      variant === 'outline' && 'border border-border text-foreground',
      className
    )}>
      {children}
    </span>
  );
}
```

### 4. Layout Компоненты

**Назначение:** Структура страниц

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>
        <MainHeader />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

---

## Best Practices

### DO (Делайте)

```typescript
// Используйте TypeScript для всех props
interface Props {
  title: string;
  count: number;
}

// Добавляйте JSDoc комментарии
/**
 * Displays tyre search results
 * @param tyres - Array of tyre models
 */

// Используйте named exports
export function Component() {}

// Деструктурируйте props
function Component({ title, count }: Props) {}

// Используйте early returns
if (isLoading) return <Skeleton />;
if (error) return <ErrorState />;
return <Content />;

// Выносите константы наверх
const MAX_RESULTS = 10;
const SEASON_LABELS = { /* ... */ } as const;
```

### DON'T (Не делайте)

```typescript
// Не используйте default exports
export default function Component() {} //

// Не мутируйте props
props.tyre.name = 'New Name'; //

// Не определяйте компоненты внутри компонентов
function Parent() {
  function Child() {} // Создаётся заново каждый рендер
  return <Child />;
}

// Не хардкодьте цвета
<div style={{ color: '#3b82f6' }} /> //
<div className="text-zinc-500" /> //

// Используйте stone palette
<div className="text-stone-500" /> //
<div className="text-muted-foreground" /> //
```

---

## Связанные Документы

- [Организация Импортов](./IMPORT_ORGANIZATION.md)
- [TypeScript Стандарты](./TYPESCRIPT_STANDARDS.md)
- [Система Цветов](./COLOR_SYSTEM.md)
- [Шаблоны](./templates/)
