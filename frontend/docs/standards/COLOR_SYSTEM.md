# Система Цветов — Mini Design System 2026

**Версия:** 2.0
**Дата:** 2026-01-15
**Статус:** Обновлено

---

## Основная Концепція

> **Primary = Silver (CTAs), Brand = Red (лого/alerts)**

Система побудована на премиальній темній темі з сріблястими акцентами. Червоний Bridgestone використовується ТІЛЬКИ для brand елементів.

---

## Заборонені Патерни

### КРИТИЧНО — Ніколи не використовуйте:

```typescript
// ЗАБОРОНЕНО — низький контраст
bg-muted text-muted-foreground    // Обидва приглушені
bg-primary/10 text-primary        // Прозорий фон
hover:bg-muted                    // Hover без контрасту
hover:bg-card                     // Неявний hover

// ЗАБОРОНЕНО — холодні палітри
text-zinc-*, bg-zinc-*
text-gray-*, bg-gray-*
text-slate-*, bg-slate-*
```

### Таблиця Замін

| Заборонено | Заміна |
|------------|--------|
| `bg-muted text-muted-foreground` | `bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200` |
| `bg-primary/10 text-primary` | `bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200` |
| `hover:bg-muted` | `hover:bg-stone-100 dark:hover:bg-stone-700` |
| `hover:bg-card` | `hover:bg-stone-100 dark:hover:bg-stone-700` |
| `border-border` (для кнопок) | `border-stone-300 dark:border-stone-600` |

---

## CSS Змінні (globals.css)

### Light Theme

```css
:root {
  /* Core */
  --background: var(--stone-50);        /* #fafaf9 */
  --foreground: var(--stone-900);       /* #1c1917 */

  /* Primary = Silver (для CTAs) */
  --primary: var(--silver-accent);      /* #D7D9DC */
  --primary-hover: var(--silver-hover); /* #FFFFFF */
  --primary-text: var(--black-base);    /* #0E0E0E */

  /* Brand = Red (тільки лого/alerts) */
  --brand: var(--bridgestone-red);      /* #e30613 */
  --brand-dark: var(--bridgestone-red-dark);

  /* Cards */
  --card: #ffffff;
  --card-foreground: var(--stone-900);
  --border: var(--stone-200);           /* #e7e5e4 */

  /* Muted */
  --muted: var(--stone-500);
  --muted-foreground: var(--stone-700);
}
```

### Dark Theme

```css
:root[data-theme="dark"] {
  /* Core */
  --background: var(--black-base);      /* #0E0E0E */
  --foreground: var(--text-primary);    /* #E0E0E0 */

  /* Primary = Silver */
  --primary: var(--silver-accent);
  --primary-text: var(--black-base);

  /* Cards */
  --card: var(--graphite);              /* #24282C */
  --card-foreground: var(--text-primary);
  --border: var(--border-dark);         /* #2F3438 */

  /* Muted */
  --muted: var(--text-secondary);       /* #8B8F94 */
  --muted-foreground: var(--text-muted); /* #6F7378 */
}
```

### Нові Токени

```css
/* Dark Palette */
--black-base: #0E0E0E;
--wet-asphalt: #1C1F22;
--graphite: #24282C;
--graphite-hover: #2A2F34;

/* Silver Accent System */
--silver-accent: #D7D9DC;
--silver-hover: #FFFFFF;
--silver-muted: #BFC3C7;
--border-dark: #2F3438;

/* Text Hierarchy (dark theme) */
--text-primary: #E0E0E0;
--text-secondary: #8B8F94;
--text-muted: #6F7378;
```

---

## Використання в Коді

### 1. Primary Кнопки (Silver)

```typescript
// ПРАВИЛЬНО — срібляста кнопка
<button className="bg-primary text-primary-text hover:bg-primary-hover">
  Знайти дилера
</button>

// Результат: сріблястий фон, чорний текст
```

### 2. Brand Елементи (Red) — ТІЛЬКИ для спеціальних випадків

```typescript
// Тільки для лого, alerts, promo badges
<span className="bg-brand text-white">Акція</span>

// CSS клас
<button className="btn-brand">Спеціальна пропозиція</button>
```

### 3. Secondary Кнопки — Явні Stone Кольори

```typescript
// ПРАВИЛЬНО
<button className="border-stone-300 text-stone-700 hover:bg-stone-100
                   dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700">
  Детальніше
</button>

// НЕПРАВИЛЬНО
<button className="border-border text-foreground hover:bg-muted">
```

### 4. Badges — Явні Кольори

```typescript
// Neutral badge
<span className="bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200">
  Тег
</span>

// Active badge
<span className="bg-primary text-primary-text">
  Активний
</span>

// Semantic badges
<span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
  Сервіс
</span>
```

### 5. Cards

```typescript
<div className="border border-border bg-card text-card-foreground">
  <h3 className="text-foreground">Заголовок</h3>
  <p className="text-muted-foreground">Опис</p>
</div>
```

---

## Hero Секції

### Адаптивний Hero (змінюється з темою)

```typescript
<section className="hero-adaptive">
  <h1 className="hero-title-adaptive">Заголовок</h1>
  <p className="hero-text-adaptive">Текст</p>
  <button className="hero-btn-primary-adaptive">CTA</button>
  <button className="hero-btn-secondary-adaptive">Secondary</button>
</section>
```

### Завжди Темний Hero

```typescript
<section className="hero-dark">
  <h1 className="hero-title">Заголовок</h1>
  <p className="hero-text">Текст</p>
  <button className="hero-btn-primary">CTA</button>
</section>
```

---

## Season Кольори

Визначені в `lib/utils/tyres.ts`:

| Сезон | Background | Text | Light BG (icons) |
|-------|-----------|------|------------------|
| Summer | `bg-emerald-500` | `text-emerald-500` | `bg-emerald-500/15` |
| Winter | `bg-sky-500` | `text-sky-400` | `bg-sky-500/15` |
| Allseason | `bg-amber-500` | `text-amber-500` | `bg-amber-500/15` |

### Season Badge (Gradient)

```css
/* Літо — зелений (emerald gradient) */
.badge-summer {
  background: linear-gradient(135deg, #34d399, #059669);
  color: white;
}

/* Зима — синій (sky gradient) */
.badge-winter {
  background: linear-gradient(135deg, #38bdf8, #0284c7);
  color: white;
}

/* Всесезон — оранжевий (amber gradient) */
.badge-allseason {
  background: linear-gradient(135deg, #fb923c, #ea580c);
  color: white;
}
```

### Season Icon Container

```typescript
// Іконка сезону з кольоровим фоном
<div className="rounded-full bg-emerald-500/15 p-2">
  <Sun className="h-5 w-5 text-emerald-500" />
</div>
```

---

## Feature Icon Кольори

Стандартизовані в `lib/utils/tyres.ts`. Для контейнерів іконок:

| Icon | Background | Text |
|------|-----------|------|
| car | `bg-blue-500/15` | `text-blue-500` |
| shield | `bg-emerald-500/15` | `text-emerald-500` |
| zap | `bg-amber-500/15` | `text-amber-500` |
| thermometer | `bg-red-500/15` | `text-red-500` |
| star | `bg-purple-500/15` | `text-purple-500` |
| globe | `bg-teal-500/15` | `text-teal-500` |
| users | `bg-pink-500/15` | `text-pink-500` |
| mapPin | `bg-rose-500/15` | `text-rose-500` |

---

## Feature List Pattern

Для списків переваг/фіч з іконками:

```typescript
<ul className="space-y-3 text-sm">
  {features.map((feat) => (
    <li className="flex items-start gap-3">
      {/* Icon container */}
      <div className={`mt-1 rounded-full ${feat.color.bg} p-1.5`}>
        <feat.icon className={`h-4 w-4 ${feat.color.text}`} />
      </div>

      {/* Text */}
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

**Важливо:** Для тексту в feature lists використовуються **явні stone кольори з dark: варіантами**, НЕ семантичні класи.

---

## CTA Секції (Завжди Темні)

CTA блоки використовують `bg-graphite` і завжди темні:

```typescript
<section className="py-16">
  <div className="container mx-auto max-w-4xl px-4 text-center">
    <div className="rounded-3xl bg-graphite p-10 text-white shadow-2xl">
      <h3 className="mb-4 text-3xl font-bold">Заголовок</h3>
      <p className="mb-8 text-lg opacity-90">Опис</p>

      <div className="flex flex-wrap justify-center gap-4">
        {/* Primary - білий */}
        <Link
          href="/contacts"
          className="rounded-full bg-white px-8 py-3 font-semibold text-graphite hover:bg-stone-100"
        >
          Primary CTA
        </Link>

        {/* Secondary - прозорий з білою рамкою */}
        <Link
          href="/dealers"
          className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10"
        >
          Secondary CTA
        </Link>
      </div>
    </div>
  </div>
</section>
```

---

## Контрастність WCAG AA

### Мінімальні Вимоги

- **Звичайний текст:** 4.5:1
- **Великий текст (≥18px):** 3:1
- **UI компоненти:** 3:1

### Гарантовані Пари

```typescript
// Light theme
bg-card + text-foreground              // ✓
bg-stone-200 + text-stone-700          // ✓
bg-primary + text-primary-text         // ✓

// Dark theme
bg-graphite + text-primary             // ✓
bg-stone-700 + text-stone-200          // ✓
```

---

## Тіні

```css
/* Теплі тіні (stone tint) */
--shadow-color: 28, 25, 23;
--shadow-sm: 0 1px 2px rgba(var(--shadow-color), 0.05);
--shadow-md: 0 4px 16px rgba(var(--shadow-color), 0.1);
--shadow-lg: 0 8px 32px rgba(var(--shadow-color), 0.12);

/* Glow ефекти — срібляста, не червона */
--shadow-glow: 0 0 40px rgba(215, 217, 220, 0.25);
--shadow-glow-brand: 0 0 40px rgba(227, 6, 19, 0.3); /* тільки для brand */
```

---

## Чеклист Перед Комітом

- [ ] Немає `bg-muted text-muted-foreground` комбінацій
- [ ] Немає `bg-primary/10 text-primary` (opacity backgrounds)
- [ ] Немає `hover:bg-muted` або `hover:bg-card`
- [ ] Кнопки мають явні stone кольори з `dark:` варіантами
- [ ] Немає zinc/gray/slate класів
- [ ] Primary використовується для CTAs (silver)
- [ ] Brand використовується тільки для лого/alerts
- [ ] Hero секції використовують `hero-adaptive` або `hero-dark`

### Команди для Перевірки

```bash
# Знайти заборонені патерни
rg "bg-muted.*text-muted-foreground" frontend/src/
rg "bg-primary/10.*text-primary" frontend/src/
rg "hover:bg-muted|hover:bg-card" frontend/src/
rg "zinc-|gray-|slate-" frontend/src/
```

---

## Пов'язані Документи

- [Кнопки](./BUTTON_STANDARDS.md)
- [Темна Тема](./DARK_MODE.md)
- [Картки](./CARD_STYLING.md)
