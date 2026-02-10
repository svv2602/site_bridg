# Фаза 10: Performance

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Оптимізувати SSR, кешування, завантаження зображень, видалити зайвий клієнтський код.

## Задачі

### 10.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти всі `"use client"` сторінки — де справді потрібен клієнтський код
- [x] Переглянути `revalidate` стратегії
- [x] Перевірити image optimization

---

### 10.1 Tyre search SSR/SEO fix
- [x] `new-page.tsx` — один великий `"use client"` компонент
- [x] Hero, h1, tips sidebar мають рендеритись на сервері
- [x] Рефакторити: серверний wrapper + клієнтський підкомпонент для інтерактивних частей

**Файли:** `frontend/src/app/tyre-search/new-page.tsx:1`
**Severity:** High | **Source:** TS-33, TS-46

---

### 10.2 Dealers page SSR/SEO fix
- [x] `page.tsx` — повністю `"use client"`, контент невидимий для ботів
- [x] Перенести initial data fetch на сервер
- [x] Клієнтський код тільки для інтерактивних фільтрів та карти
- [x] **Сторінка ПОРОЖНЯ для пошукових роботів**

**Файли:** `frontend/src/app/dealers/page.tsx:1`
**Severity:** Critical | **Source:** D-16, D-41

---

### 10.3 Contacts page `"use client"` optimization
- [x] Вся сторінка `"use client"`, хоча тільки форма потребує
- [x] Виділити форму в окремий клієнтський компонент
- [x] Решту сторінки рендерити на сервері

**Файли:** `frontend/src/app/contacts/page.tsx:1`
**Severity:** Low (performance) | **Source:** Contacts #17

---

### 10.4 Blog article images
- [x] Зображення статей відсутні — плейсхолдер замість реальних картинок
- [x] Після fix `featuredImage` mapping (Phase 4) — додати `next/image` з optimization
- [x] Rich text images — plain `<img>` без `next/image`
- [x] Розглянути custom image renderer для Lexical

**Файли:**
- `frontend/src/app/blog/page.tsx:184-188`
- `frontend/src/app/blog/[slug]/page.tsx`
- `frontend/src/components/LexicalRenderer.tsx`
**Severity:** High | **Source:** BA-5, BL-14

---

### 10.5 Homepage API optimization
- [x] `DealerLocatorSection` завантажує ВСІХ дилерів (200+), показує 4
- [x] Додати `limit: 4` або використати dedicated API
- [x] `getLatestArticles()` завантажує всі статті (до 500) — додати `limit: 3, sort: -createdAt`

**Файли:**
- `frontend/src/app/page.tsx:237-238`
- `frontend/src/lib/api/articles.ts:109-123`
**Severity:** Low-Medium | **Source:** Homepage #15, #4

---

### 10.6 Blog tags loading optimization
- [x] `getPayloadArticleTags()` завантажує ВСІ статті (500) для тегів
- [x] Створити dedicated endpoint або Payload query для тегів

**Файли:** `frontend/src/lib/api/payload.ts:391-400`
**Severity:** Medium | **Source:** BL-13, BD-3

---

### 10.7 Technology page tyre loading
- [x] Завантажує ВСІ шини (100, depth=2) для 3 карточок на технологію
- [x] Оптимізувати: менший depth, фільтрація на сервері

**Файли:** `frontend/src/app/technology/page.tsx:57-58`
**Severity:** Medium | **Source:** T-9

---

### 10.8 Review filtering optimization
- [x] Фільтрація по season/vehicleType на клієнті після завантаження 100 відгуків
- [x] Перенести фільтрацію на сервер (Payload where query)

**Файли:** `frontend/src/lib/api/reviews.ts:63-89`
**Severity:** Medium | **Source:** R-16, B-B6

---

### 10.9 Google Maps lazy loading
- [x] Карта завантажується навіть коли прихована (`hidden lg:block`)
- [x] Додати lazy loading або умовний рендеринг

**Файли:** `frontend/src/app/dealers/page.tsx:235-241`
**Severity:** Medium | **Source:** D-26

---

### 10.10 Dealers list virtualization
- [x] Всі карточки в DOM одразу (може бути 200+)
- [x] Розглянути пагінацію або віртуалізацію

**Файли:** `frontend/src/app/dealers/components/DealerList.tsx:77-200`
**Severity:** Medium | **Source:** D-3, D-27

---

### 10.11 Reviews pagination
- [x] Всі 50 відгуків одним блоком
- [x] Payload підтримує `page`/`totalPages`
- [x] Додати пагінацію або "Load more"

**Файли:** `frontend/src/app/reviews/page.tsx:204-231`
**Severity:** High | **Source:** R-8

---

### 10.12 SeasonalHero CLS fix
- [x] Client-side fetch → re-render → CLS
- [x] Після переходу на RSC (Phase 4) — перевірити CLS

**Файли:** `frontend/src/components/SeasonalHero.tsx`
**Severity:** Medium | **Source:** Homepage #6

---

### 10.13 Static page optimization
- [x] Додати `export const dynamic = 'force-static'` на статичні сторінки
- [x] Кандидати: karta-saitu, privacy, terms, about

**Файли:**
- `frontend/src/app/karta-saitu/page.tsx`
- `frontend/src/app/privacy/page.tsx`
- `frontend/src/app/terms/page.tsx`
**Severity:** Low | **Source:** SM-12

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-audit-fixes): phase-10 performance completed"
   ```
4. Онови PROGRESS.md
5. Відкрий наступну фазу
