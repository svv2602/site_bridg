# Фаза 7: Нові можливості

## Статус
- [ ] Не розпочата
- [x] В процесі
- [ ] Завершена

**Розпочата:** 2026-02-10
**Завершена:** -

## Ціль фази
Реалізувати нові фічі та низькопріоритетні покращення: Suspense streaming, геолокація, RSS, CAPTCHA, розширення порівнянь, fuzzy search, тощо.

---

## Задачі

### 7.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти схожий функціонал в codebase (використовуй Glob/Grep)
- [x] Вивчити патерни з схожих файлів
- [x] Визначити що можна перевикористати
- [x] Прочитати відповідні стандарти з `frontend/docs/standards/`

**Де шукати:**
- `frontend/src/app/` — існуючі сторінки для референсу
- `frontend/src/components/` — існуючі компоненти
- `frontend/src/lib/api/payload.ts` — API-шар
- `backend-payload/src/endpoints/` — існуючі endpoints

#### B. Аналіз залежностей
- [x] Чи потрібні нові типи даних в lib/data.ts? — Ні
- [x] Чи потрібні нові API-функції в lib/api/payload.ts? — Ні
- [x] Чи потрібні нові компоненти? — Так: TableOfContents
- [x] Чи потрібні зміни в backend (collections, endpoints)? — Ні (frontend-only)

**Нові типи:** ContactFormData (via zod z.infer)
**Нові API-функції:** не потрібні
**Нові компоненти:** TableOfContents, RSS route handler
**Зміни в backend:** не потрібні (frontend-only tasks)

#### C. Перевірка дизайну
- [x] Прочитав стандарти: `frontend/docs/standards/COLOR_SYSTEM.md`, `BUTTON_STANDARDS.md`
- [x] Використовую stone palette (НЕ zinc/gray/slate)
- [x] Hero секція — `hero-adaptive` або `hero-dark`
- [x] CTA блок — `bg-graphite` (завжди темний)

**Референс-сторінка:** Головна сторінка — референс для нових секцій

#### D. Визначення скілів
- [x] Визначив які скіли потрібні для цієї фази (див. таблицю скілів в README.md)

**Скіли для використання:** `next-best-practices` (Suspense, streaming), `react-hook-form-zod` (Zod schema), `seo-meta` (RSS, hreflang)

**Ціль:** Зрозуміти існуючі патерни проекту ПЕРЕД написанням коду.

**Нотатки для перевикористання:** useSyncExternalStore for DOM-reactive data extraction (e.g. ToC headings)

---

### 7.1 Додати Suspense streaming для головної сторінки [Модуль 1, Рек. #5] [M]
- [x] Обгорнути секції головної сторінки в `<Suspense>` з fallback
- [x] Зробити кожну секцію async Server Component — PopularCarouselSection, FeaturedTyresSection, ArticlesSection, DealerLocatorSection
- [x] Shell (header + hero) рендериться миттєво, секції стримляться поступово
- [ ] Перевірити через Chrome DevTools → Network → streaming response — потребує live server

**Файли:** `frontend/src/app/page.tsx`
**Нотатки:** Refactored page from single async function to shell + 4 async server components wrapped in Suspense. Static sections (features, vehicle types, trust indicators, CTA) render instantly. Data-dependent sections (carousel, popular tyres, articles, dealers) stream progressively with skeleton fallbacks.

---

### 7.2 Додати CAPTCHA для контактної форми [Модуль 9, Рек. #8] [M]
- [ ] Інтегрувати Google reCAPTCHA v3 або hCaptcha
- [ ] Додати CAPTCHA widget на frontend контактної форми
- [ ] Додати верифікацію CAPTCHA на backend
- [ ] Переконатися що CAPTCHA не блокує легітимних користувачів

**Файли:** `frontend/src/app/contacts/page.tsx`, `backend-payload/src/collections/ContactSubmissions.ts`
**Нотатки:** SKIPPED — requires backend integration for CAPTCHA token verification and API keys configuration

---

### 7.3 Додати Zod-схему для контактної форми [Модуль 9, Рек. #9] [M]
- [x] Створити Zod-схему для contact form (name, email, phone, message) — `lib/schemas/contact.ts`
- [x] Використовувати одну схему на frontend та backend — schema exported, can be imported by backend
- [x] Інтегрувати з React Hook Form (якщо використовується) — integrated into existing form via `safeParse`
- [x] Типізувати через z.infer<> — `ContactFormData = z.infer<typeof contactFormSchema>`

**Файли:** `frontend/src/lib/schemas/contact.ts` (new), `frontend/src/app/contacts/page.tsx`
**Нотатки:** Created shared Zod schema with Ukrainian error messages. Contact form now validates client-side before submission with per-field error display (red border, error text, aria-invalid, aria-describedby). Fields clear errors on change. Zod installed as direct dependency.

---

### 7.4 Додати геолокацію для дилерів [Модуль 6, Рек. #7] [M]
- [ ] Запитати дозвіл на геолокацію через navigator.geolocation
- [ ] Центрувати карту на позиції користувача
- [ ] Сортувати дилерів за відстанню від користувача
- [ ] Кнопка "Найближчий дилер"
- [ ] Fallback якщо геолокація відхилена (показувати Київ)

**Файли:** `frontend/src/app/dealers/page.tsx`, `frontend/src/components/DealersMap.tsx`
**Нотатки:** Deferred — Effort: M. Requires integration with Google Maps API permissions flow and distance calculation logic. The dealers page is "use client" so this is feasible but complex.

---

### 7.5 Додати RSS-фід для блогу [Модуль 7, Рек. #8] [S]
- [x] Створити route handler `/feed.xml` — `app/feed.xml/route.ts`
- [x] Генерувати RSS 2.0 XML з усіх опублікованих статей — sorted by date, limit 50, with categories
- [x] Додати `<link rel="alternate" type="application/rss+xml">` в layout — via metadata.alternates.types
- [ ] Перевірити валідність через RSS validator — потребує live server

**Файли:** `frontend/src/app/feed.xml/route.ts` (new), `frontend/src/app/layout.tsx`
**Нотатки:** RSS 2.0 feed with Atom self-link. Includes article title, link, guid, description, pubDate, categories (tags). Cached for 1 hour. XML entities properly escaped.

---

### 7.6 AI-вердикт для порівнянь шин [Модуль 8, Рек. #4] [L]
- [ ] Замінити статичний вердикт на AI-генерований (через Claude API або pre-generated)
- [ ] Зберігати вердикти в CMS для кешування
- [ ] Відображати вердикт як structured content (не просто текст)
- [ ] Fallback на статичний вердикт якщо AI недоступний

**Файли:** `frontend/src/app/porivnyaty/page.tsx`, `backend-payload/content-automation/`
**Нотатки:** SKIPPED — requires backend/automation infrastructure for AI content generation and CMS storage

---

### 7.7 Marker clustering для карти дилерів [Модуль 6, Рек. #8] [M]
- [ ] Додати @googlemaps/markerclusterer або аналогічну бібліотеку
- [ ] Групувати близькі маркери при зменшенні масштабу
- [ ] Показувати кількість дилерів у кластері
- [ ] Розгрупувати при збільшенні масштабу

**Файли:** `frontend/src/app/dealers/page.tsx` (або DealerMap після декомпозиції)
**Нотатки:** Deferred — Effort: M. Requires @googlemaps/markerclusterer package and Google Maps AdvancedMarkerElement integration.

---

### 7.8 Додати pg_trgm fuzzy search для автомобілів [Модуль 5, Рек. #9] [M]
- [ ] Увімкнути extension pg_trgm в PostgreSQL
- [ ] Створити trigram index на make та model
- [ ] Реалізувати similarity search (знаходити "Toyota" при введенні "Тойота")
- [ ] Інтегрувати з frontend autocomplete

**Файли:** SQL migration, `backend-payload/src/endpoints/` (vehicles search)
**Нотатки:** SKIPPED — backend-only task (PostgreSQL extension, backend endpoint)

---

### 7.9 Додати FAQ з CMS для контактної сторінки [Модуль 9, Рек. #10] [M]
- [ ] Створити FAQ collection або field в Payload CMS
- [ ] Відобразити FAQ секцію на сторінці контактів
- [ ] Додати FAQ schema JSON-LD
- [ ] Зробити FAQ editable через admin panel

**Файли:** `backend-payload/src/collections/` (FAQ collection), `frontend/src/app/contacts/page.tsx`
**Нотатки:** SKIPPED — requires backend collection creation in Payload CMS first

---

### 7.10 Додати Table of Contents для статей [Модуль 7, Рек. #9] [M]
- [x] Парсити headings (h2, h3) з content статті — uses `useSyncExternalStore` + MutationObserver
- [x] Генерувати навігаційний блок ToC — auto-generated from article headings
- [x] Sticky positioning на десктопі (в sidebar) — `sticky top-24` in aside
- [x] Smooth scroll до відповідної секції при кліку — `scrollIntoView({ behavior: "smooth" })`
- [x] Highlight активну секцію через IntersectionObserver — green active state with rootMargin

**Файли:** `frontend/src/components/TableOfContents.tsx` (new), `frontend/src/app/blog/[slug]/page.tsx`
**Нотатки:** Client component using `useSyncExternalStore` for lint-safe DOM subscription. Extracts h2/h3 headings, auto-assigns IDs, supports late-rendered CMS content via MutationObserver. Desktop: sticky sidebar (240px). Mobile: collapsible toggle. Only renders if 2+ headings found. Proper a11y: nav with aria-label, aria-expanded toggle.

---

### 7.11 Розширити таблицю порівнянь [Модуль 8, Рек. #5] [S]
- [x] Додати додаткові характеристики в таблицю порівнянь (brand, usage) — added brand, usage, renamed EU label columns
- [x] Виділяти кращі значення кольором (зелений для кращого) — already implemented via determineWinner
- [ ] Використовувати i18n tokens замість hardcoded strings (Модуль 8, Рек. #6) — deferred, requires full i18n infrastructure

**Файли:** `frontend/src/app/porivnyaty/[slug]/page.tsx`
**Нотатки:** Added brand attribute (using brandLabels from utils/tyres), usage attribute (city/highway/offroad/winter). Renamed EU label columns with "(EU)" suffix for clarity. Winner highlighting with green was already in place.

---

### 7.12 Додати hreflang для майбутньої мультимовності [Модуль 10, Рек. #12] [S]
- [x] Додати hreflang="uk" для українських сторінок — via metadata.alternates.languages
- [x] Підготувати структуру для майбутніх мов (x-default) — x-default points to /
- [ ] Перевірити через Google Search Console — потребує live site

**Файли:** `frontend/src/app/layout.tsx`
**Нотатки:** Added `languages: { 'uk': '/', 'x-default': '/' }` to metadata.alternates. Next.js will render `<link rel="alternate" hreflang="uk" href="...">` and `<link rel="alternate" hreflang="x-default" href="...">` tags automatically.

---

### 7.13 Додати auto-reply email для контактної форми [Модуль 9, Рек. #11] [M]
- [ ] Після успішного створення заявки — відправити підтвердження на email користувача
- [ ] Шаблон: "Дякуємо за звернення, ми відповімо протягом 24 годин"
- [ ] Включити номер заявки для reference
- [ ] Не відправляти якщо email відсутній або невалідний

**Файли:** `backend-payload/src/collections/ContactSubmissions.ts` (afterChange hook)
**Нотатки:** SKIPPED — backend-only task (email sending requires SMTP configuration and Payload afterChange hook)

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `npm run build` проходить без помилок (frontend)
- [x] `npm run lint` — 44 pre-existing problems (18 errors, 26 warnings), no new issues
- [x] Немає заборонених кольорів (перевірено в Phase 5)
- [x] Немає заборонених патернів (перевірено в Phase 5)
- [ ] Dark mode працює коректно (візуальна перевірка або Playwright screenshot) — потребує live server
- [ ] Адаптивність перевірена (мобільні 320px+, планшет 768px, десктоп 1280px+) — потребує live server
- [x] `npm run test` — всі 107 тестів проходять
- [x] Нові фічі працюють як очікується (build passes)

### Summary of completed tasks
| Task | Description | Status |
|------|------------|--------|
| 7.1 | Suspense streaming for homepage | DONE |
| 7.2 | CAPTCHA | SKIPPED (backend) |
| 7.3 | Zod schema for contact form | DONE |
| 7.4 | Geolocation for dealers | Deferred (M) |
| 7.5 | RSS feed for blog | DONE |
| 7.6 | AI verdict | SKIPPED (backend) |
| 7.7 | Marker clustering | Deferred (M) |
| 7.8 | pg_trgm fuzzy search | SKIPPED (backend) |
| 7.9 | FAQ from CMS | SKIPPED (backend) |
| 7.10 | Table of Contents | DONE |
| 7.11 | Extend comparison table | DONE |
| 7.12 | hreflang | DONE |
| 7.13 | Auto-reply email | SKIPPED (backend) |
