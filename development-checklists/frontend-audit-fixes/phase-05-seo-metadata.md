# Фаза 5: SEO & Metadata

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Виправити metadata дублювання, додати JSON-LD structured data, canonical URLs, OpenGraph, noindex на 404.

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути `lib/schema.ts` — які JSON-LD хелпери вже існують
- [x] Переглянути root `layout.tsx` — які metadata та JSON-LD вже є
- [x] Знайти всі файли з дублюванням metadata (layout + page)

---

### 5.1 Remove duplicate metadata from layout.tsx files
- [x] `passenger-tyres/layout.tsx` — видалити metadata, залишити лише в page.tsx
- [x] `suv-4x4-tyres/layout.tsx` — аналогічно
- [x] `technology/layout.tsx` — аналогічно
- [x] `reviews/layout.tsx` — аналогічно
- [x] `privacy/layout.tsx` — перенести canonical в page.tsx
- [x] `terms/layout.tsx` — аналогічно
- [x] `karta-saitu/layout.tsx` — аналогічно
- [x] `tyre-search/layout.tsx` — аналогічно
- [x] Перевірити що title використовує root `title.template`

---

### 5.2 Add canonical URLs to seasonal pages
- [x] Додати `alternates.canonical` в `generateMetadata` для `/passenger-tyres/summer`
- [x] Для `/passenger-tyres/winter`
- [x] Для `/passenger-tyres/all-season`
- [x] URL має бути абсолютний (з `siteUrl`)

---

### 5.3 Add JSON-LD to seasonal pages
- [x] Додати `BreadcrumbList` JSON-LD (хелпер `generateBreadcrumbSchema` існує)
- [x] Додати `CollectionPage` або `ItemList` JSON-LD
- [x] Застосувати до всіх 3 сезонних сторінок

---

### 5.4 Add JSON-LD to blog listing
- [x] Додати `CollectionPage` JSON-LD
- [x] Додати `BreadcrumbList` JSON-LD
- [x] Використати `generateBreadcrumbSchema` хелпер

---

### 5.5 Add JSON-LD to technology page
- [x] Додати `BreadcrumbList` JSON-LD (хелпер існує, але не використовується)
- [x] Додати `inLanguage: "uk"` в існуючий JSON-LD

---

### 5.6 Add JSON-LD to reviews page
- [x] Додати `AggregateRating` JSON-LD
- [x] Додати `BreadcrumbList` JSON-LD

---

### 5.7 Add JSON-LD to sitemap page
- [x] Додати `SiteNavigationElement` JSON-LD
- [x] Ідеальна сторінка для навігаційних structured data

---

### 5.8 Fix blog article JSON-LD
- [x] Додати `dateModified` в Article schema
- [x] Додати `image` в Article schema (після fix featuredImage в Phase 4)
- [x] Додати canonical URL як абсолютний

---

### 5.9 Fix Product schema for tyre detail
- [x] Додати `lowPrice`/`highPrice` в `AggregateOffer`
- [x] Без цього Google Rich Results не відобразяться
- [x] Fix canonical URL — абсолютний замість відносного

---

### 5.10 Add `noindex` to 404 pages
- [x] Додати `metadata` export з `robots: { index: false }` в `not-found.tsx`
- [x] Додати в `shyny/[slug]/not-found.tsx`
- [x] Додати в `blog/[slug]/not-found.tsx`

---

### 5.11 Add OpenGraph metadata where missing
- [x] `/about` — додати `openGraph.images`
- [x] `/privacy` — додати OG metadata
- [x] `/terms` — додати OG metadata
- [x] `/tyre-search` — додати OG metadata
- [x] `/dealers` — додати OG metadata
- [x] `/lcv-tyres` — додати OG metadata
- [x] `/porivnyaty/[slug]` — додати canonical та OG

---

### 5.12 Fix blog listing metadata to dynamic
- [x] Замінити статичний `metadata` на `generateMetadata()` для підтримки фільтрів/пагінації в title

---

### 5.13 Blog article OpenGraph improvements
- [x] Додати `modifiedTime` в OpenGraph
- [x] Додати `section` (tag/category)

---

### 5.14 Fix Dealers JSON-LD
- [x] Зменшити кількість LocalBusiness schema (не 200+ на одну сторінку)
- [x] Google рекомендує 1-2 JSON-LD блоки
- [x] Або видалити та залишити лише BreadcrumbList

---

### 5.15 Fix comparison page schema
- [x] Замінити `@type: "Article"` на `ItemPage` або `Product` для порівнянь
- [x] Виправити `datePublished`: не `new Date().toISOString()` (змінюється при кожному рендері)

---

### 5.16 Fix heading hierarchy
- [x] `[season]/page.tsx`: `<h1>` → `<h3>` (пропуск `<h2>`) — виправити
- [x] `technology/page.tsx`: CTA `<h3>` → `<h2>`
- [x] `technology/page.tsx`: `<h5>` для шин — надто глибоко

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-audit-fixes): phase-5 SEO & metadata completed"
   ```
4. Онови PROGRESS.md
5. Відкрий наступну фазу
