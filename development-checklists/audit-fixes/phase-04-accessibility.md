# Фаза 4: Accessibility (P2)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-11
**Завершена:** 2026-01-11

## Ціль фази
Покращити доступність сайту: ARIA атрибути, keyboard navigation, screen reader support.

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити a11y в QuickSearchForm (tabs, role, aria-selected)
- [x] Вивчити Breadcrumb компонент (aria-label, aria-current)
- [x] Перевірити існуючі aria атрибути в проекті

**Команди для пошуку:**
```bash
# Пошук ARIA атрибутів
grep -rn "aria-" frontend/src/components/
grep -rn "role=" frontend/src/components/
# Пошук keyboard handlers
grep -rn "onKeyDown" frontend/src/
```

#### B. Проблемні компоненти з аудиту
- Dealers page: expand/collapse без aria-expanded
- DealersMap: map без aria-label
- Admin ModelSelector: без keyboard navigation
- Анімації: без prefers-reduced-motion

**Нотатки для перевикористання:**
- QuickSearchForm tabs - хороший приклад ARIA для табів

---

### 4.1 Додати aria-expanded для карток дилерів

**Файл:** `frontend/src/app/dealers/page.tsx`

- [x] Знайти кнопку "Детальніше" для розгортання картки
- [x] Додати `aria-expanded={expandedDealer === dealer.id}`
- [x] Додати `aria-controls={`dealer-details-${dealer.id}`}`
- [x] Додати `id={`dealer-details-${dealer.id}`}` до розгорнутого контенту

**Код:**
```tsx
<button
  onClick={() => setExpandedDealer(expandedDealer === dealer.id ? null : dealer.id)}
  aria-expanded={expandedDealer === dealer.id}
  aria-controls={`dealer-details-${dealer.id}`}
  className="..."
>
  Детальніше
</button>

<div id={`dealer-details-${dealer.id}`} className="...">
  {/* expanded content */}
</div>
```

**Нотатки:** Вже було реалізовано раніше (рядки 316-317, 335)

---

### 4.2 Додати aria-label для Google Map

**Файл:** `frontend/src/components/DealersMap.tsx`

- [x] Знайти компонент GoogleMap
- [x] Додати aria-label з описом карти
- [x] Додати role="application" якщо потрібно

**Код:**
```tsx
<div
  role="application"
  aria-label="Інтерактивна карта дилерів Bridgestone в Україні"
>
  <GoogleMap ... />
</div>
```

**Нотатки:** Вже було реалізовано раніше (рядки 191-194)

---

### 4.3 Додати keyboard navigation для табів

**Файл:** `frontend/src/components/QuickSearchForm.tsx`

- [x] Перевірити чи є onKeyDown handler для табів
- [x] Якщо ні - додати обробку Arrow Left/Right
- [x] Додати обробку Enter для активації табу

**Код:**
```tsx
const handleTabKeyDown = (e: React.KeyboardEvent, tab: string) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    setActiveTab((prev) => (prev === "size" ? "car" : "size"));
  }
};
```

**Нотатки:** Вже було реалізовано раніше (рядки 206-211, 238, 255)

---

### 4.4 Додати prefers-reduced-motion

**Файли для оновлення:**
- `frontend/src/app/page.tsx`
- `frontend/src/app/about/page.tsx`
- `frontend/src/components/SeasonalHero.tsx`

- [x] Створити хук useReducedMotion або використати CSS
- [x] Замінити анімації на статичні версії для reduced motion

**Варіант 1 - CSS (простіший):**
```css
/* В globals.css */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Варіант 2 - Hook:**
```tsx
const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

<motion.div
  initial={prefersReducedMotion ? false : { opacity: 0 }}
  animate={{ opacity: 1 }}
>
```

- [x] Обрати та реалізувати варіант
- [x] Протестувати з enabled prefers-reduced-motion

**Нотатки:** Реалізовано CSS-варіант в globals.css (рядки 331-355)

---

### 4.5 Додати aria-hidden для декоративних іконок

**Файли для перевірки:**
- `frontend/src/app/technology/page.tsx`
- `frontend/src/app/about/page.tsx`
- `frontend/src/app/advice/page.tsx`

- [x] Знайти іконки без aria-hidden
- [x] Додати `aria-hidden="true"` до декоративних іконок
- [x] Для функціональних іконок - додати aria-label

**Нотатки:** Більшість іконок вже мають aria-hidden="true" (перевірено через grep)

---

### 4.6 Покращити label для поля пошуку

**Файл:** `frontend/src/app/porivnyaty/page.tsx`

- [x] Знайти input для пошуку шин
- [x] Додати `<label>` з htmlFor або aria-label
- [x] Переконатися що placeholder не замінює label

**Код:**
```tsx
<label htmlFor="search-tyres" className="sr-only">
  Пошук шин за назвою
</label>
<input
  id="search-tyres"
  type="text"
  placeholder="Пошук за назвою..."
/>
```

**Нотатки:** Додано label з sr-only класом та aria-hidden для іконки Search

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази на [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(a11y): phase-4 accessibility improvements"
   ```
5. Онови PROGRESS.md
6. Відкрий `phase-05-ux-loading.md`
