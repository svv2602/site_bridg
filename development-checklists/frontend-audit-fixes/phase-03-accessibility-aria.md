# Фаза 3: Accessibility (A11y)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Довести всі сторінки до WCAG 2.1 AA відповідності: ARIA атрибути, landmarks, focus management, screen reader підтримка.

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Перевірити існуючі ARIA патерни (SizesByDiameter має правильні tabs)
- [x] Перевірити AnimatedMain — чи обгортає в `<main>`
- [x] Переглянути Breadcrumb компонент

---

### 3.1 `role="alert"` on all error boundaries (9 files)
- [x] Додати `role="alert"` та `aria-live="assertive"` на кореневий `<div>` в `error.tsx` (root)
- [x] Додати в `global-error.tsx`
- [x] Додати в `passenger-tyres/error.tsx`
- [x] Додати в `suv-4x4-tyres/error.tsx`
- [x] Додати в `lcv-tyres/error.tsx`
- [x] Додати в `technology/error.tsx`
- [x] Додати в `blog/error.tsx`
- [x] Додати в `shyny/[slug]/error.tsx`
- [x] Додати в `blog/[slug]/error.tsx`

---

### 3.2 `role="status"` + `aria-busy` on all loading states (10 files)
- [x] Додати `role="status"` `aria-busy="true"` `aria-label="Завантаження"` на кореневий `<div>`
- [x] Додати `<span className="sr-only">Завантаження сторінки...</span>`
- [x] Застосувати до всіх 10 loading.tsx файлів

---

### 3.3 VehicleTyreSelector custom dropdown ARIA
- [x] Додати `role="listbox"` на dropdown контейнер
- [x] Додати `role="option"` на кожен елемент
- [x] Додати `aria-expanded` на trigger кнопку
- [x] Додати `aria-activedescendant` для keyboard навігації
- [x] Додати keyboard navigation (Arrow keys)

---

### 3.4 SearchFilters labels + select association
- [x] Додати `id` на кожний `<select>`
- [x] Зв'язати `<label htmlFor>` з відповідним select
- [x] Застосувати в SearchFilters та SelectField

---

### 3.5 StarRating ARIA
- [x] Додати `aria-label` з текстом рейтингу
- [x] Додати `role="img"` на контейнер зірочок
- [x] Зірочки: `aria-hidden="true"` (декоративні)

---

### 3.6 Review filter buttons `aria-pressed`
- [x] Додати `aria-pressed={isActive}` на кнопки фільтрів сезону та vehicleType
- [x] Додати `aria-label` з поясненням фільтру

---

### 3.7 Focus rings on Dealers interactive elements
- [x] Додати `focus-visible:ring-2 focus-visible:ring-primary` на input пошуку
- [x] Додати на select фільтрів
- [x] Додати на кнопки дилерів
- [x] Перевірити keyboard навігацію

---

### 3.8 Sections `aria-label` / `aria-labelledby`
- [x] Додати `aria-label` на `<section>` елементи в сезонних сторінках
- [x] Застосувати в `[season]/page.tsx`
- [x] Застосувати в about page sections
- [x] Застосувати в contacts page sections

---

### 3.9 Blog search form ARIA
- [x] Додати `role="search"` на form wrapper
- [x] Додати `<label>` (sr-only) для search input
- [x] Додати `aria-label` на filter chip видалення
- [x] Додати `aria-hidden="true"` на `<X>` іконки

---

### 3.10 Dealers search form ARIA
- [x] Додати `role="search"` на search wrapper
- [x] Додати `aria-live="polite"` на results container
- [x] Додати `aria-label` на геолокація кнопку

---

### 3.11 `<nav aria-label>` landmarks
- [x] Додати `<nav aria-label="Карта сайту">` на karta-saitu links
- [x] Додати `<section aria-label>` на grid карточок

---

### 3.12 Not-found pages ARIA
- [x] Додати `role="alert"` на 404 контейнери
- [x] Додати `aria-hidden="true"` на `&bull;` роздільники
- [x] Застосувати до всіх 3 not-found файлів

---

### 3.13 EuLabelBadge ARIA
- [x] Додати `aria-hidden="true"` на іконки
- [x] Додати `aria-label` з поясненням рейтингу

---

### 3.14 Tyre detail section ARIA
- [x] Додати `aria-label` на EU-маркування карточки
- [x] FAQSection: додати `aria-controls` та `id` на контент-панелі
- [x] Додати `aria-hidden="true"` на декоративні елементи

---

### 3.15 Blog article cards accessibility
- [x] Зробити заголовок `<h3>` посиланням (основний click target)
- [x] Зменшити tab-stops на карточці (одне посилання замість 4)
- [x] BookOpen SVG: `aria-hidden="true"`

---

### 3.16 Image `sizes` prop on fill images
- [x] Додати `sizes` prop на `<Image fill>` в comparison selection
- [x] Додати `sizes` prop на comparison page images
- [x] Перевірити всі `<Image fill>` по codebase

---

### 3.17 TableOfContents toggle ARIA
- [x] Додати `aria-controls` на toggle кнопку
- [x] Додати `aria-hidden="true"` на каретку

---

### 3.18 Distribution bars progressbar role
- [x] Додати `role="progressbar"` на рейтинг бари
- [x] Додати `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`

---

### 3.19 Contacts form accessibility
- [x] Додати `focus:ring-*` на всі інпути форми
- [x] Додати `novalidate` на `<form>` (для Zod валідації)
- [x] Focus management при зміні стану (success/error)

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-audit-fixes): phase-3 accessibility completed"
   ```
4. Онови PROGRESS.md
5. Відкрий наступну фазу
