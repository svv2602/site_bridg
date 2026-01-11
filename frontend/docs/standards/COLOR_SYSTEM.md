# Система Цветов — Stone Palette

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Основное Правило

> **ЗАПРЕЩЕНО использовать hardcoded цвета (HEX, RGB) и холодные палитры (zinc, gray, slate)**

**Всегда используйте:**
1. Tailwind CSS классы с stone palette (`text-stone-500`, `bg-stone-900`)
2. CSS переменные (`var(--foreground)`, `var(--primary)`)
3. Semantic классы (`text-foreground`, `bg-card`, `border-border`)

---

## Запрещённые Цвета

### Холодные палитры (ЗАПРЕЩЕНЫ)

```typescript
// ЗАПРЕЩЕНО — холодные серые тона
text-zinc-400, text-zinc-500, text-zinc-600
text-gray-400, text-gray-500, text-gray-600
text-slate-400, text-slate-500, text-slate-600
bg-zinc-800, bg-zinc-900
bg-gray-100, bg-gray-200

// ИСПОЛЬЗУЙТЕ — тёплые stone тона
text-stone-400, text-stone-500, text-stone-600
bg-stone-800, bg-stone-900
bg-stone-100, bg-stone-200
```

### Таблица замен

| Запрещено | Замена |
|-----------|--------|
| `text-zinc-400` | `text-stone-400` или `text-muted-foreground` |
| `text-zinc-500` | `text-stone-500` или `text-muted-foreground` |
| `text-zinc-100` | `text-stone-100` или `text-foreground` |
| `bg-zinc-800` | `bg-stone-800` |
| `bg-zinc-900` | `bg-stone-900` |
| `border-zinc-700` | `border-stone-700` или `border-border` |
| `bg-gray-50` | `bg-stone-50` или `bg-muted/50` |

---

## CSS Переменные

### Базовые Цвета (globals.css)

```css
:root {
  /* Основные */
  --background: oklch(98.5% 0.002 75);      /* Светлый тёплый фон */
  --foreground: oklch(14% 0.004 75);        /* Тёмный текст */

  /* Карточки */
  --card: oklch(100% 0 0);                  /* Белый */
  --card-foreground: oklch(14% 0.004 75);

  /* Muted (приглушённый) */
  --muted: oklch(96% 0.003 75);
  --muted-foreground: oklch(45% 0.01 75);

  /* Primary (Bridgestone красный) */
  --primary: oklch(55% 0.22 25);            /* #E31937 */
  --primary-foreground: oklch(100% 0 0);    /* Белый текст */

  /* Границы */
  --border: oklch(90% 0.005 75);
}

.dark {
  --background: oklch(14% 0.005 75);        /* stone-950 */
  --foreground: oklch(96% 0.003 75);
  --card: oklch(18% 0.006 75);              /* stone-900 */
  --muted: oklch(22% 0.006 75);
  --muted-foreground: oklch(65% 0.01 75);
  --border: oklch(28% 0.008 75);
}
```

### Сезонные Badge Цвета

```css
/* Летние шины — синий */
.badge-summer {
  background: oklch(55% 0.18 250);
  color: white;
}

/* Зимние шины — голубой */
.badge-winter {
  background: oklch(65% 0.15 220);
  color: oklch(20% 0.02 220);
}

/* Всесезонные — зелёный */
.badge-allseason {
  background: oklch(55% 0.15 145);
  color: white;
}
```

---

## Использование в Коде

### 1. Tailwind Классы (Рекомендуется)

```typescript
// ПРАВИЛЬНО — semantic классы
<div className="bg-background text-foreground">
  <h1 className="text-2xl font-bold">Заголовок</h1>
  <p className="text-muted-foreground">Описание</p>
</div>

// ПРАВИЛЬНО — stone palette
<header className="bg-stone-900 text-stone-100">
  <nav className="border-b border-stone-800">
    {/* ... */}
  </nav>
</header>

// НЕПРАВИЛЬНО — zinc/gray
<header className="bg-zinc-900 text-zinc-100">
```

### 2. Hero Секции (Тёмный Фон)

```typescript
// Используйте hero-* классы из globals.css
<section className="hero-dark">
  <h1 className="hero-title">Заголовок</h1>
  <p className="hero-text">Текст</p>
  <button className="hero-btn-primary">Кнопка</button>
</section>
```

### 3. Кнопки

```typescript
// Primary — красная (Bridgestone brand)
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Знайти дилера
</button>

// Secondary — stone
<button className="bg-stone-800 text-stone-100 hover:bg-stone-700">
  Детальніше
</button>

// Ghost
<button className="hover:bg-stone-100 dark:hover:bg-stone-800">
  Скасувати
</button>
```

### 4. Карточки

```typescript
// Светлая тема
<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
  <h3 className="font-semibold text-card-foreground">Заголовок</h3>
  <p className="text-muted-foreground">Описание</p>
</div>

// Тёмная тема автоматически применит тёмные цвета
```

---

## Запрет Одинакового Цвета Фона и Текста

> **КРИТИЧНО:** Никогда не используйте одинаковый цвет для `bg-X` и `text-X`

```typescript
// ЗАПРЕЩЕНО — текст невидим!
<div className="bg-primary text-primary">...</div>
<div className="bg-stone-500 text-stone-500">...</div>

// ПРАВИЛЬНО — контрастный текст
<div className="bg-primary text-primary-foreground">...</div>
<div className="bg-stone-500 text-white">...</div>

// ПРАВИЛЬНО — прозрачный фон + цветной текст
<div className="bg-primary/10 text-primary">...</div>
```

### Таблица Контрастных Пар

| Фон | Текст |
|-----|-------|
| `bg-primary` | `text-primary-foreground` (белый) |
| `bg-stone-900` | `text-stone-100` |
| `bg-stone-100` | `text-stone-900` |
| `bg-card` | `text-card-foreground` |
| `bg-muted` | `text-muted-foreground` |

---

## Тёмная Тема

### Автоматическое Переключение

```typescript
// CSS переменные автоматически меняются в .dark
<div className="bg-background text-foreground">
  {/* Светлая: bg = светлый, text = тёмный */}
  {/* Тёмная: bg = тёмный, text = светлый */}
</div>
```

### Явные Тёмные Стили

```typescript
// Когда нужны разные стили для тем
<div className="bg-white dark:bg-stone-900">
  <span className="text-stone-900 dark:text-stone-100">
    Текст
  </span>
</div>
```

### Hero Секции Всегда Тёмные

```typescript
// Hero секции имеют тёмный фон независимо от темы
<section className="bg-stone-900 text-stone-100">
  {/* Всегда тёмный */}
</section>
```

---

## Shadows (Тёплые Тени)

```css
/* Тёплые тени с коричневым оттенком */
.shadow-warm-sm {
  box-shadow: 0 1px 2px rgba(120, 90, 60, 0.08);
}

.shadow-warm {
  box-shadow: 0 4px 12px rgba(120, 90, 60, 0.1);
}

.shadow-warm-lg {
  box-shadow: 0 12px 32px rgba(120, 90, 60, 0.12);
}
```

```typescript
// Использование
<div className="shadow-warm hover:shadow-warm-lg transition-shadow">
  Карточка с тёплой тенью
</div>
```

---

## Контрастность WCAG AA

### Минимальные Требования

- **Обычный текст:** 4.5:1
- **Крупный текст (≥18px):** 3:1
- **UI компоненты:** 3:1

### Гарантированные Пары

```typescript
// Всегда достаточный контраст
bg-primary + text-primary-foreground     // 4.5:1+
bg-stone-900 + text-stone-100            // 4.5:1+
bg-card + text-card-foreground           // 4.5:1+
bg-muted + text-foreground               // 4.5:1+
```

---

## Примеры

### Статусная Карточка

```typescript
interface StatusColors {
  success: string;
  warning: string;
  error: string;
}

const statusColors: StatusColors = {
  success: 'bg-green-500/10 text-green-600 border-green-500/20',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  error: 'bg-red-500/10 text-red-600 border-red-500/20',
};

function StatusBadge({ status }: { status: keyof StatusColors }) {
  return (
    <span className={cn(
      'rounded-full px-3 py-1 text-sm font-medium border',
      statusColors[status]
    )}>
      {status}
    </span>
  );
}
```

### Навигация

```typescript
// MainHeader.tsx
<header className="bg-stone-900/95 backdrop-blur-sm border-b border-stone-800">
  <nav className="flex items-center gap-1">
    {links.map(link => (
      <Link
        key={link.href}
        href={link.href}
        className="px-3 py-2 text-sm font-medium text-stone-300
                   hover:bg-stone-800 hover:text-stone-100
                   rounded-lg transition-colors"
      >
        {link.label}
      </Link>
    ))}
  </nav>
</header>
```

---

## Чеклист Перед Коммитом

- [ ] Нет HEX цветов (`#3b82f6`)
- [ ] Нет zinc/gray/slate классов
- [ ] Используется stone palette или semantic классы
- [ ] Проверена контрастность (4.5:1 для текста)
- [ ] Проверена тёмная тема
- [ ] Hero секции используют hero-* классы

### Команды для Проверки

```bash
# Найти zinc/gray/slate
grep -r "zinc-\|gray-\|slate-" src/

# Найти HEX цвета
grep -rE "#[0-9a-fA-F]{3,6}" src/
```

---

## Связанные Документы

- [Структура Компонентов](./COMPONENT_STRUCTURE.md)
- [Тёмная Тема](./DARK_MODE.md)
- [Карточки](./CARD_STYLING.md)
