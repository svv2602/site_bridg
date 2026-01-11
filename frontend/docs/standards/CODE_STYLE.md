# Стиль Кода

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Naming Conventions

### Компоненты и Файлы

```typescript
// Файлы компонентов — PascalCase
TyreCard.tsx
QuickSearchForm.tsx
EuLabelBadge.tsx

// Утилиты — kebab-case или camelCase
lib/utils/tyres.ts
lib/api/payload.ts

// Страницы App Router
app/passenger-tyres/page.tsx
app/shyny/[slug]/page.tsx
```

### Переменные и Функции

```typescript
// Переменные — camelCase
const tyreModels = await getTyres();
const isLoading = true;
const selectedSeason = 'winter';

// Функции — camelCase, глагол + существительное
function getTyreModels() {}
function handleSubmit() {}
function formatSize() {}

// Константы — UPPER_SNAKE_CASE
const MAX_RESULTS = 10;
const API_BASE_URL = 'http://localhost:3001';
const SEASON_LABELS = {} as const;

// Boolean — is/has/should префиксы
const isOpen = false;
const hasError = true;
const shouldRefresh = false;
```

### TypeScript Типы

```typescript
// Interfaces — PascalCase, описывают объекты
interface TyreCardProps {
  tyre: TyreModel;
  className?: string;
}

interface User {
  id: string;
  name: string;
}

// Types — PascalCase, для union/intersection
type Season = 'summer' | 'winter' | 'all-season';
type VehicleType = 'passenger' | 'suv' | 'lcv';

// НЕ используйте I-префикс
interface ITyreCardProps {} // НЕПРАВИЛЬНО
```

---

## Server vs Client Components

### Server Components (по умолчанию)

```typescript
// Без "use client" — Server Component
import { getTyreModels } from '@/lib/api/tyres';

export default async function Page() {
  const tyres = await getTyreModels();
  return <TyreList tyres={tyres} />;
}
```

### Client Components

```typescript
// С "use client" — Client Component
"use client";

import { useState } from 'react';

export function SearchForm() {
  const [query, setQuery] = useState('');
  return <form>...</form>;
}
```

### Правила Выбора

| Нужно | Тип |
|-------|-----|
| Data fetching | Server |
| useState, useEffect | Client |
| Event handlers (onClick) | Client |
| Browser APIs | Client |
| SEO-критичный контент | Server |
| Формы с валидацией | Client |

---

## Форматирование

### Prettier Config

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Tailwind Классы

```typescript
// Группируйте логически
<div className={cn(
  // Layout
  'flex items-center justify-between',
  // Spacing
  'p-4 gap-2',
  // Visual
  'rounded-2xl border border-border bg-card',
  // Typography
  'text-sm font-medium',
  // States
  'hover:bg-muted transition-colors',
  // Conditional
  isActive && 'bg-primary text-white'
)}>
```

---

## Комментарии

### JSDoc для Компонентов

```typescript
/**
 * Карточка шины с hover эффектом
 *
 * @example
 * <TyreCard tyre={tyreModel} variant="compact" />
 */
export function TyreCard({ tyre, variant = 'default' }: TyreCardProps) {
  // ...
}
```

### Секции в Компоненте

```typescript
// ============================================================================
// IMPORTS
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

// ============================================================================
// CONSTANTS
// ============================================================================

// ============================================================================
// COMPONENT
// ============================================================================
```

### TODO Комментарии

```typescript
// TODO: Добавить пагинацию после MVP
// FIXME: Исправить overflow на мобильных
// NOTE: API возвращает данные в старом формате
```

---

## Best Practices

### DO

```typescript
// Named exports
export function Component() {}

// Деструктуризация props
function Card({ title, children }: CardProps) {}

// Early returns
if (isLoading) return <Skeleton />;
if (error) return <Error />;
return <Content />;

// Константы вверху файла
const MAX_ITEMS = 10;

// cn() для условных классов
className={cn('base', isActive && 'active')}
```

### DON'T

```typescript
// Default exports
export default function Component() {} //

// Props без деструктуризации
function Card(props: CardProps) {
  return <div>{props.title}</div>;
} //

// Вложенные тернарники
{condition1 ? <A /> : condition2 ? <B /> : <C />} //

// Inline styles
<div style={{ color: '#333' }}> //

// console.log в продакшене
console.log('debug'); //
```

---

## Git Commits

### Формат Сообщения

```
<type>(<scope>): <description>

[optional body]
```

### Типы

| Type | Описание |
|------|----------|
| `feat` | Новая функциональность |
| `fix` | Исправление бага |
| `docs` | Документация |
| `style` | Форматирование |
| `refactor` | Рефакторинг |
| `perf` | Производительность |
| `test` | Тесты |
| `chore` | Вспомогательное |

### Примеры

```
feat(tyres): add season filter to catalogue

fix(search): prevent button overflow on mobile

docs(standards): add color system guide

refactor(api): simplify payload client
```

---

## Связанные Документы

- [Структура Компонентов](./COMPONENT_STRUCTURE.md)
- [TypeScript Стандарты](./TYPESCRIPT_STANDARDS.md)
- [Организация Импортов](./IMPORT_ORGANIZATION.md)
