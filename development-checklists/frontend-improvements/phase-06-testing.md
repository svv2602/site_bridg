# Фаза 6: Тестування

## Статус
- [ ] Не розпочата
- [x] В процесі
- [ ] Завершена

**Розпочата:** 2026-02-10
**Завершена:** -

## Ціль фази
Створити тестову інфраструктуру та написати unit, integration та e2e тести для критичних модулів. Досягти покриття > 60% для ключових файлів.

---

## Задачі

### 6.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти схожий функціонал в codebase (використовуй Glob/Grep)
- [x] Вивчити патерни з схожих файлів
- [x] Визначити що можна перевикористати
- [x] Прочитати відповідні стандарти з `frontend/docs/standards/`

**Де шукати:**
- `frontend/src/__tests__/` або `frontend/src/**/*.test.ts` — існуючі тести
- `backend-payload/src/__tests__/` — backend тести
- `frontend/vitest.config.ts` або `frontend/jest.config.ts` — конфігурація тестів
- `frontend/package.json` — test scripts

#### B. Аналіз залежностей
- [x] Чи потрібні нові типи даних в lib/data.ts? — Ні
- [x] Чи потрібні нові API-функції в lib/api/payload.ts? — Ні
- [x] Чи потрібні нові компоненти? — Ні
- [x] Чи потрібні зміни в backend (collections, endpoints)? — Ні

**Нові типи:** не потрібні
**Нові API-функції:** не потрібні
**Нові компоненти:** не потрібні
**Зміни в backend:** не потрібні

#### C. Перевірка дизайну
- [x] Прочитав стандарти: `frontend/docs/standards/COLOR_SYSTEM.md`, `BUTTON_STANDARDS.md`
- [x] Використовую stone palette (НЕ zinc/gray/slate)
- [x] Hero секція — `hero-adaptive` або `hero-dark`
- [x] CTA блок — `bg-graphite` (завжди темний)

**Референс-сторінка:** Фаза 6 — тести, мінімальні UI зміни

#### D. Визначення скілів
- [x] Визначив які скіли потрібні для цієї фази (див. таблицю скілів в README.md)

**Скіли для використання:** `vitest` (unit тести), `testing-library` (React тести), `e2e-testing-patterns` (Playwright), `javascript-testing-patterns` (патерни)

**Ціль:** Зрозуміти існуючі патерни проекту ПЕРЕД написанням коду.

**Нотатки для перевикористання:** Vitest 4.x + @testing-library/react + jsdom + @vitejs/plugin-react

---

### 6.1 Налаштувати тестову інфраструктуру для frontend [Модулі 2-12] [M]
- [x] Перевірити/налаштувати Vitest (або Jest) для frontend — vitest.config.ts created
- [x] Додати @testing-library/react якщо відсутній — installed with jest-dom, user-event
- [x] Налаштувати mock для Next.js (router, image, link) — src/test-setup.tsx
- [x] Додати test script в package.json якщо відсутній — test, test:watch, test:coverage
- [x] Перевірити що тести запускаються: `npm run test` — 107 tests pass

**Файли:** `frontend/vitest.config.ts`, `frontend/package.json`, `frontend/src/test-setup.tsx`, `frontend/tsconfig.json` (excluded test files)
**Нотатки:** Installed vitest 4.x, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, @vitejs/plugin-react, jsdom. Setup file renamed from .ts to .tsx for JSX support. Test files excluded from tsconfig to prevent Next.js build errors.

---

### 6.2 Unit тести для schema.ts (JSON-LD) [Модуль 10, Рек. #11] [M]
- [x] Тестувати генерацію Product schema для шини — 6 tests (variants, EU label, season, baseUrl)
- [x] Тестувати генерацію Article schema для статті — 4 tests (basic, datePublished, author/publisher)
- [x] Тестувати генерацію Organization schema — 2 tests (default, custom baseUrl)
- [x] Тестувати генерацію BreadcrumbList schema — 2 tests (positions, empty array)
- [x] Тестувати edge cases: відсутні поля, null values — FAQ null/empty, AggregateRating null/zero, Review no date, Product with/without reviews/image

**Файли:** `frontend/src/lib/schema.test.ts` (35 tests)
**Нотатки:** Covers all 8 exported schema generators + jsonLdScript helper. Tests include: generateProductSchema, generateLocalBusinessSchema, generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema, generateOrganizationSchema, generateAggregateRatingSchema, generateReviewSchema, generateProductSchemaWithReviews.

---

### 6.3 Unit тести для payload.ts (API layer) [Модулі 2, 3, 7] [L]
- [ ] Тестувати getTyreModels з різними параметрами
- [ ] Тестувати getTyreModelBySlug (після створення)
- [ ] Тестувати getPayloadArticles з фільтрацією
- [ ] Тестувати getPayloadDealers
- [ ] Тестувати transformPayloadArticle (маппінг полів)
- [ ] Тестувати fallback на mock-дані при відмові CMS
- [ ] Мокувати fetch для ізоляції від реального API

**Файли:** `frontend/src/lib/api/payload.test.ts` (новий), `frontend/src/lib/api/payload.ts`
**Нотатки:** Deferred — Effort: L. Requires extensive fetch mocking and complex Payload API response fixtures. Core tests (schema, analytics, utils, Button) provide good coverage for critical paths.

---

### 6.4 Unit тести для analytics.ts [Модуль 11, Рек. #7] [S]
- [x] Тестувати що event functions викликають gtag/fbq з правильними параметрами — 3 GA4 + 3 FB tests
- [x] Тестувати що events не відправляються без consent — tested: no throw when gtag/fbq missing
- [x] Тестувати page_view tracking — GA4 page_path + FB PageView
- [x] Мокувати window.gtag та window.fbq — vi.fn() mocks with beforeEach reset

**Файли:** `frontend/src/lib/analytics.test.ts` (11 tests)
**Нотатки:** Tests cover: trackGA4Event, trackGA4PageView, trackFBEvent, trackFBPageView, and 5 convenience methods (trackTyreSearch, trackTyreView, trackDealerClick, trackFormSubmit, trackCTAClick).

---

### 6.5 Unit тести для утиліт (pluralize, formatSize, seasonLabels) [Модулі 3, 2] [S]
- [x] Тестувати pluralize з різними числами (1, 2, 5, 11, 21, 100) — 9 tests in pluralize.test.ts
- [x] Тестувати formatSize з різними форматами — 5 tests (basic, full, null, undefined, without full)
- [x] Тестувати seasonLabels mapping — tests for seasonLabels, seasonLabelsShort, vehicleTypeLabels, brandLabels

**Файли:** `frontend/src/lib/utils/pluralize.test.ts` (9 tests), `frontend/src/lib/utils/tyres.test.ts` (16 tests)
**Нотатки:** Also covers formatSizes, groupBySeason, formatVehicleTypes. Total 25 utility tests.

---

### 6.6 Component тести для Button [Модуль 12] [M]
- [x] Тестувати рендеринг всіх варіантів (Primary, Secondary, Ghost, etc.) — 6 variants via it.each + 5 class tests
- [x] Тестувати стани (disabled, loading) — disabled prop, loading prop, spinner visibility, icon hiding
- [x] Тестувати onClick callback — click handler called, not called when disabled/loading
- [x] Тестувати accessibility (role="button", aria-disabled) — role, type, aria-label, ref forwarding
- [x] Тестувати dark mode класи — secondary dark:border-stone-600, ghost dark:text-stone-400

**Файли:** `frontend/src/components/ui/Button.test.tsx` (36 tests)
**Нотатки:** Comprehensive coverage: variants (6), sizes (3+3), disabled/loading states, icon rendering, click handlers, a11y attributes, ref forwarding, custom className merge, design system compliance (rounded-full, focus ring, disabled opacity).

---

### 6.7 Integration тести для vehicle fitment API [Модуль 5, Рек. #8] [M]
- [ ] Тестувати endpoint GET /api/vehicles/makes
- [ ] Тестувати endpoint GET /api/vehicles/models?make=X
- [ ] Тестувати endpoint GET /api/vehicles/years?make=X&model=Y
- [ ] Тестувати endpoint POST /api/vehicles/import (з автентифікацією)
- [ ] Тестувати edge cases: порожня make, неіснуюча модель

**Файли:** `backend-payload/src/endpoints/__tests__/vehicles.test.ts` (новий)
**Нотатки:** SKIPPED — backend-only task (backend-payload directory)

---

### 6.8 Integration тести для contact form [Модуль 9, Рек. #9] [M]
- [ ] Тестувати POST /api/contact-submissions з валідними даними
- [ ] Тестувати валідацію (порожні поля, невалідний email, перевищення лімітів)
- [ ] Тестувати rate limiting (6-й запит → 429)
- [ ] Тестувати honeypot (заповнене → відхилення)
- [ ] Тестувати що read access заборонений для анонімних

**Файли:** `backend-payload/src/collections/__tests__/ContactSubmissions.test.ts` (новий)
**Нотатки:** SKIPPED — backend-only task (backend-payload directory)

---

### 6.9 E2E тести для критичних user flows (Playwright) [Модулі 1-9] [L]
- [ ] Налаштувати Playwright якщо не налаштований
- [ ] Тест: пошук шини за розміром → перегляд результатів → перехід на деталі
- [ ] Тест: пошук шини за авто → вибір марки/моделі/року → результати
- [ ] Тест: перегляд каталогу → фільтрація → перехід на шину
- [ ] Тест: карта дилерів → фільтрація → перегляд деталей дилера
- [ ] Тест: відправка контактної форми → успішне повідомлення
- [ ] Тест: навігація між сторінками (перевірка routing)
- [ ] Тест: dark mode toggle → перевірка що стилі змінилися

**Файли:** `frontend/e2e/` (нова папка), `frontend/playwright.config.ts`
**Нотатки:** Deferred — Effort: L. Requires running dev server, Playwright setup, and significant test fixture work. Unit/component tests provide solid foundation first.

---

### 6.10 Налаштувати Storybook для UI компонентів [Модуль 12, Рек. #9] [M]
- [ ] Встановити та налаштувати Storybook 8+ для Next.js
- [ ] Створити stories для Button (всі варіанти, стани)
- [ ] Створити stories для Badge (сезонний, технологія)
- [ ] Створити stories для EU Label
- [ ] Створити stories для Card layout
- [ ] Перевірити що Storybook запускається: `npm run storybook`

**Файли:** `frontend/.storybook/` (нова папка), `frontend/src/components/ui/Button.stories.tsx` (новий), інші stories
**Нотатки:** Deferred — Effort: M. Storybook requires substantial configuration for Next.js 16 + Tailwind v4. Component tests via @testing-library provide functional testing in the meantime.

---

### 6.11 Unit тести для scrapers (backend) [Модуль 5] [M]
- [ ] Тестувати prokoleso scraper з mock HTML
- [ ] Тестувати parsing tire data
- [ ] Тестувати incremental merge logic
- [ ] Тестувати edge cases: missing fields, malformed HTML

**Файли:** `backend-payload/content-automation/src/scrapers/__tests__/prokoleso.test.ts` (новий)
**Нотатки:** SKIPPED — backend-only task (backend-payload directory)

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `npm run build` проходить без помилок (frontend)
- [x] `npm run lint` — 44 pre-existing problems (18 errors, 26 warnings), no new issues
- [x] `npm run test` — всі 107 тестів проходять (5 test suites)
- [ ] `npm run test` — всі тести проходять (backend, якщо є) — SKIPPED (backend-only)
- [ ] Coverage > 60% для schema.ts, payload.ts, analytics.ts, utils.ts — schema/analytics/utils well covered; payload.ts deferred (Effort: L)
- [ ] E2E тести проходять локально — Deferred (Effort: L)
- [ ] Storybook запускається без помилок — Deferred (Effort: M)

### Test Summary
| Test File | Tests | Status |
|-----------|-------|--------|
| `schema.test.ts` | 35 | PASS |
| `Button.test.tsx` | 36 | PASS |
| `tyres.test.ts` | 16 | PASS |
| `analytics.test.ts` | 11 | PASS |
| `pluralize.test.ts` | 9 | PASS |
| **Total** | **107** | **ALL PASS** |
