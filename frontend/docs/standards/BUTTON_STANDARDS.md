# Стандарты Кнопок

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Варианты Кнопок

### Primary — Главное Действие

```typescript
<button className="rounded-full bg-primary px-6 py-2.5
                   text-sm font-semibold text-white
                   transition-colors hover:bg-primary/90
                   focus:outline-none focus:ring-2 focus:ring-primary/50">
  Знайти дилера
</button>
```

**Использование:** CTA, форма поиска, главное действие на странице

### Secondary — Вторичное Действие

```typescript
<button className="rounded-full border border-border bg-transparent
                   px-6 py-2.5 text-sm font-semibold text-foreground
                   transition-colors hover:bg-muted
                   focus:outline-none focus:ring-2 focus:ring-border">
  Детальніше
</button>
```

**Использование:** Альтернативное действие, отмена, "Дізнатися більше"

### Ghost — Минимальный Стиль

```typescript
<button className="rounded-lg px-4 py-2 text-sm font-medium
                   text-muted-foreground transition-colors
                   hover:bg-muted hover:text-foreground">
  Скасувати
</button>
```

**Использование:** Навигация, третичные действия

### Danger — Удаление

```typescript
<button className="rounded-full bg-red-500 px-6 py-2.5
                   text-sm font-semibold text-white
                   transition-colors hover:bg-red-600">
  Видалити
</button>
```

**Использование:** Удаление, деструктивные действия

---

## Размеры

### Small (sm)

```typescript
<button className="rounded-full px-3 py-1.5 text-xs font-semibold">
  Текст
</button>
```

### Default

```typescript
<button className="rounded-full px-4 py-2 text-sm font-semibold">
  Текст
</button>
```

### Large (lg)

```typescript
<button className="rounded-full px-6 py-2.5 text-base font-semibold">
  Текст
</button>
```

### Full Width

```typescript
<button className="w-full rounded-full px-4 py-2.5 text-sm font-semibold">
  Текст
</button>
```

---

## Кнопки с Иконками

### Иконка Слева

```typescript
<button className="inline-flex items-center gap-2 rounded-full
                   bg-primary px-4 py-2 text-sm font-semibold text-white">
  <Search className="h-4 w-4" />
  Пошук шин
</button>
```

### Иконка Справа

```typescript
<Link className="inline-flex items-center gap-1 text-sm
                 font-medium text-primary hover:underline">
  Детальніше
  <ChevronRight className="h-4 w-4" />
</Link>
```

### Только Иконка (Icon Button)

```typescript
<button className="rounded-full p-2 text-muted-foreground
                   hover:bg-muted hover:text-foreground
                   transition-colors"
        aria-label="Меню">
  <Menu className="h-5 w-5" />
</button>
```

---

## Состояния

### Disabled

```typescript
<button disabled
        className="rounded-full bg-primary px-4 py-2
                   text-sm font-semibold text-white
                   disabled:opacity-50 disabled:cursor-not-allowed">
  Завантаження...
</button>
```

### Loading

```typescript
<button disabled
        className="inline-flex items-center gap-2 rounded-full
                   bg-primary px-4 py-2 text-sm font-semibold text-white
                   disabled:opacity-70">
  <Loader2 className="h-4 w-4 animate-spin" />
  Пошук...
</button>
```

### Focus

```typescript
// Обязательно добавляйте focus стили!
className="focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
```

---

## Hero Кнопки (Тёмный Фон)

```css
/* globals.css */
.hero-btn-primary {
  @apply inline-flex items-center gap-2 rounded-full
         bg-primary px-6 py-3 text-sm font-semibold text-white
         shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl;
}

.hero-btn-secondary {
  @apply inline-flex items-center gap-2 rounded-full
         border border-stone-600 bg-stone-800/50 px-6 py-3
         text-sm font-semibold text-stone-100
         transition-all hover:bg-stone-700;
}
```

```typescript
<div className="flex flex-wrap gap-4">
  <Link href="/dealers" className="hero-btn-primary">
    <MapPin className="h-4 w-4" />
    Знайти дилера
  </Link>
  <Link href="/tyre-search" className="hero-btn-secondary">
    Підібрати розмір
  </Link>
</div>
```

---

## Адаптивность

### Проблема: Кнопки Выходят за Границы

```typescript
// НЕПРАВИЛЬНО — кнопки могут вылезти
<div className="flex gap-2">
  <button className="px-4 py-2">Длинный текст кнопки</button>
  <button className="px-4 py-2">Ещё одна</button>
</div>

// ПРАВИЛЬНО — кнопки переносятся
<div className="flex flex-wrap gap-2">
  <button className="flex-1 min-w-[80px] px-3 py-1.5
                     text-xs sm:text-sm">
    Длинный текст
  </button>
  <button className="flex-1 min-w-[80px] px-3 py-1.5
                     text-xs sm:text-sm">
    Ещё одна
  </button>
</div>
```

### Скрытие Текста на Мобильных

```typescript
<button className="inline-flex items-center gap-1.5 rounded-full
                   bg-primary px-4 py-2 text-sm font-semibold text-white">
  <Search className="h-4 w-4" />
  <span className="hidden md:inline">Пошук шин</span>
</button>
```

---

## Link vs Button

```typescript
// Button — для действий
<button onClick={handleSubmit}>Відправити</button>
<button onClick={() => setOpen(!open)}>Відкрити меню</button>

// Link — для навигации
<Link href="/dealers">Де купити</Link>
<Link href={`/shyny/${slug}`}>Детальніше</Link>
```

---

## Accessibility

```typescript
// Всегда добавляйте для icon buttons
<button aria-label="Закрити меню">
  <X className="h-5 w-5" />
</button>

// aria-expanded для toggle buttons
<button aria-expanded={isOpen} aria-controls="menu">
  Меню
</button>

// Disabled состояние
<button disabled aria-disabled="true">
  Недоступно
</button>
```

---

## Примеры Использования

### Форма Поиска

```typescript
<form onSubmit={handleSubmit} className="space-y-4">
  {/* Поля формы */}

  <button type="submit"
          disabled={isSearching}
          className="hero-btn-primary w-full">
    {isSearching ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        Пошук...
      </>
    ) : (
      'Знайти шини'
    )}
  </button>
</form>
```

### Карточка с Двумя Кнопками

```typescript
<div className="mt-auto pt-4 flex flex-wrap gap-2">
  <Link href={`/shyny/${slug}`}
        className="flex-1 min-w-[80px] rounded-full border border-border
                   px-3 py-1.5 text-center text-xs sm:text-sm
                   font-semibold hover:bg-muted">
    Детальніше
  </Link>
  <Link href="/dealers"
        className="flex-1 min-w-[80px] flex items-center justify-center
                   gap-1 rounded-full bg-primary px-3 py-1.5
                   text-xs sm:text-sm font-semibold text-white">
    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
    Купити
  </Link>
</div>
```

---

## Чеклист

- [ ] Правильный вариант (primary/secondary/ghost)
- [ ] `rounded-full` для скруглений
- [ ] `font-semibold` для текста
- [ ] Focus стили (ring)
- [ ] Disabled стили если нужно
- [ ] Loading состояние для форм
- [ ] `aria-label` для icon buttons
- [ ] `flex-wrap` в контейнере для мобильных
- [ ] `min-w-[80px]` если кнопки в ряд

---

## Связанные Документы

- [Система Цветов](./COLOR_SYSTEM.md)
- [Карточки](./CARD_STYLING.md)
- [Accessibility](./ACCESSIBILITY.md)
