# Темна Тема — Mini Design System 2026

**Версія:** 2.0
**Дата:** 2026-01-15
**Статус:** Оновлено

---

## Архітектура

Темна тема реалізована через:
1. **CSS змінні** — кольори визначені в globals.css
2. **data-theme="dark"** — атрибут на html елементі (НЕ .dark клас)
3. **Tailwind v4** — @custom-variant для dark режиму

```css
/* Tailwind v4: dark mode via data-theme attribute */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

---

## Основні Токени

### Light Theme

```css
:root {
  --background: var(--stone-50);        /* #fafaf9 */
  --foreground: var(--stone-900);       /* #1c1917 */
  --card: #ffffff;
  --border: var(--stone-200);           /* #e7e5e4 */
  --primary: var(--silver-accent);      /* #D7D9DC */
  --primary-text: var(--black-base);    /* #0E0E0E */
}
```

### Dark Theme

```css
:root[data-theme="dark"] {
  --background: var(--black-base);      /* #0E0E0E */
  --foreground: var(--text-primary);    /* #E0E0E0 */
  --card: var(--graphite);              /* #24282C */
  --border: var(--border-dark);         /* #2F3438 */
  --primary: var(--silver-accent);      /* #D7D9DC */
  --primary-text: var(--black-base);    /* #0E0E0E */
}
```

---

## Hero Секції

### Адаптивний Hero (hero-adaptive)

Змінює кольори залежно від теми. Використовується на внутрішніх сторінках.

```typescript
<section className="hero-adaptive">
  <h1 className="hero-title-adaptive">Заголовок</h1>
  <p className="hero-subtitle-adaptive">Підзаголовок</p>
  <p className="hero-text-adaptive">Основний текст</p>

  <div className="hero-badge-adaptive">Badge</div>
  <span className="hero-tag-adaptive">Tag</span>

  <div className="hero-card-adaptive">
    {/* Картка з зображенням */}
  </div>

  <button className="hero-btn-primary-adaptive">Primary CTA</button>
  <button className="hero-btn-secondary-adaptive">Secondary</button>
</section>
```

**CSS класи (globals.css):**

| Клас | Light Theme | Dark Theme |
|------|-------------|------------|
| `hero-adaptive` | Silver gradient | Dark gradient |
| `hero-title-adaptive` | stone-900 | white |
| `hero-subtitle-adaptive` | stone-500 | white/70 |
| `hero-text-adaptive` | stone-600 | white/70 |
| `hero-btn-primary-adaptive` | `#1c1917` bg, white text | White bg, `#1c1917` text |
| `hero-btn-secondary-adaptive` | White bg, dark text, border | Transparent, white text, white border |
| `hero-card-adaptive` | White gradient | Dark gradient |
| `hero-breadcrumb-adaptive` | stone colors | white/transparent |
| `hero-form-card-adaptive` | white bg, border | transparent bg |
| `hero-form-title-adaptive` | stone-900 | white |
| `hero-form-text-adaptive` | stone-600 | white/70 |
| `hero-tabs-adaptive` | stone-100 bg | white/10 bg |
| `hero-tab-adaptive` | stone-500 text | white/60 text |
| `hero-tab-active-adaptive` | white bg, dark text | white bg, dark text |
| `hero-input-adaptive` | stone-100 bg, dark text | dark bg, white text |

**Важливо:** Hero кнопки **інвертуються** між темами — primary темна в light theme, світла в dark theme.

### Завжди Темний Hero (hero-dark)

Фон завжди темний, незалежно від теми. Використовується на головній сторінці.

```typescript
<section className="hero-dark">
  <h1 className="hero-title">Заголовок</h1>
  <p className="hero-text">Текст</p>
  <button className="hero-btn-primary">CTA</button>
  <button className="hero-btn-secondary">Secondary</button>

  <div className="hero-badge">Badge</div>
  <div className="hero-card">Card</div>
  <input className="hero-input" />
</section>
```

---

## Використання в Компонентах

### Семантичні Класи (Рекомендовано)

```typescript
// Автоматично адаптуються до теми
<div className="bg-background text-foreground">
<div className="bg-card border-border">
<div className="text-muted-foreground">
<button className="bg-primary text-primary-text">
```

### Явні dark: Модифікатори

```typescript
// Коли потрібні різні кольори в темах
<div className="bg-stone-100 dark:bg-stone-800">
<div className="text-stone-700 dark:text-stone-300">
<div className="border-stone-200 dark:border-stone-700">
```

### Картка

```typescript
function TyreCard({ tyre }: Props) {
  return (
    <article className="rounded-2xl border border-border bg-card overflow-hidden
                        hover:shadow-md transition-shadow">
      {/* Зображення з адаптивним фоном */}
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

### Badge з dark: варіантами

```typescript
// ПРАВИЛЬНО — явні кольори для обох тем
<span className="bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200">
  Tag
</span>

// Semantic badges
<span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
  Сервіс
</span>

// НЕПРАВИЛЬНО — opacity backgrounds
<span className="bg-green-500/10 text-green-600">
```

### Skeleton

```typescript
function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'animate-pulse rounded-lg',
      'bg-stone-200 dark:bg-stone-700',
      className
    )} />
  );
}
```

### Feature List (з кольоровими іконками)

Для списків переваг/фіч використовуйте **явні stone кольори з dark: варіантами**:

```typescript
<ul className="space-y-3 text-sm">
  {features.map((feat) => (
    <li className="flex items-start gap-3">
      {/* Icon container - кольорові, працюють в обох темах */}
      <div className="mt-1 rounded-full bg-emerald-500/15 p-1.5">
        <Shield className="h-4 w-4 text-emerald-500" />
      </div>

      {/* Text - явні stone кольори */}
      <div>
        <p className="font-medium text-stone-900 dark:text-white">
          {feat.title}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400 md:text-sm">
          {feat.description}
        </p>
      </div>
    </li>
  ))}
</ul>
```

---

## Theme Toggle

### Компонент Перемикача

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
          theme === 'light'
            ? 'bg-stone-200 dark:bg-stone-700'
            : 'hover:bg-stone-100 dark:hover:bg-stone-800'
        )}
        aria-label="Світла тема"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'p-2 rounded-md transition-colors',
          theme === 'dark'
            ? 'bg-stone-200 dark:bg-stone-700'
            : 'hover:bg-stone-100 dark:hover:bg-stone-800'
        )}
        aria-label="Темна тема"
      >
        <Moon className="h-4 w-4" />
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
          attribute="data-theme"  // ВАЖЛИВО: data-theme, не class
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

## Контрастність

### Мінімальні Вимоги (WCAG AA)

| Елемент | Вимога |
|---------|--------|
| Звичайний текст | 4.5:1 |
| Великий текст (18px+) | 3:1 |
| UI елементи | 3:1 |

### Перевірені Комбінації

```typescript
// Light Theme
bg-card + text-foreground              // 15:1 ✓
bg-stone-200 + text-stone-700          // 5.6:1 ✓
bg-primary + text-primary-text         // 12:1 ✓ (silver + black)

// Dark Theme
bg-graphite + text-primary             // 10:1 ✓
bg-stone-700 + text-stone-200          // 5.2:1 ✓
```

### Проблемні Комбінації (Уникати)

```typescript
// ЗАБОРОНЕНО — низький контраст
bg-muted + text-muted-foreground       // Обидва приглушені
bg-primary/10 + text-primary           // Opacity backgrounds
```

---

## Зображення

### Логотипи

```typescript
// Логотип змінюється залежно від теми
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

### Іконки

```typescript
// Іконки наслідують колір від батька
<Sun className="h-5 w-5" />

// Або явно вказуємо колір
<Sun className="h-5 w-5 text-foreground" />
```

---

## Градієнти та Тіні

### Градієнти

```typescript
// Адаптивний градієнт
<div className="bg-gradient-to-b from-background to-muted">

// Явно для кожної теми
<div className="bg-gradient-to-b from-white to-stone-100
                dark:from-stone-950 dark:to-stone-900">
```

### Тіні

```typescript
// Тіні слабші в темній темі
<div className="shadow-md dark:shadow-stone-900/50">

// Glow ефекти — сріблясті
<div className="hover:shadow-glow">
```

---

## Правила

### DO

```typescript
// Використовуйте семантичні кольори
className="bg-background text-foreground"
className="bg-card border-border"
className="text-muted-foreground"

// Використовуйте dark: модифікатор
className="bg-stone-100 dark:bg-stone-800"

// Явні кольори для badges/buttons
className="bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200"

// Hero секції використовують спеціальні класи
className="hero-adaptive" або "hero-dark"
```

### DON'T

```typescript
// Не використовуйте hardcoded кольори
className="bg-white text-black"          // Не адаптується
className="bg-#f5f5f5"                   // Не адаптується

// Не забувайте про dark: версію
className="bg-stone-100"                  // Занадто світлий в dark mode
className="text-stone-700"                // Низький контраст в dark mode

// Не використовуйте .dark клас
<html className="dark">                   // НЕПРАВИЛЬНО
<html data-theme="dark">                  // ПРАВИЛЬНО

// Не використовуйте opacity backgrounds для тексту
className="bg-primary/10 text-primary"    // Низький контраст
className="bg-muted text-muted-foreground" // Низький контраст
```

---

## Чеклист

- [ ] Всі кольори через CSS змінні або dark: модифікатор
- [ ] **data-theme="dark"** замість .dark класу
- [ ] Перевірено контраст в обох темах (WCAG AA)
- [ ] Badges мають явні кольори з dark: варіантами
- [ ] Buttons використовують явні stone кольори
- [ ] Skeleton/Loading адаптуються до теми
- [ ] Логотипи є для обох тем
- [ ] Hero секції використовують `hero-adaptive` або `hero-dark`
- [ ] Theme toggle використовує `attribute="data-theme"`

---

## Пов'язані Документи

- [Система Кольорів](./COLOR_SYSTEM.md)
- [Кнопки](./BUTTON_STANDARDS.md)
- [Accessibility](./ACCESSIBILITY.md)
- [Картки](./CARD_STYLING.md)
