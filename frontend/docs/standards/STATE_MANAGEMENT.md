# Управление Состоянием

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Философия

В Next.js App Router основной подход — **минимизация клиентского состояния**:

1. **Server Components** — данные загружаются на сервере
2. **URL State** — фильтры и поиск в URL параметрах
3. **React State** — только для UI-интеракций (модалки, формы)

---

## Server Components (По умолчанию)

### Data Fetching на Сервере

```typescript
// app/passenger-tyres/page.tsx
// Server Component — async/await напрямую

import { getTyreModels } from '@/lib/api/tyres';
import { TyreCard } from '@/components/TyreCard';

export default async function PassengerTyresPage() {
  // Данные загружаются на сервере при build/request
  const tyres = await getTyreModels({ vehicleType: 'passenger' });

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tyres.map((tyre) => (
        <TyreCard key={tyre.id} tyre={tyre} />
      ))}
    </div>
  );
}
```

### Преимущества

- SEO — контент в HTML
- Быстрая первая загрузка
- Меньше JavaScript на клиенте
- Безопасный доступ к базе данных

---

## URL State

### Фильтры в Search Params

```typescript
// app/tyre-search/page.tsx

interface PageProps {
  searchParams: Promise<{
    width?: string;
    profile?: string;
    diameter?: string;
    season?: string;
  }>;
}

export default async function TyreSearchPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Фильтрация на основе URL
  const tyres = await getTyreModels({
    width: params.width ? parseInt(params.width) : undefined,
    profile: params.profile ? parseInt(params.profile) : undefined,
    diameter: params.diameter ? parseInt(params.diameter) : undefined,
    season: params.season as Season | undefined,
  });

  return (
    <>
      <SearchFilters currentParams={params} />
      <TyreGrid tyres={tyres} />
    </>
  );
}
```

### Обновление URL из Client Component

```typescript
"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function SeasonFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSeasonChange = (season: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (season) {
      params.set('season', season);
    } else {
      params.delete('season');
    }

    // Обновляем URL — страница перерендерится с новыми данными
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentSeason = searchParams.get('season') || '';

  return (
    <div className="flex gap-2">
      {['', 'summer', 'winter', 'all-season'].map((season) => (
        <button
          key={season}
          onClick={() => handleSeasonChange(season)}
          className={cn(
            'px-4 py-2 rounded-full border',
            currentSeason === season
              ? 'bg-primary text-white border-primary'
              : 'border-border hover:border-primary'
          )}
        >
          {season || 'Всі'}
        </button>
      ))}
    </div>
  );
}
```

---

## React useState

### Когда Использовать

- Формы и их валидация
- Модальные окна (open/close)
- Dropdown menus
- Tabs на странице
- Локальные UI состояния

### Примеры

```typescript
"use client";

import { useState } from 'react';

// 1. Модальное окно
export function DealerModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Обрати дилера
      </button>
      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <DealerList />
        </Modal>
      )}
    </>
  );
}

// 2. Форма
export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ...
}

// 3. Локальный UI
export function TyreCardExpanded({ tyre }: { tyre: TyreModel }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div>
      <h3>{tyre.name}</h3>
      <button onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? 'Сховати' : 'Детальніше'}
      </button>
      {showDetails && <TyreDetails tyre={tyre} />}
    </div>
  );
}
```

---

## Context (Редко)

### Когда Нужен

- Тема (dark/light) — уже есть в проекте
- Корзина покупок (если будет)
- Глобальные настройки пользователя

### Пример: Theme Context

```typescript
// lib/ThemeContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Использование

```typescript
// components/ThemeToggle.tsx
"use client";

import { useTheme } from '@/lib/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const ICONS = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const Icon = ICONS[theme];

  return (
    <button
      onClick={() => {
        const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
        setTheme(next);
      }}
      className="p-2 rounded-lg hover:bg-muted"
      aria-label="Змінити тему"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
```

---

## Паттерны

### 1. Разделение Server/Client

```
app/page.tsx          → Server Component (data fetching)
  └── FilterBar.tsx   → Client Component (интерактивность)
  └── TyreGrid.tsx    → Server Component (рендер карточек)
       └── TyreCard   → Server Component (статичная карточка)
```

### 2. Lifting State to URL

```typescript
// ПЛОХО — состояние только в клиенте
const [filters, setFilters] = useState({});

// ХОРОШО — состояние в URL
const searchParams = useSearchParams();
const filters = {
  season: searchParams.get('season'),
  width: searchParams.get('width'),
};
```

### 3. Optimistic Updates

```typescript
"use client";

import { useOptimistic } from 'react';

export function FavoriteButton({ tyreId, isFavorite }: Props) {
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(isFavorite);

  const handleToggle = async () => {
    setOptimisticFavorite(!optimisticFavorite); // Мгновенный UI update
    await toggleFavorite(tyreId); // Асинхронный запрос
  };

  return (
    <button onClick={handleToggle}>
      <Heart className={optimisticFavorite ? 'fill-red-500' : ''} />
    </button>
  );
}
```

---

## Что НЕ использовать

| Библиотека | Причина |
|------------|---------|
| Redux | Overkill для этого проекта |
| Zustand | Не нужен с Server Components |
| Jotai/Recoil | Избыточно |
| React Query | Server Components уже кэшируют |

---

## Чеклист

- [ ] По умолчанию — Server Component
- [ ] Фильтры/сортировка — в URL параметрах
- [ ] `useState` — только для локального UI
- [ ] Context — только для глобальных вещей (тема)
- [ ] Не хранить серверные данные в клиентском state

---

## Связанные Документы

- [Структура Компонентов](./COMPONENT_STRUCTURE.md)
- [API Интеграция](./API_INTEGRATION.md)
- [TypeScript Стандарты](./TYPESCRIPT_STANDARDS.md)
