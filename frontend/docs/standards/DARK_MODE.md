# Тёмная Тема

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Архитектура

Тёмная тема реализована через:
1. **CSS переменные** — цвета определены в globals.css
2. **Tailwind dark:** — класс dark на html элементе
3. **System preference** — автоопределение темы системы

---

## CSS Переменные

### Light Theme (Default)

```css
/* globals.css */
:root {
  --background: 0 0% 100%;          /* white */
  --foreground: 30 10% 10%;         /* stone-900 */

  --card: 0 0% 100%;
  --card-foreground: 30 10% 10%;

  --primary: 0 83% 44%;             /* Bridgestone red */
  --primary-foreground: 0 0% 100%;

  --muted: 30 10% 96%;              /* stone-100 */
  --muted-foreground: 30 10% 45%;   /* stone-500 */

  --border: 30 10% 90%;             /* stone-200 */
}
```

### Dark Theme

```css
.dark {
  --background: 30 10% 7%;          /* stone-950 */
  --foreground: 30 10% 95%;         /* stone-100 */

  --card: 30 10% 12%;               /* stone-900 */
  --card-foreground: 30 10% 95%;

  --primary: 0 83% 50%;             /* чуть светлее для контраста */
  --primary-foreground: 0 0% 100%;

  --muted: 30 10% 18%;              /* stone-800 */
  --muted-foreground: 30 10% 60%;   /* stone-400 */

  --border: 30 10% 25%;             /* stone-700 */
}
```

---

## Использование в Компонентах

### Семантические Классы (Предпочтительно)

```typescript
// ПРАВИЛЬНО — автоматически адаптируется к теме
<div className="bg-background text-foreground">
<div className="bg-card border-border">
<div className="text-muted-foreground">
<button className="bg-primary text-primary-foreground">
```

### Dark: Модификатор

```typescript
// Когда нужны разные цвета в темах
<div className="bg-stone-100 dark:bg-stone-800">
<div className="text-stone-700 dark:text-stone-300">
<div className="border-stone-200 dark:border-stone-700">
```

### Hero Секции

```typescript
// Hero всегда тёмный — независимо от темы
<section className="hero-dark">
  {/* Контент внутри использует light цвета */}
  <h1 className="text-white">Заголовок</h1>
  <p className="text-white/80">Описание</p>
</section>

// CSS для hero-dark
.hero-dark {
  @apply bg-stone-900 text-white;
}
```

---

## Компоненты

### Карточка

```typescript
function TyreCard({ tyre }: Props) {
  return (
    <article className="rounded-2xl border border-border bg-card overflow-hidden
                        hover:shadow-md transition-shadow">
      {/* Изображение с адаптивным фоном */}
      <div className="aspect-square bg-stone-50 dark:bg-stone-800">
        <Image src={tyre.image.url} ... />
      </div>

      {/* Контент */}
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground">{tyre.name}</h3>
        <p className="text-muted-foreground">{tyre.description}</p>
      </div>
    </article>
  );
}
```

### Badge

```typescript
const SEASON_STYLES = {
  summer: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  winter: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'all-season': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
} as const;

function SeasonBadge({ season }: { season: Season }) {
  return (
    <span className={cn(
      'inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium',
      SEASON_STYLES[season]
    )}>
      {seasonLabels[season]}
    </span>
  );
}
```

### Skeleton

```typescript
// Skeleton адаптируется к теме
function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'animate-pulse rounded-lg',
      'bg-stone-200 dark:bg-stone-700',  // Разные цвета для тем
      className
    )} />
  );
}
```

---

## Theme Toggle

### Компонент Переключателя

```typescript
"use client";

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex rounded-lg border border-border p-1">
      <button
        onClick={() => setTheme('light')}
        className={cn(
          'p-2 rounded-md transition-colors',
          theme === 'light' ? 'bg-muted' : 'hover:bg-muted/50'
        )}
        aria-label="Світла тема"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'p-2 rounded-md transition-colors',
          theme === 'dark' ? 'bg-muted' : 'hover:bg-muted/50'
        )}
        aria-label="Темна тема"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          'p-2 rounded-md transition-colors',
          theme === 'system' ? 'bg-muted' : 'hover:bg-muted/50'
        )}
        aria-label="Системна тема"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}
```

### next-themes Setup

```typescript
// app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## Контрастность

### Минимальные Требования (WCAG AA)

| Элемент | Требование |
|---------|------------|
| Обычный текст | 4.5:1 |
| Крупный текст (18px+) | 3:1 |
| UI элементы | 3:1 |

### Проверенные Комбинации

```typescript
// Light Theme
'text-foreground'     // stone-900 на white — 15:1 ✓
'text-muted-foreground' // stone-500 на white — 5.6:1 ✓

// Dark Theme
'text-foreground'     // stone-100 на stone-950 — 14:1 ✓
'text-muted-foreground' // stone-400 на stone-950 — 5.2:1 ✓

// Primary Button
'bg-primary text-white' // red на white — 4.8:1 ✓
```

### Проблемные Комбинации (Избегать)

```typescript
// Недостаточный контраст
'text-stone-400'       // На light bg — 3.8:1 ✗
'text-stone-600'       // На dark bg — 4.0:1 ✗

// Решение — использовать muted-foreground
'text-muted-foreground' // Адаптируется к теме
```

---

## Изображения

### Логотипы

```typescript
// Логотип меняется в зависимости от темы
<Image
  src="/logo-dark.svg"
  alt="Bridgestone"
  className="block dark:hidden"
/>
<Image
  src="/logo-light.svg"
  alt="Bridgestone"
  className="hidden dark:block"
/>
```

### Иконки

```typescript
// Иконки используют currentColor
<Sun className="h-5 w-5" /> // Наследует цвет от родителя

// Или явно указываем цвет
<Sun className="h-5 w-5 text-foreground" />
```

---

## Градиенты и Тени

### Градиенты

```typescript
// Адаптивный градиент
<div className="bg-gradient-to-b from-background to-muted">

// Или явно для каждой темы
<div className="bg-gradient-to-b from-white to-stone-100
                dark:from-stone-950 dark:to-stone-900">
```

### Тени

```typescript
// Тени слабее в тёмной теме
<div className="shadow-md dark:shadow-stone-900/50">

// Или используйте border вместо shadow
<div className="border border-border">
```

---

## Правила

### DO

```typescript
// Используйте семантические цвета
className="bg-background text-foreground"
className="bg-card border-border"
className="text-muted-foreground"

// Используйте dark: модификатор когда нужно
className="bg-stone-100 dark:bg-stone-800"

// Проверяйте контраст в обеих темах
```

### DON'T

```typescript
// Не используйте hardcoded цвета
className="bg-white text-black"          // Не адаптируется
className="bg-#f5f5f5"                   // Не адаптируется

// Не забывайте про dark: версию
className="bg-stone-100"                  // Слишком светлый в dark mode
className="text-stone-700"                // Низкий контраст в dark mode
```

---

## Чеклист

- [ ] Все цвета через CSS переменные или dark: модификатор
- [ ] Проверен контраст в обеих темах (WCAG AA)
- [ ] Skeleton/Loading адаптируются к теме
- [ ] Логотипы есть для обеих тем
- [ ] Тени и градиенты адаптируются
- [ ] Hero секции корректно отображаются
- [ ] Theme toggle доступен в UI

---

## Связанные Документы

- [Система Цветов](./COLOR_SYSTEM.md)
- [Accessibility](./ACCESSIBILITY.md)
- [Стилизация Карточек](./CARD_STYLING.md)
