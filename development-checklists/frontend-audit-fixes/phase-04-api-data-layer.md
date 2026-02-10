# Фаза 4: API & Data Layer

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Виправити маппінг даних, CORS проблеми, перейти на серверну фільтрацію, виправити обробку помилок API.

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути `getPayloadTyres` параметри фільтрації
- [x] Переглянути `getTyreModelBySlug` — чи працює
- [x] Переглянути `transformPayloadArticle` — які поля маппляться
- [x] Переглянути SeasonalHero — клієнтський чи серверний

---

### 4.1 `featuredImage` mapping in transformPayloadArticle
- [x] В `transformPayloadArticle` додати маппінг `article.image` → `featuredImage` та `imageUrl`
- [x] Перевірити тип `article.image` (може бути string ID при depth=1)
- [x] Додати runtime перевірку типу image
- [x] Перевірити що OG images працюють на `/blog/[slug]`

**Файли:** `frontend/src/lib/api/payload.ts:555-566`
**Severity:** Critical | **Source:** BA-2, BACKEND #3, BD-1, BD-4

---

### 4.2 SeasonalHero CORS fix — convert to RSC
- [x] Перенести fetch `getSeasonalContent()` в серверний компонент
- [x] АБО створити Route Handler `/api/seasonal-content` як проксі
- [x] Видалити `'use client'` з SeasonalHero якщо можливо
- [x] Перевірити що працює в production (не localhost)

**Файли:** `frontend/src/components/SeasonalHero.tsx:46-58`
**Severity:** High | **Source:** A-2, BACKEND #4

---

### 4.3 Server-side tyre filtering on category pages
- [x] Замінити `getTyreModels()` + client filter на `getPayloadTyres({ vehicleType })` в `passenger-tyres/page.tsx`
- [x] Замінити в `suv-4x4-tyres/page.tsx`
- [x] Замінити в `lcv-tyres/page.tsx`
- [x] Замінити на сезонних сторінках `[season]/page.tsx` — фільтрувати по season + vehicleType
- [x] Перевірити що результати ідентичні

**Файли:**
- `frontend/src/app/passenger-tyres/page.tsx`
- `frontend/src/app/suv-4x4-tyres/page.tsx`
- `frontend/src/app/lcv-tyres/page.tsx`
- `frontend/src/app/passenger-tyres/[season]/page.tsx`
**Severity:** High | **Source:** P-3, S-5, BACKEND #5

---

### 4.4 Tyre Detail — use `getTyreModelBySlug(slug)`
- [x] Замінити `getTyreModels().find(slug)` на `getTyreModelBySlug(slug)` в page component
- [x] Замінити в `generateMetadata`
- [x] Перевірити що сторінка `/shyny/[slug]` працює коректно

**Файли:** `frontend/src/app/shyny/[slug]/page.tsx`
**Severity:** High | **Source:** T-8, T-9, BACKEND #6

---

### 4.5 `all-season` vs `allseason` mismatch
- [x] Знайти де QuickSearchForm передає `all-season`
- [x] Знайти де API очікує `allseason`
- [x] Уніфікувати: або маппінг в QuickSearchForm, або в API route
- [x] Перевірити що всесезонний фільтр з головної працює

**Файли:**
- `frontend/src/components/QuickSearchForm.tsx:421/569`
**Severity:** High | **Source:** TS-21

---

### 4.6 Homepage deduplicate tyre fetching
- [x] `PopularCarouselSection` та `FeaturedTyresSection` обидва викликають `getTyreModels()`
- [x] Об'єднати в один fetch та передати результат обом компонентам
- [x] АБО використати `getPayloadTyres({ where: { isPopular: true }, limit: 10 })` для карусель

**Файли:** `frontend/src/app/page.tsx`
**Severity:** High | **Source:** Homepage #1

---

### 4.7 API error handling — stop swallowing errors
- [x] В `getTyreModels()` / `getPayloadTyres()`: throw замість return []
- [x] В `getPayloadArticles()`: throw замість return []
- [x] В `getReviews()`: throw замість return []
- [x] В `getDealers()`: throw замість return []
- [x] Це дозволить error.tsx спрацьовувати замість пустого UI
- [x] Додати try/catch на рівні page components де потрібен fallback

**Файли:**
- `frontend/src/lib/api/tyres.ts`
- `frontend/src/lib/api/articles.ts`
- `frontend/src/lib/api/dealers.ts`
**Severity:** Medium | **Source:** BL-16, T-2, R-22, D-17

---

### 4.8 Review stats aggregation — fix limit
- [x] `getReviewStats()` обмежена limit 100 — неточний average при >100 відгуків
- [x] Варіант A: збільшити limit (просто, але не масштабується)
- [x] Варіант B: створити серверний endpoint `/api/reviews/stats`
- [x] Перевірити stats на reviews page та tyre detail

**Файли:**
- `frontend/src/lib/api/reviews.ts`
**Severity:** High | **Source:** R-3, T-18, BACKEND #7

---

### 4.9 `loadIndex` type conversion
- [x] В `transformPayloadTyre`: конвертувати `loadIndex` з string в number
- [x] Або оновити тип `TyreSize.loadIndex` в `lib/data.ts` на string

**Файли:** `frontend/src/lib/data.ts:14`, `frontend/src/lib/utils/tyres.ts:115`
**Severity:** Low | **Source:** B-B9, A-14

---

### 4.10 Comparison page API issues
- [x] `porivnyaty/page.tsx`: переробити з `"use client"` на серверний компонент + клієнтський підкомпонент
- [x] `parseComparisonSlug()`: додати захист від slug з `-vs-` в назві
- [x] `[slug]/page.tsx`: зменшити 3x виклик `getTyreModels()` до 1

**Файли:**
- `frontend/src/app/porivnyaty/[slug]/page.tsx`
**Severity:** Medium-High | **Source:** C-7, C-8, C-9

---

### 4.11 `searchTyresBySize` — server-side optimization
- [x] Зараз завантажує весь каталог і фільтрує на клієнті
- [x] Перевести на серверну фільтрацію через Payload API query params
- [x] АБО створити custom endpoint

**Файли:** `frontend/src/lib/api/tyres.ts:56-71`
**Severity:** Medium | **Source:** TS-25, TS-34, TB-1

---

### 4.12 `force-dynamic` + `revalidate` conflict
- [x] `api/vehicles/search`: видалити конфлікт `force-dynamic` + `revalidate`
- [x] `shyny/[slug]/page.tsx`: `force-dynamic` + `generateStaticParams` — видалити одне

**Файли:**
- `frontend/src/app/api/vehicles/search/route.ts`
- `frontend/src/app/shyny/[slug]/page.tsx`
**Severity:** Medium | **Source:** TS-24, T-10, TB-2

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-audit-fixes): phase-4 API & data layer completed"
   ```
4. Онови PROGRESS.md
5. Відкрий наступну фазу
