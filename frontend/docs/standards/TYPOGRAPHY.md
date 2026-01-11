# Типографика

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Шрифты

### Основной Шрифт — Geist

```typescript
// layout.tsx
import { Geist } from 'next/font/google';

const geist = Geist({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-geist',
});
```

Geist — современный sans-serif шрифт от Vercel, оптимизированный для Next.js. Поддерживает кириллицу для украинского UI.

---

## Размеры Текста

| Класс | Размер | Использование |
|-------|--------|---------------|
| `text-xs` | 12px | Мелкий текст, badges, labels |
| `text-sm` | 14px | Вторичный текст, описания |
| `text-base` | 16px | Основной текст |
| `text-lg` | 18px | Подзаголовки, акценты |
| `text-xl` | 20px | Заголовки карточек |
| `text-2xl` | 24px | Заголовки секций (мобильные) |
| `text-3xl` | 30px | Заголовки секций |
| `text-4xl` | 36px | H1 на страницах |

---

## Иерархия Заголовков

### H1 — Главный Заголовок Страницы

```typescript
<h1 className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.7rem]">
  Легкові шини Bridgestone
  <span className="mt-1 block text-base font-normal text-muted-foreground md:text-lg">
    підзаголовок сторінки
  </span>
</h1>
```

### H2 — Заголовок Секции

```typescript
<h2 className="mb-4 text-2xl font-bold md:text-3xl">
  Популярні моделі
</h2>
```

### H3 — Заголовок Карточки

```typescript
<h3 className="text-xl font-bold">
  {tyre.name}
</h3>
```

### H4 — Подзаголовок в Карточке

```typescript
<h4 className="font-semibold text-foreground">
  Технічні характеристики
</h4>
```

---

## Font Weight

| Класс | Вес | Использование |
|-------|-----|---------------|
| `font-normal` | 400 | Основной текст |
| `font-medium` | 500 | Важный текст, labels |
| `font-semibold` | 600 | Заголовки, кнопки |
| `font-bold` | 700 | Главные заголовки |

---

## Line Height

```typescript
// Заголовки — tight
<h1 className="text-4xl leading-tight">Заголовок</h1>
// или
<h1 className="text-4xl tracking-tight">Заголовок</h1>

// Основной текст — normal (по умолчанию)
<p className="text-base">Текст параграфа</p>

// Длинный текст — relaxed
<article className="prose leading-relaxed">
  {/* Контент статьи */}
</article>
```

---

## Цвета Текста

```typescript
// Основной текст
<p className="text-foreground">Основной текст</p>

// Вторичный текст
<p className="text-muted-foreground">Вторичный текст</p>

// Hero секция (тёмный фон)
<p className="text-stone-100">Текст на тёмном фоне</p>
<p className="text-stone-400">Приглушённый на тёмном</p>

// Акцентный (primary)
<span className="text-primary">Важно!</span>
```

---

## Типичные Паттерны

### Hero Заголовок

```typescript
<h1 className="hero-title mb-4 text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.9rem]">
  Легкові шини Bridgestone
  <span className="hero-subtitle mt-1 block text-base font-normal md:text-lg">
    технічний підбір для щоденних поїздок
  </span>
</h1>
```

### Заголовок Секции с Описанием

```typescript
<div className="mb-10 text-center">
  <h2 className="mb-4 text-3xl font-bold">Поради експертів</h2>
  <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
    Корисні статті про вибір та догляд за шинами
  </p>
</div>
```

### Карточка Шины

```typescript
<div className="p-4">
  <h3 className="font-bold text-foreground line-clamp-2">
    {tyre.name}
  </h3>
  <p className="mt-1 text-sm text-muted-foreground">
    {tyre.sizes.length} розмірів
  </p>
  <p className="text-sm uppercase tracking-wide text-primary">
    {seasonLabels[tyre.season]}
  </p>
</div>
```

### Badge Текст

```typescript
<span className="text-xs font-medium uppercase tracking-wide">
  Новинка
</span>

// или
<span className="text-[11px] uppercase tracking-wide">
  Модель шини
</span>
```

---

## Truncation

```typescript
// Одна строка
<p className="truncate">Длинный текст...</p>

// Несколько строк
<p className="line-clamp-2">
  Длинный текст который будет обрезан после двух строк...
</p>

// Три строки для описаний
<p className="line-clamp-3 text-sm text-muted-foreground">
  {description}
</p>
```

---

## Responsive Типографика

```typescript
// Заголовок
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Заголовок
</h1>

// Подзаголовок
<span className="text-sm md:text-base lg:text-lg">
  Подзаголовок
</span>

// Кнопки
<button className="text-xs sm:text-sm">
  Текст кнопки
</button>
```

---

## Чеклист

- [ ] Используются стандартные Tailwind text-* классы
- [ ] Правильная иерархия h1 → h2 → h3
- [ ] Цвета текста через semantic классы
- [ ] Responsive размеры для заголовков
- [ ] `line-clamp` для длинного текста
- [ ] `tracking-tight` для заголовков
- [ ] `uppercase tracking-wide` для labels

---

## Связанные Документы

- [Система Цветов](./COLOR_SYSTEM.md)
- [Spacing](./SPACING_GUIDE.md)
- [Карточки](./CARD_STYLING.md)
