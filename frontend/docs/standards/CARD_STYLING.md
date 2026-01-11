# Стилизация Карточек

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Базовая Карточка

```typescript
<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
  <h3 className="font-semibold text-card-foreground">Заголовок</h3>
  <p className="mt-2 text-sm text-muted-foreground">Описание</p>
</div>
```

### Стандартные Классы

| Класс | Описание |
|-------|----------|
| `rounded-2xl` | Скруглённые углы (16px) |
| `border border-border` | Граница |
| `bg-card` | Фон карточки (адаптируется к теме) |
| `p-6` | Padding 24px |
| `shadow-sm` | Лёгкая тень |

---

## TyreCard — Карточка Шины

```typescript
<article className="group relative rounded-2xl border border-border bg-card
                    overflow-hidden transition-all duration-300
                    hover:shadow-lg hover:border-primary/30">
  {/* Изображение */}
  <div className="relative aspect-square bg-muted">
    <Image
      src={tyre.imageUrl}
      alt={tyre.name}
      fill
      className="object-contain p-4 transition-transform duration-500
                 group-hover:scale-105"
    />

    {/* Season Badge */}
    <div className={cn(
      'absolute top-3 left-3 rounded-full px-3 py-1',
      'text-xs font-semibold',
      seasonBadgeClass
    )}>
      {seasonLabel}
    </div>
  </div>

  {/* Content */}
  <div className="p-4">
    <h3 className="font-semibold text-foreground line-clamp-2
                   transition-colors group-hover:text-primary">
      {tyre.name}
    </h3>
    <p className="mt-1 text-sm text-muted-foreground">
      {tyre.sizes.length} розмірів
    </p>
  </div>

  {/* Hover Overlay */}
  <div className="absolute inset-0 flex items-center justify-center
                  bg-black/60 opacity-0 transition-opacity
                  group-hover:opacity-100">
    <span className="rounded-full bg-primary px-6 py-2
                     text-sm font-semibold text-white">
      Детальніше
    </span>
  </div>
</article>
```

### Ключевые Моменты

1. **group** — для hover эффектов дочерних элементов
2. **overflow-hidden** — обрезает hover overlay
3. **transition-all duration-300** — плавные переходы
4. **aspect-square** — квадратное изображение
5. **line-clamp-2** — обрезка длинных названий

---

## Статистическая Карточка

```typescript
<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
  <div className="flex items-start justify-between">
    <div>
      <p className="text-xs font-medium uppercase tracking-wide
                    text-muted-foreground">
        Всього моделей
      </p>
      <p className="mt-2 text-3xl font-bold text-foreground">
        {count}
      </p>
    </div>
    <div className="rounded-full bg-primary/10 p-3">
      <Icon className="h-5 w-5 text-primary" />
    </div>
  </div>
</div>
```

---

## Карточка с Действиями (Результаты Поиска)

```typescript
<article className="rounded-2xl border border-border bg-card
                    overflow-hidden shadow-sm">
  {/* Image */}
  <div className="relative aspect-[4/3] bg-muted">
    <Image src={imageUrl} alt={name} fill className="object-contain p-4" />
  </div>

  {/* Content */}
  <div className="flex flex-col p-4">
    <h4 className="font-bold text-foreground line-clamp-2">
      {name}
    </h4>

    {/* Sizes */}
    <div className="mt-2 flex flex-wrap gap-1 min-h-[1.5rem]">
      {sizes.slice(0, 3).map(size => (
        <span key={size}
              className="rounded bg-muted px-2 py-0.5
                         text-xs text-muted-foreground">
          {size}
        </span>
      ))}
      {sizes.length > 3 && (
        <span className="rounded bg-primary/10 px-2 py-0.5
                         text-xs font-medium text-primary">
          +{sizes.length - 3}
        </span>
      )}
    </div>

    {/* Buttons — ВАЖНО: flex-wrap для мобильных */}
    <div className="mt-auto pt-4 flex flex-wrap gap-2">
      <Link href={`/shyny/${slug}`}
            className="flex-1 min-w-[80px] rounded-full border border-border
                       px-3 py-1.5 text-center text-xs sm:text-sm
                       font-semibold text-foreground hover:bg-muted">
        Детальніше
      </Link>
      <Link href="/dealers"
            className="flex-1 min-w-[80px] flex items-center justify-center
                       gap-1 rounded-full bg-primary px-3 py-1.5
                       text-xs sm:text-sm font-semibold text-white
                       hover:bg-primary/90">
        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
        Купити
      </Link>
    </div>
  </div>
</article>
```

### Предотвращение Overflow Кнопок

```typescript
// ОБЯЗАТЕЛЬНО для кнопок в карточках:
<div className="flex flex-wrap gap-2">     // flex-wrap!
  <button className="flex-1 min-w-[80px]   // min-w для минимальной ширины
                     text-xs sm:text-sm">  // меньше шрифт на мобильных
    Текст
  </button>
</div>
```

---

## Feature Карточка (Главная)

```typescript
<div className="rounded-2xl border border-border bg-card p-6
                transition-all duration-300 hover:shadow-lg">
  <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-4">
    <Icon className="h-8 w-8 text-primary" />
  </div>
  <h3 className="text-lg font-bold">{title}</h3>
  <p className="mt-2 text-muted-foreground">{description}</p>
</div>
```

---

## Карточка Статьи

```typescript
<article className="group rounded-2xl border border-border bg-card
                    overflow-hidden transition-shadow hover:shadow-lg">
  {/* Cover Image */}
  <div className="relative aspect-video overflow-hidden">
    <Image
      src={article.coverImage}
      alt={article.title}
      fill
      className="object-cover transition-transform duration-500
                 group-hover:scale-105"
    />
  </div>

  {/* Content */}
  <div className="p-6">
    <div className="mb-3 flex items-center gap-2">
      {article.tags.map(tag => (
        <Badge key={tag} variant="outline">
          {tag}
        </Badge>
      ))}
    </div>

    <h3 className="text-xl font-bold line-clamp-2
                   group-hover:text-primary transition-colors">
      {article.title}
    </h3>

    <p className="mt-2 text-muted-foreground line-clamp-3">
      {article.excerpt}
    </p>

    <Link href={`/advice/${article.slug}`}
          className="mt-4 inline-flex items-center gap-1
                     text-sm font-medium text-primary">
      Читати далі
      <ChevronRight className="h-4 w-4" />
    </Link>
  </div>
</article>
```

---

## Season Badge Классы

```css
/* globals.css */
.badge-summer {
  @apply bg-sky-500 text-white;
}

.badge-winter {
  @apply bg-blue-400 text-blue-950;
}

.badge-allseason {
  @apply bg-emerald-500 text-white;
}
```

```typescript
const SEASON_BADGES = {
  summer: 'badge-summer',
  winter: 'badge-winter',
  'all-season': 'badge-allseason',
} as const;
```

---

## Dark Mode

Карточки автоматически адаптируются:

```typescript
// bg-card меняется в зависимости от темы
// Светлая: белый фон
// Тёмная: stone-900 фон

// border-border тоже адаптируется
// Светлая: светло-серая граница
// Тёмная: тёмно-серая граница
```

---

## Чеклист Карточки

- [ ] `rounded-2xl` для скруглений
- [ ] `border border-border` для границы
- [ ] `bg-card` для фона
- [ ] `overflow-hidden` если есть overlay/изображение
- [ ] `group` для hover эффектов
- [ ] `transition-*` для плавности
- [ ] `line-clamp-*` для обрезки текста
- [ ] `flex-wrap` для кнопок
- [ ] Работает в тёмной теме

---

## Связанные Документы

- [Система Цветов](./COLOR_SYSTEM.md)
- [Кнопки](./BUTTON_STANDARDS.md)
- [Spacing](./SPACING_GUIDE.md)
