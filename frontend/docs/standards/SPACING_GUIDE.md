# Отступы и Spacing

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Основные Принципы

1. **Используйте Tailwind spacing** — не пишите кастомные значения
2. **Консистентность** — одинаковые отступы для одинаковых элементов
3. **Responsive** — увеличивайте spacing на больших экранах
4. **8px система** — базовая единица 0.5rem (8px)

---

## Tailwind Spacing Scale

| Класс | Значение | Использование |
|-------|----------|---------------|
| `p-1` | 4px | Минимальные отступы в badge |
| `p-2` | 8px | Padding в кнопках, мелких элементах |
| `p-3` | 12px | Padding в input, select |
| `p-4` | 16px | Стандартный padding карточек |
| `p-6` | 24px | Padding секций |
| `p-8` | 32px | Большие секции |
| `py-12` | 48px | Вертикальный padding страничных секций |
| `py-16` | 64px | Hero секции |

---

## Секции Страницы

```typescript
// Hero секция
<section className="py-8 md:py-12">
  <div className="container mx-auto max-w-7xl px-4 md:px-8">
    {/* Контент */}
  </div>
</section>

// Стандартная секция
<section className="py-12">
  <div className="container mx-auto max-w-7xl px-4 md:px-8">
    {/* Контент */}
  </div>
</section>

// CTA секция
<section className="py-16">
  <div className="container mx-auto max-w-4xl px-4 text-center">
    {/* Контент */}
  </div>
</section>
```

---

## Карточки

```typescript
// Стандартная карточка
<div className="rounded-2xl border border-border bg-card p-6">
  {/* p-6 = 24px padding */}
</div>

// Компактная карточка
<div className="rounded-xl border border-border bg-card p-4">
  {/* p-4 = 16px padding */}
</div>

// Карточка с разделённым header
<div className="rounded-2xl border border-border bg-card overflow-hidden">
  <div className="p-6 border-b border-border">
    <h3>Заголовок</h3>
  </div>
  <div className="p-6">
    <p>Контент</p>
  </div>
</div>
```

---

## Gap между Элементами

```typescript
// Грид карточек
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} />)}
</div>

// Flex с кнопками
<div className="flex flex-wrap gap-2">
  <Button>Кнопка 1</Button>
  <Button>Кнопка 2</Button>
</div>

// Вертикальный список
<div className="space-y-4">
  <Item />
  <Item />
  <Item />
</div>

// Навигация
<nav className="flex items-center gap-1">
  {links.map(link => <Link />)}
</nav>
```

---

## Типичные Паттерны

### Заголовок Секции

```typescript
<div className="mb-10 text-center">
  <h2 className="mb-4 text-3xl font-bold">Заголовок</h2>
  <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
    Описание секции
  </p>
</div>
```

### Карточка с Действиями

```typescript
<div className="p-4">
  <h4 className="font-bold">Название</h4>
  <p className="mt-2 text-sm text-muted-foreground">Описание</p>
  <div className="mt-4 flex flex-wrap gap-2">
    <Button>Действие 1</Button>
    <Button>Действие 2</Button>
  </div>
</div>
```

### Форма

```typescript
<form className="space-y-4">
  <div>
    <label className="mb-1 block text-sm font-medium">Поле 1</label>
    <input className="w-full rounded-xl px-3 py-2" />
  </div>
  <div>
    <label className="mb-1 block text-sm font-medium">Поле 2</label>
    <select className="w-full rounded-xl px-3 py-2" />
  </div>
  <button type="submit" className="mt-2 w-full">
    Отправить
  </button>
</form>
```

---

## Responsive Spacing

```typescript
// Увеличение на больших экранах
<section className="py-8 md:py-12 lg:py-16">
  <div className="px-4 md:px-8">
    {/* Контент */}
  </div>
</section>

// Gap в грид
<div className="grid gap-4 md:gap-6 lg:gap-8">
  {/* Карточки */}
</div>

// Отступы между элементами
<div className="space-y-4 md:space-y-6">
  {/* Элементы */}
</div>
```

---

## Чеклист

- [ ] Используются стандартные Tailwind классы
- [ ] Нет кастомных px значений в style
- [ ] Responsive увеличение spacing на md/lg
- [ ] Консистентные отступы для одинаковых элементов
- [ ] Container имеет `max-w-7xl` и горизонтальный padding

---

## Связанные Документы

- [Типографика](./TYPOGRAPHY.md)
- [Карточки](./CARD_STYLING.md)
- [Responsive Layout](./RESPONSIVE_LAYOUT.md)
