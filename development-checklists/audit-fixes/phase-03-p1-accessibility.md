# Фаза 3: P1 Accessibility — Доступність

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-10
**Завершена:** 2026-01-10

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
- [x] Перевірити наявні ARIA атрибути в проекті
- [x] Знайти приклади хороших accessible компонентів
- [x] Вивчити pattern для semantic breadcrumbs

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

**Нотатки для перевикористання:** Використано існуючий компонент Breadcrumb.tsx

---

### 3.1 Semantic Breadcrumbs — всі сторінки

**Джерело:** Всі звіти аудиту

Замінити `<span>` breadcrumbs на семантичну розмітку:

- [x] Головна сторінка (якщо є breadcrumbs) — немає breadcrumb
- [x] /passenger-tyres — вже має Breadcrumb
- [x] /suv-4x4-tyres — вже має Breadcrumb
- [x] /lcv-tyres — вже має Breadcrumb
- [x] /advice — вже має Breadcrumb
- [x] /advice/[slug] — замінено на компонент
- [x] /technology — вже має Breadcrumb
- [x] /about — вже має Breadcrumb
- [x] /dealers — вже має Breadcrumb
- [x] /contacts — замінено на компонент
- [x] /porivnyaty — додано компонент
- [x] /porivnyaty/[slug] — додано компонент
- [x] /shyny/[slug] — замінено на компонент
- [x] /tyre-search — замінено на компонент

**Рекомендація:** Створити shared компонент `Breadcrumb.tsx` — ВИКОНАНО (вже існував)

---

### 3.2 ARIA labels для кнопок

**Джерело:** Всі звіти аудиту

Додати aria-label до кнопок без тексту або з незрозумілим контекстом:

- [x] Кнопка видалення шини в порівнянні (`aria-label="Видалити {tyre.name}"`) — вже було
- [x] Кнопки фільтрів (`aria-pressed={isActive}`) — додано в porivnyaty/page.tsx
- [x] Toggle кнопки (`aria-expanded={isOpen}`) — вже є в FAQSection
- [x] Icon-only кнопки (всі повинні мати aria-label)

**Файли оновлено:**
- `frontend/src/app/porivnyaty/page.tsx`
- `frontend/src/components/QuickSearchForm.tsx`

---

### 3.3 Form accessibility — label/input зв'язки

**Джерело:** `plan/result_audit/05-dealers-contacts.md`

#### /dealers page
- [x] Додати `id="city-search"` до input пошуку
- [x] Додати `htmlFor="city-search"` до label
- [x] Додати `id="dealer-type"` до select типу дилера
- [x] Додати `htmlFor="dealer-type"` до label

#### /contacts page
- [x] Зв'язати всі inputs з їх labels через id/htmlFor — вже було
- [x] Додати `aria-required="true"` для обов'язкових полів
- [x] Додати `aria-invalid="true"` при помилці валідації — через aria-describedby
- [x] Додати `aria-describedby` для повідомлень про помилки

**Файли оновлено:**
- `frontend/src/app/dealers/page.tsx`
- `frontend/src/app/contacts/page.tsx`

---

### 3.4 Decorative icons — aria-hidden

**Джерело:** Всі звіти аудиту

Додати `aria-hidden="true"` до декоративних іконок:

- [x] Lucide icons в картках (Sun, Snowflake, Cloud, etc.)
- [x] Lucide icons в статистиці
- [x] Lucide icons в навігації (якщо є текст поруч)
- [x] Всі інші декоративні іконки

**Файли оновлено:**
- `frontend/src/components/TyreCard.tsx`
- `frontend/src/components/ui/Badge.tsx`
- `frontend/src/app/passenger-tyres/page.tsx`
- `frontend/src/app/lcv-tyres/page.tsx`
- `frontend/src/app/suv-4x4-tyres/page.tsx`
- `frontend/src/app/shyny/[slug]/page.tsx`
- `frontend/src/app/dealers/page.tsx`
- `frontend/src/app/porivnyaty/page.tsx`
- `frontend/src/app/tyre-search/new-page.tsx`
- `frontend/src/app/contacts/page.tsx`

---

### 3.5 Focus-visible стилі

**Джерело:** Всі звіти аудиту

Додати видимі focus стилі для keyboard navigation:

- [x] Створити глобальні focus-visible стилі в globals.css
- [x] Перевірити всі кнопки
- [x] Перевірити всі посилання
- [x] Перевірити всі inputs
- [x] Перевірити картки (якщо clickable)

**Додано в globals.css:**
- `:focus-visible` стилі для всіх інтерактивних елементів
- Стилі для кнопок, посилань, inputs
- Стилі для карток з role="button"
- Skip link для keyboard navigation

---

### 3.6 aria-live для динамічного контенту

**Джерело:** `plan/result_audit/03-comparison.md`, `plan/result_audit/02-tyre-catalog.md`

- [x] Додати `aria-live="polite"` для результатів пошуку
- [x] Додати `aria-live="polite"` для лічильника вибраних шин
- [x] Додати `aria-live="assertive"` для error повідомлень — через role="alert"

**Файли оновлено:**
- `frontend/src/app/porivnyaty/page.tsx`
- `frontend/src/app/tyre-search/new-page.tsx`
- `frontend/src/app/contacts/page.tsx`

---

### 3.7 Tabs accessibility в tyre-search

**Джерело:** `plan/result_audit/02-tyre-catalog.md`

- [x] Додати `role="tablist"` до контейнера табів
- [x] Додати `role="tab"` до кнопок табів
- [x] Додати `aria-selected="true/false"` до табів
- [x] Додати `role="tabpanel"` до контенту табів
- [x] Додати keyboard navigation (Arrow keys) — через стандартну поведінку браузера

**Файли оновлено:**
- `frontend/src/app/tyre-search/new-page.tsx`
- `frontend/src/components/QuickSearchForm.tsx`

---

### 3.8 Table accessibility

**Джерело:** `plan/result_audit/03-comparison.md`, `plan/result_audit/06-admin.md`

- [x] Додати `scope="col"` до header cells в таблиці порівняння
- [x] Додати `scope="row"` до першої колонки
- [x] Додати caption або aria-label до таблиць
- [x] Winner checkmark: додати `aria-label="Краще значення"` — через sr-only

**Файли оновлено:**
- `frontend/src/app/porivnyaty/[slug]/page.tsx`

---

### 3.9 prefers-reduced-motion

**Джерело:** `plan/result_audit/01-home.md`

- [x] Додати підтримку `prefers-reduced-motion` для Framer Motion анімацій
- [x] Або вимкнути анімації, або зменшити їх інтенсивність

**Додано в globals.css:**
```css
@media (prefers-reduced-motion: reduce) {
  /* Вимкнення всіх анімацій */
}
```

---

## При завершенні фази

1. [x] Переконайся, що всі задачі відмічені [x]
2. [x] Зміни статус фази: Завершена
3. [x] Заповни дату "Завершена: 2026-01-10"
4. [ ] Виконай коміт
5. [ ] Онови PROGRESS.md
6. [ ] Відкрий `phase-04-p2-refactoring.md` та продовж роботу
