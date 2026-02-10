# Фаза 12: Navigation & UX

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Виправити навігаційні проблеми: URL state, мобільна карта, shareable links, UX покращення.

## Задачі

### 12.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути як QuickSearchForm передає дані через sessionStorage
- [x] Переглянути useSearchState hook
- [x] Перевірити Next.js URL search params patterns

---

### 12.1 QuickSearchForm → URL params (замість sessionStorage)
- [x] Замінити `sessionStorage` на URL search params
- [x] Пошук можна шарити по посиланню
- [x] Browser back/forward працюють
- [x] Розглянути `useSearchParams()` або `router.push()`

**Файли:**
- `frontend/src/components/QuickSearchForm.tsx:219-249`
- `frontend/src/app/tyre-search/components/useSearchState.ts:172-193`
**Severity:** High | **Source:** TS-20, TS-22, Homepage #9

---

### 12.2 Dealers filters → URL params
- [x] Зберігати фільтри в URL search params
- [x] При оновленні/шарінгу фільтри зберігаються
- [x] Car search mode: зберігати стан селекторів в URL

**Файли:**
- `frontend/src/app/dealers/page.tsx:59-60`
- `frontend/src/app/tyre-search/components/useSearchState.ts:303-304`
**Severity:** Medium | **Source:** D-48, TS-49

---

### 12.3 Mobile map toggle for dealers
- [x] Карта прихована на мобільних (`hidden lg:block`)
- [x] Додати переключатель "Список / Карта" для мобільних
- [x] АБО показати карту зверху в згорнутому вигляді

**Файли:** `frontend/src/app/dealers/page.tsx:229`
**Severity:** High | **Source:** D-46

---

### 12.4 Dealers map-card interaction
- [x] Клік на маркер карти не скроллить до карточки в списку
- [x] Додати scroll-to-card при кліку на маркер

**Файли:** `frontend/src/app/dealers/page.tsx:238-239`
**Severity:** Medium | **Source:** D-47

---

### 12.5 Add "Reset filters" button
- [x] Tyre search: немає кнопки "Скинути фільтри"
- [x] Додати кнопку в SearchFilters

**Файли:** `frontend/src/app/tyre-search/components/SearchFilters.tsx`
**Severity:** Medium | **Source:** TS-50

---

### 12.6 Remove developer notes from production
- [x] "У продакшн-версії", "з демонстраційної бази" — видимі користувачам
- [x] Обгорнути в `process.env.NODE_ENV === 'development'` або видалити

**Файли:** `frontend/src/app/tyre-search/new-page.tsx:78-79,91`
**Severity:** Medium | **Source:** TS-51

---

### 12.7 Fix navigation links
- [x] Homepage: "Знайти дилера поруч" — `<span>` замість `<Link>`, не клікабельна
- [x] ProductCarousel: "Переглянути всі шини" — `<a>` замість `<Link>`
- [x] Contacts FAQ: "Часті запитання" веде на `/blog` замість FAQ

**Файли:**
- `frontend/src/app/layout.tsx:151-154`
- `frontend/src/components/ProductCarousel.tsx:120`
- `frontend/src/app/contacts/page.tsx:403`
**Severity:** Low | **Source:** Homepage #20, #13, Contacts #18

---

### 12.8 Add breadcrumbs to legal pages
- [x] `/privacy` — додати Breadcrumb компонент
- [x] `/terms` — додати Breadcrumb компонент
- [x] Компонент вже існує та переиспользовується

**Файли:**
- `frontend/src/app/privacy/page.tsx`
- `frontend/src/app/terms/page.tsx`
**Severity:** Low | **Source:** Privacy #9, Terms #9

---

### 12.9 Use semantic elements on legal pages
- [x] Privacy: `<div>` → `<article>` для контенту
- [x] Terms: аналогічно

**Файли:**
- `frontend/src/app/privacy/page.tsx`
- `frontend/src/app/terms/page.tsx`
**Severity:** Low | **Source:** Privacy #6, Terms #6

---

### 12.10 Blog article date display
- [x] Дата публікації не відображається користувачу (є в OG/JSON-LD)
- [x] Додати візуальне відображення дати
- [x] Те ж для blog listing карточок

**Файли:**
- `frontend/src/app/blog/[slug]/page.tsx:115-137`
- `frontend/src/app/blog/page.tsx:189-193`
**Severity:** Medium | **Source:** BA-14, BL-15

---

### 12.11 Blog error page h1 fix
- [x] `blog/error.tsx` використовує `<h1>` в layout де вже є `<h1>`
- [x] Замінити на `<h2>`

**Файли:** `frontend/src/app/blog/error.tsx:18`
**Severity:** Medium | **Source:** ER-9

---

### 12.12 Geolocation context check
- [x] Додати `isSecureContext` перевірку перед geolocation
- [x] Пояснити ефект кнопки геолокації

**Файли:**
- `frontend/src/app/dealers/page.tsx:90-91`
- `frontend/src/app/dealers/components/DealerFilters.tsx:128`
**Severity:** Low | **Source:** D-33, D-49

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-audit-fixes): phase-12 navigation & UX completed"
   ```
4. Онови PROGRESS.md
5. Відкрий наступну фазу
