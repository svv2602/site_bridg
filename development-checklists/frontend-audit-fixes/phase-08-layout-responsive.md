# Фаза 8: Layout & Responsive

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Виправити layout проблеми: touch targets, responsive, grid padding, mobile adaptations.

## Задачі

### 8.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Перевірити де `hover:-translate-y-1` використовується (потрібен `pt-2`)
- [x] Перевірити touch target розміри на інтерактивних елементах

---

### 8.1 `pt-2` on grids with hover-translate
- [x] Blog cards grid: додати `pt-2`
- [x] Tyre-search results grid: додати `pt-2`
- [x] Root features grid: додати `pt-2`
- [x] Dealers grid вже має `pt-2` — корректно

**Файли:**
- `frontend/src/app/blog/loading.tsx:34`
- `frontend/src/app/tyre-search/components/SearchResults.tsx:95`
- `frontend/src/app/loading.tsx:50` (root skeleton)
- `frontend/src/app/page.tsx:265` (features grid)
**Severity:** Low-Medium | **Source:** TS-6, LD-15, LD-16, Homepage #12

---

### 8.2 Touch targets minimum 44px
- [x] Karta-saitu: додати `py-2` padding на ссылки
- [x] Not-found: suggested links — додати padding
- [x] Blog article tags: збільшити touch target
- [x] Blog card tags: збільшити з ~24x20px
- [x] Review filter pills: `px-3 py-1` → `px-4 py-2`

**Файли:**
- `frontend/src/app/karta-saitu/page.tsx:62-72`
- `frontend/src/app/not-found.tsx:52-78`
- `frontend/src/app/blog/[slug]/page.tsx:127-133`
- `frontend/src/app/blog/page.tsx:204-211`
- `frontend/src/app/reviews/page.tsx:135-200`
**Severity:** Medium | **Source:** SM-9, NF-10, BA-6, BA-15, BL-18, R-11

---

### 8.3 Not-found responsive fixes
- [x] `p-10` (40px) — на 320px контент тільки 208px. Замінити на `p-4 md:p-10`
- [x] Кнопки: додати `flex-col sm:flex-row`

**Файли:** `frontend/src/app/not-found.tsx:13,29`
**Severity:** High | **Source:** NF-4, NF-9

---

### 8.4 Technology page responsive
- [x] Hero декоративна колонка `h-80` — надто багато місця на мобільних
- [x] CTA `p-10` — може overflow на <375px

**Файли:**
- `frontend/src/app/technology/page.tsx:125-137`
- `frontend/src/app/technology/page.tsx:269-291`
**Severity:** Medium-Low | **Source:** T-13, T-17

---

### 8.5 Seasonal pages grid fix
- [x] `md:grid-cols-3` для 2 елементів в «Інші сезони» — неоптимально
- [x] Замінити на `md:grid-cols-2`

**Файли:** `frontend/src/app/passenger-tyres/[season]/page.tsx:341`
**Severity:** Low | **Source:** W-2, A-1

---

### 8.6 Blog layout fixes
- [x] Counter + heading flex: додати `flex-wrap`
- [x] Blog article: max-width mismatch (main `max-w-6xl` vs tags `max-w-4xl`)
- [x] Hero image in blog article: відсутнє, потрібна area в skeleton

**Файли:**
- `frontend/src/app/blog/page.tsx:149-156`
- `frontend/src/app/blog/[slug]/page.tsx:148,179`
**Severity:** Low-Medium | **Source:** BL-19, BA-18

---

### 8.7 About page timeline alignment
- [x] Year badge не центрований на вертикальній лінії на wide screens
- [x] Виправити `lg:mx-4` alignment

**Файли:** `frontend/src/app/about/page.tsx:187-205`
**Severity:** Low | **Source:** About #7

---

### 8.8 Sitemap grid balance
- [x] 5 секцій в `md:grid-cols-2` — асиметрична сітка
- [x] Розглянути `md:grid-cols-3` або додати 6-ту секцію

**Файли:** `frontend/src/app/karta-saitu/page.tsx:58`
**Severity:** Low | **Source:** SM-13

---

### 8.9 Category hero image sizing
- [x] `sizes="(max-width: 1024px) 100vw, 50vw"` — на мобільних може бути надто великий
- [x] Оптимізувати sizes prop

**Файли:** `frontend/src/components/CategoryPage.tsx:149-156`
**Severity:** Medium | **Source:** P-5

---

### 8.10 Review distribution card responsive
- [x] `col-span-2` не адаптований до `lg:col-span-2`

**Файли:** `frontend/src/app/reviews/page.tsx:105`
**Severity:** Low | **Source:** R-19

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-audit-fixes): phase-8 layout & responsive completed"
   ```
4. Онови PROGRESS.md
5. Відкрий наступну фазу
