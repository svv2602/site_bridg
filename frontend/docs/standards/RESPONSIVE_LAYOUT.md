# Адаптивная Вёрстка

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Breakpoints

| Префикс | Ширина | Устройства |
|---------|--------|------------|
| (default) | 0px+ | Мобильные |
| `sm:` | 640px+ | Большие мобильные |
| `md:` | 768px+ | Планшеты |
| `lg:` | 1024px+ | Ноутбуки |
| `xl:` | 1280px+ | Десктопы |
| `2xl:` | 1536px+ | Большие экраны |

---

## Mobile-First Подход

Всегда начинайте с мобильной версии:

```typescript
// ПРАВИЛЬНО — mobile-first
<div className="text-sm md:text-base lg:text-lg">
  {/* Мобильный: text-sm */}
  {/* Планшет: text-base */}
  {/* Десктоп: text-lg */}
</div>

// НЕПРАВИЛЬНО — desktop-first
<div className="text-lg md:text-base sm:text-sm">
  {/* Путаница! */}
</div>
```

---

## Container

```typescript
<div className="container mx-auto max-w-7xl px-4 md:px-8">
  {/* Контент */}
</div>
```

- `max-w-7xl` — максимальная ширина 1280px
- `px-4 md:px-8` — горизонтальные отступы

---

## Grid Layout

### Карточки Шин

```typescript
// 1 колонка → 2 → 3 → 4
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {tyres.map(tyre => <TyreCard key={tyre.id} tyre={tyre} />)}
</div>
```

### Hero Секция

```typescript
// Stack на мобильных, 2 колонки на десктопе
<div className="grid gap-8 lg:grid-cols-2">
  <div>{/* Текст */}</div>
  <div>{/* Изображение/форма */}</div>
</div>
```

### Фичи

```typescript
// 1 → 2 → 4 колонки
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {features.map(f => <FeatureCard key={f.title} {...f} />)}
</div>
```

---

## Навигация

### Desktop — Горизонтальное Меню

```typescript
<nav className="hidden items-center gap-1 lg:flex">
  {links.map(link => (
    <Link key={link.href} href={link.href}
          className="px-3 py-2 text-sm font-medium">
      {link.label}
    </Link>
  ))}
</nav>
```

### Mobile — Бургер Меню

```typescript
<button className="lg:hidden rounded-full p-2"
        onClick={() => setMenuOpen(true)}>
  <Menu className="h-5 w-5" />
</button>
```

---

## Текст

### Заголовки

```typescript
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Заголовок
</h1>

<h2 className="text-xl md:text-2xl lg:text-3xl font-bold">
  Подзаголовок
</h2>
```

### Кнопки

```typescript
// Меньше шрифт на мобильных
<button className="text-xs sm:text-sm font-semibold">
  Текст кнопки
</button>
```

---

## Предотвращение Overflow

### Проблема: Кнопки Вылезают

```typescript
// ПРОБЛЕМА
<div className="flex gap-4">
  <button className="px-6">Длинный текст</button>
  <button className="px-6">Ещё кнопка</button>
</div>

// РЕШЕНИЕ
<div className="flex flex-wrap gap-2">
  <button className="flex-1 min-w-[100px] px-3 text-xs sm:text-sm">
    Длинный текст
  </button>
  <button className="flex-1 min-w-[100px] px-3 text-xs sm:text-sm">
    Ещё кнопка
  </button>
</div>
```

### Проблема: Текст Не Помещается

```typescript
// ПРОБЛЕМА
<h3>{veryLongTitle}</h3>

// РЕШЕНИЕ
<h3 className="line-clamp-2">{veryLongTitle}</h3>
// или
<h3 className="truncate">{veryLongTitle}</h3>
```

### Проблема: Таблица Вылезает

```typescript
// РЕШЕНИЕ — горизонтальный скролл
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* ... */}
  </table>
</div>
```

---

## Скрытие/Показ Элементов

```typescript
// Скрыть на мобильных
<span className="hidden md:inline">Полный текст</span>

// Показать только на мобильных
<span className="md:hidden">Кратко</span>

// Скрыть текст, оставить иконку
<button>
  <Search className="h-4 w-4" />
  <span className="hidden sm:inline ml-2">Пошук</span>
</button>
```

---

## Spacing

```typescript
// Увеличение отступов на больших экранах
<section className="py-8 md:py-12 lg:py-16">
  <div className="px-4 md:px-8">
    {/* Контент */}
  </div>
</section>

// Gap в grid
<div className="grid gap-4 md:gap-6 lg:gap-8">
  {/* Карточки */}
</div>
```

---

## Тестирование

### Важные Размеры для Проверки

| Ширина | Устройство |
|--------|------------|
| 320px | iPhone SE |
| 375px | iPhone 12/13 |
| 414px | iPhone Plus |
| 768px | iPad |
| 1024px | iPad Pro / Laptop |
| 1280px | Desktop |
| 1536px | Large Desktop |

### Chrome DevTools

1. F12 → Toggle Device Toolbar
2. Выберите устройство или введите размер
3. Проверьте все breakpoints

---

## Чеклист

- [ ] Mobile-first подход
- [ ] Проверено на 320px
- [ ] Grid адаптируется к экрану
- [ ] Кнопки не вылезают (`flex-wrap`, `min-w-`)
- [ ] Текст обрезается (`line-clamp`, `truncate`)
- [ ] Таблицы скроллятся (`overflow-x-auto`)
- [ ] Навигация переключается на бургер
- [ ] Spacing увеличивается на десктопе

---

## Связанные Документы

- [Spacing](./SPACING_GUIDE.md)
- [Карточки](./CARD_STYLING.md)
- [Кнопки](./BUTTON_STANDARDS.md)
