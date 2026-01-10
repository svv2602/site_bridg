# Фаза 3: P1 Accessibility — Доступність

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Виправити проблеми доступності для відповідності WCAG 2.1 AA:
- Додати ARIA атрибути
- Покращити keyboard navigation
- Забезпечити підтримку screen readers
- Додати focus-visible стилі

---

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Перевірити наявні ARIA атрибути в проекті
- [ ] Знайти приклади хороших accessible компонентів
- [ ] Вивчити pattern для semantic breadcrumbs

**Команди для пошуку:**
```bash
# Пошук aria атрибутів
grep -rn "aria-" frontend/src/
# Пошук sr-only класів
grep -rn "sr-only" frontend/src/
# Пошук role атрибутів
grep -rn "role=" frontend/src/
```

#### B. Стандарти WCAG 2.1 AA
- Всі інтерактивні елементи мають бути доступні з клавіатури
- Контраст тексту мінімум 4.5:1
- Всі зображення мають alt text
- Форми мають правильні label/input зв'язки

**Нотатки для перевикористання:** -

---

### 3.1 Semantic Breadcrumbs — всі сторінки

**Джерело:** Всі звіти аудиту

Замінити `<span>` breadcrumbs на семантичну розмітку:

- [ ] Головна сторінка (якщо є breadcrumbs)
- [ ] /passenger-tyres
- [ ] /suv-4x4-tyres
- [ ] /lcv-tyres
- [ ] /advice
- [ ] /advice/[slug]
- [ ] /technology
- [ ] /about
- [ ] /dealers
- [ ] /contacts
- [ ] /porivnyaty
- [ ] /porivnyaty/[slug]
- [ ] /shyny/[slug]

**Було:**
```tsx
<div className="text-xs text-zinc-400">
  <span>Головна</span>
  <span className="mx-2">/</span>
  <span>Шини для легкових авто</span>
</div>
```

**Має бути:**
```tsx
<nav aria-label="Breadcrumb" className="text-xs text-zinc-400">
  <ol className="flex items-center gap-2">
    <li>
      <Link href="/" className="hover:text-white">Головна</Link>
    </li>
    <li aria-hidden="true">/</li>
    <li aria-current="page">Шини для легкових авто</li>
  </ol>
</nav>
```

**Рекомендація:** Створити shared компонент `Breadcrumb.tsx`

---

### 3.2 ARIA labels для кнопок

**Джерело:** Всі звіти аудиту

Додати aria-label до кнопок без тексту або з незрозумілим контекстом:

- [ ] Кнопка видалення шини в порівнянні (`aria-label="Видалити {tyre.name}"`)
- [ ] Кнопки фільтрів (`aria-pressed={isActive}`)
- [ ] Toggle кнопки (`aria-expanded={isOpen}`)
- [ ] Icon-only кнопки (всі повинні мати aria-label)

**Файли для перевірки:**
- `frontend/src/app/porivnyaty/page.tsx`
- `frontend/src/app/dealers/page.tsx`
- `frontend/src/components/QuickSearchForm.tsx`

---

### 3.3 Form accessibility — label/input зв'язки

**Джерело:** `plan/result_audit/05-dealers-contacts.md`

#### /dealers page
- [ ] Додати `id="city-search"` до input пошуку
- [ ] Додати `htmlFor="city-search"` до label
- [ ] Додати `id="dealer-type"` до select типу дилера
- [ ] Додати `htmlFor="dealer-type"` до label

#### /contacts page
- [ ] Зв'язати всі inputs з їх labels через id/htmlFor
- [ ] Додати `aria-required="true"` для обов'язкових полів
- [ ] Додати `aria-invalid="true"` при помилці валідації
- [ ] Додати `aria-describedby` для повідомлень про помилки

**Файли:**
- `frontend/src/app/dealers/page.tsx`
- `frontend/src/app/contacts/page.tsx`

**Приклад:**
```tsx
<div>
  <label htmlFor="email" className="block text-sm font-medium">
    Email <span className="text-red-500">*</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-invalid={errors.email ? "true" : undefined}
    aria-describedby={errors.email ? "email-error" : undefined}
    className="..."
  />
  {errors.email && (
    <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">
      {errors.email}
    </p>
  )}
</div>
```

---

### 3.4 Decorative icons — aria-hidden

**Джерело:** Всі звіти аудиту

Додати `aria-hidden="true"` до декоративних іконок:

- [ ] Lucide icons в картках (Sun, Snowflake, Cloud, etc.)
- [ ] Lucide icons в статистиці
- [ ] Lucide icons в навігації (якщо є текст поруч)
- [ ] Всі інші декоративні іконки

**Приклад:**
```tsx
// Декоративна іконка (є текст поруч)
<Sun className="h-5 w-5" aria-hidden="true" />
<span>Літні шини</span>

// Інформативна іконка (немає тексту)
<button aria-label="Видалити">
  <X className="h-5 w-5" aria-hidden="true" />
</button>
```

---

### 3.5 Focus-visible стилі

**Джерело:** Всі звіти аудиту

Додати видимі focus стилі для keyboard navigation:

- [ ] Створити глобальні focus-visible стилі в globals.css
- [ ] Перевірити всі кнопки
- [ ] Перевірити всі посилання
- [ ] Перевірити всі inputs
- [ ] Перевірити картки (якщо clickable)

**Додати в globals.css:**
```css
/* Focus-visible для всіх інтерактивних елементів */
:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

/* Видалити default outline */
:focus:not(:focus-visible) {
  outline: none;
}

/* Для карток */
.card:focus-visible {
  ring: 2px;
  ring-offset: 2px;
  ring-color: hsl(var(--primary));
}
```

---

### 3.6 aria-live для динамічного контенту

**Джерело:** `plan/result_audit/03-comparison.md`, `plan/result_audit/02-tyre-catalog.md`

- [ ] Додати `aria-live="polite"` для результатів пошуку
- [ ] Додати `aria-live="polite"` для лічильника вибраних шин
- [ ] Додати `aria-live="assertive"` для error повідомлень

**Файли:**
- `frontend/src/app/porivnyaty/page.tsx`
- `frontend/src/app/tyre-search/new-page.tsx`

**Приклад:**
```tsx
// Лічильник вибраних шин
<div aria-live="polite" aria-atomic="true">
  Обрано {selectedTyres.length} з 3 шин
</div>

// Результати пошуку
<div aria-live="polite">
  Знайдено {results.length} моделей
</div>
```

---

### 3.7 Tabs accessibility в tyre-search

**Джерело:** `plan/result_audit/02-tyre-catalog.md`

- [ ] Додати `role="tablist"` до контейнера табів
- [ ] Додати `role="tab"` до кнопок табів
- [ ] Додати `aria-selected="true/false"` до табів
- [ ] Додати `role="tabpanel"` до контенту табів
- [ ] Додати keyboard navigation (Arrow keys)

**Файл:** `frontend/src/app/tyre-search/new-page.tsx`

**Приклад:**
```tsx
<div role="tablist" aria-label="Спосіб пошуку">
  <button
    role="tab"
    aria-selected={activeTab === 'size'}
    aria-controls="size-panel"
    id="size-tab"
    onClick={() => setActiveTab('size')}
  >
    За розміром
  </button>
  <button
    role="tab"
    aria-selected={activeTab === 'car'}
    aria-controls="car-panel"
    id="car-tab"
    onClick={() => setActiveTab('car')}
  >
    За авто
  </button>
</div>

<div
  role="tabpanel"
  id="size-panel"
  aria-labelledby="size-tab"
  hidden={activeTab !== 'size'}
>
  {/* Size search content */}
</div>
```

---

### 3.8 Table accessibility

**Джерело:** `plan/result_audit/03-comparison.md`, `plan/result_audit/06-admin.md`

- [ ] Додати `scope="col"` до header cells в таблиці порівняння
- [ ] Додати `scope="row"` до першої колонки
- [ ] Додати caption або aria-label до таблиць
- [ ] Winner checkmark: додати `aria-label="Краще значення"`

**Файли:**
- `frontend/src/app/porivnyaty/[slug]/page.tsx`
- `frontend/src/app/admin/automation/page.tsx`

---

### 3.9 prefers-reduced-motion

**Джерело:** `plan/result_audit/01-home.md`

- [ ] Додати підтримку `prefers-reduced-motion` для Framer Motion анімацій
- [ ] Або вимкнути анімації, або зменшити їх інтенсивність

**Приклад:**
```tsx
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
    >
      Content
    </motion.div>
  );
}
```

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(a11y): phase-3 P1 accessibility improvements"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 4
   - Додай запис в історію
6. Відкрий `phase-04-p2-refactoring.md` та продовж роботу
