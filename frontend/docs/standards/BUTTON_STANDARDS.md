# Стандарти Кнопок

**Версія:** 2.0
**Дата:** 2026-01-15
**Статус:** Оновлено

---

## Основні Правила

> **Primary = Silver кнопки для CTAs**
> **Secondary кнопки мають явні stone кольори з dark: варіантами**
> **ЗАБОРОНЕНО: hover:bg-muted, hover:bg-card, border-border без dark:**

---

## Варіанти Кнопок

### Primary — Головна Дія (Silver)

```typescript
<button className="rounded-full bg-primary px-6 py-2.5
                   text-sm font-semibold text-primary-text
                   transition-colors hover:bg-primary-hover">
  Знайти дилера
</button>
```

**Результат:** Сріблястий фон (#D7D9DC), чорний текст, білий hover.

### Secondary — Вторинна Дія (Явні Stone Кольори)

```typescript
// ПРАВИЛЬНО — явні кольори для обох тем
<button className="rounded-full border border-stone-300 bg-transparent
                   px-6 py-2.5 text-sm font-semibold text-stone-700
                   transition-colors hover:bg-stone-100
                   dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700">
  Детальніше
</button>

// НЕПРАВИЛЬНО — неявні кольори
<button className="border border-border hover:bg-muted text-foreground">
```

### Ghost — Мінімальний Стиль

```typescript
<button className="rounded-lg px-4 py-2 text-sm font-medium
                   text-stone-600 transition-colors
                   hover:bg-stone-100 hover:text-stone-900
                   dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100">
  Скасувати
</button>
```

### Brand — Червона (ТІЛЬКИ для спеціальних випадків)

```typescript
// Використовувати ТІЛЬКИ для промо, alerts, brand елементів
<button className="rounded-full bg-brand px-6 py-2.5
                   text-sm font-semibold text-white
                   transition-colors hover:bg-brand-dark">
  Акція
</button>

// Або CSS клас
<button className="btn-brand">Спеціальна пропозиція</button>
```

### Danger — Видалення

```typescript
<button className="rounded-full bg-red-500 px-6 py-2.5
                   text-sm font-semibold text-white
                   transition-colors hover:bg-red-600">
  Видалити
</button>
```

---

## Розміри

### Small (sm)

```typescript
<button className="rounded-full px-3 py-1.5 text-xs font-semibold">
```

### Default

```typescript
<button className="rounded-full px-4 py-2 text-sm font-semibold">
```

### Large (lg)

```typescript
<button className="rounded-full px-6 py-2.5 text-base font-semibold">
```

---

## Кнопки з Іконками

### Іконка Зліва

```typescript
<button className="inline-flex items-center gap-2 rounded-full
                   bg-primary px-4 py-2 text-sm font-semibold text-primary-text">
  <Search className="h-4 w-4" />
  Пошук шин
</button>
```

### Іконка Справа

```typescript
<Link className="inline-flex items-center gap-1 text-sm
                 font-medium text-stone-600 hover:text-stone-900 hover:underline
                 dark:text-stone-400 dark:hover:text-stone-100">
  Детальніше
  <ChevronRight className="h-4 w-4" />
</Link>
```

### Тільки Іконка (Icon Button)

```typescript
<button className="rounded-full p-2 text-stone-500
                   hover:bg-stone-100 hover:text-stone-700
                   dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200
                   transition-colors"
        aria-label="Меню">
  <Menu className="h-5 w-5" />
</button>
```

---

## Стани

### Disabled

```typescript
<button disabled
        className="rounded-full bg-primary px-4 py-2
                   text-sm font-semibold text-primary-text
                   disabled:opacity-50 disabled:cursor-not-allowed">
  Завантаження...
</button>
```

### Loading

```typescript
<button disabled
        className="inline-flex items-center gap-2 rounded-full
                   bg-primary px-4 py-2 text-sm font-semibold text-primary-text
                   disabled:opacity-70">
  <Loader2 className="h-4 w-4 animate-spin" />
  Пошук...
</button>
```

### Focus

```typescript
// Silver focus ring замість red
className="focus:outline-none focus:ring-2 focus:ring-silver/50 focus:ring-offset-2"

// Або використовуйте глобальні focus-visible стилі з globals.css
```

---

## Hero Кнопки

### Адаптивні (змінюються з темою)

```typescript
<section className="hero-adaptive">
  <Link href="/dealers" className="hero-btn-primary-adaptive">
    <MapPin className="h-4 w-4" />
    Знайти дилера
  </Link>
  <Link href="/tyre-search" className="hero-btn-secondary-adaptive">
    Підібрати розмір
  </Link>
</section>
```

### Завжди Темні

```typescript
<section className="hero-dark">
  <Link href="/dealers" className="hero-btn-primary">
    Знайти дилера
  </Link>
  <Link href="/tyre-search" className="hero-btn-secondary">
    Підібрати розмір
  </Link>
</section>
```

---

## Toggle Кнопки (Tabs, Filters)

```typescript
// ПРАВИЛЬНО — явні кольори для active/inactive станів
<button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
  isActive
    ? "bg-primary text-primary-text"
    : "bg-stone-200 text-stone-700 hover:bg-stone-300
       dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
}`}>

// НЕПРАВИЛЬНО — muted backgrounds
<button className={`... ${isActive ? "bg-primary" : "bg-muted hover:bg-muted/80"}`}>
```

---

## Pagination

```typescript
// Active page
<button className="bg-primary text-primary-text rounded-lg px-3 py-1.5">

// Inactive page
<button className="border border-stone-300 bg-white text-stone-700
                   hover:bg-stone-100 rounded-lg px-3 py-1.5
                   dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200
                   dark:hover:bg-stone-700">

// Disabled (prev/next)
<span className="border border-stone-200 bg-stone-100 text-stone-400
                 cursor-not-allowed rounded-lg px-3 py-1.5
                 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-500">
```

---

## Адаптивність

### Перенос Кнопок

```typescript
// ПРАВИЛЬНО — flex-wrap для переносу на мобільних
<div className="flex flex-wrap gap-2">
  <button className="flex-1 min-w-[80px] ...">Кнопка 1</button>
  <button className="flex-1 min-w-[80px] ...">Кнопка 2</button>
</div>

// НЕПРАВИЛЬНО — кнопки вилазять за межі
<div className="flex gap-2">
  <button>Довгий текст кнопки</button>
</div>
```

### Responsive Text

```typescript
<button className="... text-xs sm:text-sm">
  <span className="hidden sm:inline">Пошук шин</span>
  <span className="sm:hidden">Пошук</span>
</button>
```

---

## Картка з Двома Кнопками

```typescript
<div className="mt-auto pt-4 flex flex-wrap gap-2">
  <Link href={`/shyny/${slug}`}
        className="flex-1 min-w-[80px] rounded-full
                   border border-stone-300 px-3 py-1.5
                   text-center text-xs sm:text-sm font-semibold
                   text-stone-700 hover:bg-stone-100
                   dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700">
    Детальніше
  </Link>
  <Link href="/dealers"
        className="flex-1 min-w-[80px] flex items-center justify-center
                   gap-1 rounded-full bg-primary px-3 py-1.5
                   text-xs sm:text-sm font-semibold text-primary-text
                   hover:bg-primary-hover">
    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
    Купити
  </Link>
</div>
```

---

## Чеклист

- [ ] **Primary** використовує `bg-primary text-primary-text` (silver)
- [ ] **Secondary** має явні stone кольори: `border-stone-300 text-stone-700 dark:...`
- [ ] **Немає** `hover:bg-muted` або `hover:bg-card`
- [ ] **Немає** `border-border` без dark: варіанту для кнопок
- [ ] `rounded-full` для скруглень
- [ ] `font-semibold` для тексту
- [ ] `aria-label` для icon buttons
- [ ] `flex-wrap` + `min-w-[80px]` для мобільних

---

## Заборонені Патерни

```typescript
// ЗАБОРОНЕНО
hover:bg-muted                    // Низький контраст
hover:bg-card                     // Неявний hover
border-border text-foreground     // Потребує dark: варіанти
bg-muted/80                       // Opacity backgrounds

// ПРАВИЛЬНО
hover:bg-stone-100 dark:hover:bg-stone-700
border-stone-300 dark:border-stone-600
text-stone-700 dark:text-stone-200
```

---

## Пов'язані Документи

- [Система Кольорів](./COLOR_SYSTEM.md)
- [Картки](./CARD_STYLING.md)
- [Accessibility](./ACCESSIBILITY.md)
