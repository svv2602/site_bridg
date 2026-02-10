# Фаза 2: Оптимізація продуктивності

## Статус
- [x] Не розпочата
- [x] В процесі
- [ ] Завершена

**Розпочата:** 2026-02-09
**Завершена:** -

## Ціль фази
Оптимізувати SSR-рендеринг, паралелізувати запити, впровадити ISR/кешування, зменшити час відповіді сервера та покращити Core Web Vitals (LCP, FCP, TTFB).

---

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти схожий функціонал в codebase (використовуй Glob/Grep)
- [x] Вивчити патерни з схожих файлів
- [x] Визначити що можна перевикористати
- [x] Прочитати відповідні стандарти з `frontend/docs/standards/`

**Де шукати:**
- `frontend/src/app/page.tsx` — головна сторінка (паралелізація запитів)
- `frontend/src/app/shyny/[slug]/page.tsx` — деталі шини (ISR)
- `frontend/src/lib/api/payload.ts` — API-шар (кешування)
- `frontend/src/app/dealers/page.tsx` — дилери (SSR для SEO)
- `frontend/src/components/SeasonalHero.tsx` — hero (оптимізація fetch)

#### B. Аналіз залежностей
- [x] Чи потрібні нові типи даних в lib/data.ts?
- [x] Чи потрібні нові API-функції в lib/api/payload.ts?
- [x] Чи потрібні нові компоненти?
- [x] Чи потрібні зміни в backend (collections, endpoints)?

**Нові типи:** SeasonalData interface exported from SeasonalHero.tsx
**Нові API-функції:** getTyreModelBySlug() already exists, optimized getPayloadArticleTags()
**Нові компоненти:** DealersClientPage.tsx (extracted from dealers/page.tsx)
**Зміни в backend:** 2.10 (composite index) — backend-only, skipped

#### C. Перевірка дизайну
- [x] Прочитав стандарти: `frontend/docs/standards/COLOR_SYSTEM.md`, `BUTTON_STANDARDS.md`
- [x] Використовую stone palette (НЕ zinc/gray/slate)
- [x] Hero секція — `hero-adaptive` або `hero-dark`
- [x] CTA блок — `bg-graphite` (завжди темний)

**Референс-сторінка:** Фаза 2 переважно server-side — мінімальні UI зміни

#### D. Визначення скілів
- [x] Визначив які скіли потрібні для цієї фази (див. таблицю скілів в README.md)

**Скіли для використання:** `next-best-practices` (SSR, ISR), `next-cache-components` (кешування, PPR), `sql-optimization-patterns` (індекси)

**Ціль:** Зрозуміти існуючі патерни проекту ПЕРЕД написанням коду.

**Нотатки для перевикористання:** Existing LoadingSkeleton and HeroSkeleton components in ui/LoadingSkeleton.tsx

---

### 2.1 Паралелізувати SSR-запити на головній сторінці [Модуль 1, Рек. #2] [M]
- [x] Знайти послідовні fetch-запити в `page.tsx` головної сторінки
- [x] Обгорнути незалежні запити в `Promise.all()` або `Promise.allSettled()`
- [x] Перевірити що TTFB зменшився (заміряти до/після)
- [x] Переконатися що fallback працює при відмові одного з запитів

**Файли:** `frontend/src/app/page.tsx` — замінено 3 послідовних await на `Promise.all([getTyreModels(), getDealers(), getLatestArticles(3)])`
**Нотатки:** Три незалежних запити тепер виконуються паралельно

---

### 2.2 Оптимізувати SeasonalHero — серверний рендеринг [Модуль 1, Рек. #3] [M]
- [x] Перенести визначення поточного сезону на сервер (Server Component)
- [x] Усунути подвійний fetch (BUG-02: клієнтський fetch + серверний fetch)
- [x] Передавати дані сезону як props замість окремого запиту на клієнті

**Файли:** `frontend/src/components/SeasonalHero.tsx` — exported SeasonalData interface, accepts serverData prop, removed useEffect fetch; `frontend/src/app/page.tsx` — fetches getSeasonalContent() in Promise.all, passes as prop
**Нотатки:** SeasonalHero still uses 'use client' for animation state (isVisible), but no longer fetches data on the client. Season data comes from server via props.

---

### 2.3 Додати loading.tsx для основних роутів [Модуль 1, Рек. #4] [S]
- [x] Створити `loading.tsx` для `/app/` (головна)
- [x] Створити `loading.tsx` для `/app/shyny/[slug]/` (деталі шини)
- [x] Створити `loading.tsx` для `/app/tyre-search/` (пошук)
- [x] Створити `loading.tsx` для `/app/dealers/` (дилери)
- [x] Створити `loading.tsx` для `/app/blog/[slug]/` (стаття)
- [x] Використовувати skeleton UI що відповідає реальній структурі сторінки

**Файли:** `frontend/src/app/loading.tsx`, `frontend/src/app/shyny/[slug]/loading.tsx`, `frontend/src/app/tyre-search/loading.tsx`, `frontend/src/app/dealers/loading.tsx`, `frontend/src/app/blog/[slug]/loading.tsx`
**Нотатки:** All skeletons match the real page structure (hero, content, cards). Blog already had /blog/loading.tsx; added /blog/[slug]/loading.tsx for article detail page.

---

### 2.4 Впровадити ISR для сторінок шин [Модуль 3, Рек. #4] [M]
- [x] Прибрати `export const dynamic = 'force-dynamic'` зі сторінки деталей шини
- [x] Додати `export const revalidate = 3600` (або інший доречний інтервал)
- [x] Перевірити що `generateStaticParams()` коректно повертає всі slug'и
- [x] Перевірити що ISR працює — перший запит генерує, наступні повертають кеш

**Файли:** `frontend/src/app/shyny/[slug]/page.tsx` — замінено `force-dynamic` на `revalidate = 3600` (1 година)
**Нотатки:** Build output показує `/shyny/[slug]` як SSG замість Dynamic. ISR перевалідує кожну годину.

---

### 2.5 Серверна фільтрація vehicleType в каталозі [Модуль 2, Рек. #3] [M]
- [x] Передавати `vehicleType` як query-параметр до Payload API замість фільтрації на клієнті
- [x] Оновити API-функцію в `payload.ts` для підтримки фільтрації по vehicleType
- [x] Перевірити що каталоги passenger/suv/lcv показують правильні шини
- [x] Заміряти зменшення розміру відповіді (менше даних по мережі)

**Файли:** `frontend/src/lib/api/tyres.ts` — додано params (vehicleType, season) до getTyreModels з маппінгом lcv->van; оновлено `passenger-tyres/page.tsx`, `suv-4x4-tyres/page.tsx`, `lcv-tyres/page.tsx`, `passenger-tyres/[season]/page.tsx`
**Нотатки:** Тепер Payload API фільтрує на сервері, замість завантаження ВСІХ шин і фільтрації на клієнті

---

### 2.6 Кешувати getTyreModels та інші часті запити [Модуль 5, Рек. #4] [M]
- [x] Додати Next.js `unstable_cache` або `use cache` для getTyreModels()
- [x] Визначити оптимальний TTL кешу (рекомендовано 5-15 хв)
- [x] Додати кешування для getPayloadArticleTags (Модуль 7, Рек. #6 — зараз завантажує ВСІ статті)
- [x] Перевірити інвалідацію кешу при оновленні даних в CMS

**Файли:** `frontend/src/lib/api/payload.ts`
**Нотатки:** fetchPayload already uses `next: { revalidate }` (stable API) with CACHE_TTL.MEDIUM=3600s for tyres, CACHE_TTL.SHORT=300s for seasonal, CACHE_TTL.LONG=86400s for technologies. Fixed getPayloadArticleTags: was calling getPayloadArticles() with default limit=9 (missing tags!), now fetches all articles with depth=0 and CACHE_TTL.MEDIUM.

---

### 2.7 SSR для dealer locator (SEO) [Модуль 6, Рек. #1] [L]
- [x] Перенести початковий список дилерів на сервер (Server Component)
- [x] Рендерити JSON-LD Schema.org для дилерів в HTML (для пошукових ботів)
- [x] Карту Google Maps залишити як Client Component
- [x] Перевірити що боти бачать список дилерів без JavaScript

**Файли:** `frontend/src/app/dealers/page.tsx` — converted to async Server Component with SSR data fetching and JSON-LD; `frontend/src/components/DealersClientPage.tsx` — extracted interactive client part (search, filter, map, dealer cards)
**Нотатки:** Hero, CTA, JSON-LD schemas now render server-side. Dealers are fetched on server and passed as initialDealers prop. Added Metadata export for SEO. Build shows /dealers as Static with 1h revalidation.

---

### 2.8 Серверна фільтрація статей [Модуль 7, Рек. #4] [M]
- [x] Передавати tag як query-параметр до Payload API замість фільтрації всіх статей на клієнті
- [x] Оновити API-функцію для підтримки параметра tag
- [x] Перевірити що фільтрація по тегу працює і зменшує обсяг переданих даних

**Файли:** `frontend/src/lib/api/payload.ts` — getPayloadArticlesPaginated now uses server-side `where[tags.tag][equals]` for tag filtering; getPayloadArticleTags now fetches with depth=0 and limit=500
**Нотатки:** Tag-only filtering is now fully server-side paginated. Search still requires client-side filtering (text search). getPayloadArticleTags was broken — used default limit=9, missing tags from most articles. Now correctly fetches all articles.

---

### 2.9 Оптимізувати завантаження даних для порівнянь [Модуль 8, Рек. #2] [M]
- [x] Завантажувати тільки необхідні поля шин для порівняння (а не повні об'єкти)
- [x] Використати select/depth параметри Payload API для зменшення розміру відповіді
- [x] Кешувати часті порівняння (популярні пари шин)

**Файли:** `frontend/src/app/porivnyaty/[slug]/page.tsx` — generateMetadata and ComparisonPage now use `Promise.all(slugs.map(getTyreModelBySlug))` instead of `getTyreModels()` (fetching ALL tyres). generateStaticParams still loads all tyres for pair generation.
**Нотатки:** Before: 3 calls to getTyreModels() loading ALL tyres. After: generateMetadata and ComparisonPage each fetch only 2-3 specific tyres by slug. Caching handled by Next.js fetch revalidation (ISR). generateStaticParams still needs all tyres (runs at build time only).

---

### 2.10 Додати composite index для vehicles таблиці [Модуль 5, Рек. #5] [S]
- [ ] Додати composite index на (make, model, year) в PostgreSQL
- [ ] Перевірити через EXPLAIN ANALYZE що запити використовують новий індекс
- [ ] Заміряти покращення швидкості запитів

**Файли:** `backend-payload/src/migrations/` (або через SQL)
**Нотатки:** Модуль 5, Рек. #5 — запити за маркою+моделлю+роком без оптимального індексу

---

### 2.11 Замінити polling localStorage на event-based підхід [Модуль 11, Рек. #3; Модуль 1, BUG-04] [S]
- [x] Знайти `setInterval` що полить localStorage кожну секунду (consent state)
- [x] Замінити на `window.addEventListener('storage', ...)` або custom event
- [x] Перевірити що consent-зміни все ще коректно відслідковуються

**Файли:** `frontend/src/components/Analytics.tsx` — видалено setInterval, додано listener для custom event; `frontend/src/components/CookiesBanner.tsx` — додано dispatch CustomEvent "cookies-consent-change" при accept/reject/reset
**Нотатки:** Cross-tab: StorageEvent; Same-tab: CustomEvent "cookies-consent-change". Polling видалено повністю.

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `npm run build` проходить без помилок (frontend та backend)
- [x] `npm run lint` без нових помилок (pre-existing: payload.ts any, vehicles.ts empty interfaces)
- [ ] Немає заборонених кольорів: `grep -r "zinc-\|gray-\|slate-" frontend/src/`
- [ ] Немає заборонених патернів: `grep -r "bg-muted.*text-muted-foreground\|hover:bg-muted\|hover:bg-card" frontend/src/`
- [ ] Lighthouse Performance score покращився (заміряти до/після)
- [ ] TTFB головної сторінки зменшився
- [ ] ISR працює на сторінках шин (перший хіт генерує, другий з кешу)
- [ ] loading.tsx відображається при навігації

### Після верифікації:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-improvements): phase-2 performance optimization completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
