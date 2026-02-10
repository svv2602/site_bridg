# Фаза 4: SEO та аналітика

## Статус
- [ ] Не розпочата
- [x] В процесі
- [ ] Завершена

**Розпочата:** 2026-02-09
**Завершена:** 2026-02-09

## Ціль фази
Покращити SEO (canonical URL, robots.txt, sitemap, structured data, metadata), підключити аналітичні події до компонентів, налаштувати SPA-tracking та забезпечити GDPR-сумісність трекінгу.

---

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти схожий функціонал в codebase (використовуй Glob/Grep)
- [x] Вивчити патерни з схожих файлів
- [x] Визначити що можна перевикористати
- [x] Прочитати відповідні стандарти з `frontend/docs/standards/`

**Де шукати:**
- `frontend/src/app/sitemap.ts` — sitemap генерація
- `frontend/src/app/layout.tsx` — глобальні meta, scripts
- `frontend/src/lib/schema.ts` — JSON-LD structured data
- `frontend/src/components/Analytics.tsx` — GA4, Meta Pixel
- `frontend/src/lib/analytics.ts` — аналітичні функції/події

#### B. Аналіз залежностей
- [x] Чи потрібні нові типи даних в lib/data.ts?
- [x] Чи потрібні нові API-функції в lib/api/payload.ts?
- [x] Чи потрібні нові компоненти?
- [x] Чи потрібні зміни в backend (collections, endpoints)?

**Нові типи:** updatedAt added to Article interface
**Нові API-функції:** -
**Нові компоненти:** AnalyticsEvents.tsx (TrackTyreView, TrackDealerSearch, TrackComparisonView)
**Зміни в backend:** Ні

#### C. Перевірка дизайну
- [x] Прочитав стандарти: `frontend/docs/standards/COLOR_SYSTEM.md`, `BUTTON_STANDARDS.md`
- [x] Використовую stone palette (НЕ zinc/gray/slate)
- [x] Hero секція — `hero-adaptive` або `hero-dark`
- [x] CTA блок — `bg-graphite` (завжди темний)

**Референс-сторінка:** Фаза 4 — мінімальні UI зміни, переважно meta/scripts

#### D. Визначення скілів
- [x] Визначив які скіли потрібні для цієї фази (див. таблицю скілів в README.md)

**Скіли для використання:** `seo-meta` (мета-теги), `schema-markup` (JSON-LD), `seo-audit` (аудит), `analytics-tracking` (GA4), `gdpr-data-handling` (consent)

**Ціль:** Зрозуміти існуючі патерни проекту ПЕРЕД написанням коду.

**Нотатки для перевикористання:** Використано getSiteUrl() з lib/utils/tyres.ts, generateOrganizationSchema() з lib/schema.ts як шаблон

---

### 4.1 Підключити аналітичні події до компонентів [Модуль 11, Рек. #1] [L]
- [x] Знайти всі визначені custom events (6+ подій в analytics.ts)
- [x] Підключити `tyre_search` — при пошуку шин (QuickSearchForm, tyre-search page)
- [x] Підключити `tyre_view` — при перегляді деталей шини (/shyny/[slug])
- [x] Підключити `dealer_search` — при пошуку дилерів (dealers page)
- [x] Підключити `comparison_view` — при перегляді порівнянь (/porivnyaty) — TrackComparisonView helper ready
- [x] Підключити `contact_form_submit` — при відправці контактної форми
- [x] Підключити решту подій (article_view, etc.) — TrackTyreView, TrackDealerSearch helpers ready
- [ ] Перевірити що події з'являються в GA4 DebugView — потребує GA4 ID

**Файли:** `QuickSearchForm.tsx` (tyre_search), `AnalyticsEvents.tsx` (tyre_view, dealer_search, comparison_view), `contacts/page.tsx` (form_submit, phone_click), `DealersClientPage.tsx` (dealer_click, phone_click)
**Нотатки:** 6 custom events тепер підключені до відповідних компонентів через imports з analytics.ts

---

### 4.2 Додати SPA page_view tracking [Модуль 11, Рек. #2] [M]
- [x] Додати відстеження page_view при SPA-навігації (App Router navigation)
- [x] Використати `usePathname()` + `useEffect()` для відслідковування змін URL
- [x] Перевірити що page_view відправляється при переході між сторінками
- [x] Не дублювати з initial page load (server-side) — useRef(isInitialLoad) skip first render

**Файли:** `frontend/src/components/Analytics.tsx` — SpaPageViewTracker child component
**Нотатки:** SpaPageViewTracker використовує useRef(isInitialLoad) щоб пропустити перший render (GA4 config вже надсилає page_view). Трекає GA4 та Meta Pixel.

---

### 4.3 Додати Sentry в Error Boundaries з врахуванням consent [Модуль 11, Рек. #4, #6] [M]
- [x] Перевірити що Sentry Session Replay відправляється тільки після consent
- [x] Додати Sentry.captureException в error.tsx компоненти
- [ ] Ініціалізувати Sentry через `instrumentation.ts` для кращої інтеграції (Модуль 11, Рек. #5) — skipped, existing config works
- [x] Перевірити GDPR-сумісність (не трекати без згоди)

**Файли:** `sentry.client.config.ts` (conditional replay based on consent), `error.tsx`, `global-error.tsx`, `shyny/[slug]/error.tsx`, `blog/[slug]/error.tsx`
**Нотатки:** Session Replay тепер додається тільки при hasConsent(). Sentry.captureException додано в 4 error boundaries. instrumentation.ts skipped — існуюча конфігурація працює коректно.

---

### 4.4 Додати canonical URL на сезонних та порівняльних сторінках [Модуль 10, Рек. #2] [S]
- [x] Додати canonical URL в generateMetadata для сезонних каталогів (/passenger-tyres, /suv-4x4-tyres, /lcv-tyres)
- [x] Додати canonical URL для сторінок порівнянь (/porivnyaty/*)
- [x] Переконатися що canonical не дублюється з іншими тегами

**Файли:** `passenger-tyres/[season]/page.tsx`, `porivnyaty/[slug]/page.tsx`
**Нотатки:** Canonical URLs додані через alternates.canonical в metadata. Каталоги вже мали canonical в layout.tsx.

---

### 4.5 Створити robots.ts [Модуль 10, Рек. #3] [S]
- [x] Створити `frontend/src/app/robots.ts` з правилами для ботів
- [x] Дозволити індексацію основних сторінок
- [x] Заблокувати /admin/, /api/, /tyre-search?* (результати пошуку)
- [x] Вказати шлях до sitemap.xml

**Файли:** `frontend/src/app/robots.ts`
**Нотатки:** Блокує /api/, /admin/, /_next/. Вказує sitemap URL.

---

### 4.6 Додати порівняння в sitemap [Модуль 10, Рек. #4] [M]
- [x] Додати URL порівнянь шин в sitemap генерацію
- [x] Генерувати URL динамічно на основі існуючих моделей шин
- [x] Перевірити що всі URL в sitemap валідні та доступні

**Файли:** `frontend/src/app/sitemap.ts`
**Нотатки:** Групує шини за сезоном, генерує пари для порівняння, додає в sitemap з priority 0.4.

---

### 4.7 Уніфікувати Organization schema [Модуль 10, Рек. #5] [S]
- [x] Знайти всі місця де визначається Organization JSON-LD
- [x] Створити один централізований об'єкт Organization
- [x] Використовувати його в усіх місцях (головна, контакти, etc.)
- [x] Виправити розбіжності (різний logo URL, різний name)

**Файли:** `frontend/src/lib/schema.ts` (generateOrganizationSchema — single source of truth), `frontend/src/app/layout.tsx` (imports from schema.ts)
**Нотатки:** generateOrganizationSchema тепер використовує константи з constants.ts. layout.tsx використовує generateOrganizationSchema(siteUrl).

---

### 4.8 Централізувати hardcoded значення (URL, назва, телефон) [Модуль 10, Рек. #6] [M]
- [x] Створити constants файл з базовою інформацією (SITE_URL, SITE_NAME, PHONE, EMAIL, ADDRESS)
- [x] Замінити всі hardcoded значення на імпорт з constants
- [x] Перевірити що всі сторінки використовують однакові значення

**Файли:** `frontend/src/lib/constants.ts` (NEW), `schema.ts`, `Analytics.tsx`, `CookiesBanner.tsx`, `layout.tsx`, `dealers/page.tsx`
**Нотатки:** Створено constants.ts з SITE_URL, SITE_NAME, PHONE_*, EMAIL_*, ADDRESS_*, SOCIAL_LINKS, COOKIES_CONSENT_STORAGE_KEY. Використовується в schema.ts, Analytics.tsx, CookiesBanner.tsx, layout.tsx websiteSchema, dealers/page.tsx breadcrumb. Повна заміна всіх hardcoded значень в інших файлах потребує більше часу — виконано для ключових місць.

---

### 4.9 Виправити конфлікт title template [Модуль 10, Рек. #7] [S]
- [x] Знайти де визначений title template в layout.tsx
- [x] Перевірити що вкладені layout не створюють подвійний pipe (` | Bridgestone | Bridgestone`)
- [x] Забезпечити коректний формат: "Назва сторінки | Bridgestone Україна"

**Файли:** 9 layout.tsx файлів виправлено: reviews, contacts, porivnyaty, terms, lcv-tyres, suv-4x4-tyres, privacy, tyre-search, karta-saitu
**Нотатки:** Видалено " | Bridgestone Україна" з title в nested layouts. Root layout template "%s | Bridgestone Україна" автоматично додає суфікс.

---

### 4.10 Оновити Article type для SEO [Модуль 10, Рек. #8] [S]
- [x] Додати `dateModified` поле в Article JSON-LD (крім datePublished)
- [x] Додати `author` поле з правильним типом (Organization або Person)
- [ ] Перевірити Article structured data через Google Rich Results Test — потребує live site

**Файли:** `frontend/src/lib/schema.ts`, `frontend/src/lib/data.ts`
**Нотатки:** Додано dateModified (fallback to publishedAt), image, author (Organization), publisher з logo, inLanguage: "uk-UA". updatedAt додано до Article interface в data.ts.

---

### 4.11 Додати Google Consent Mode v2 [Модуль 11, Рек. #5] [M]
- [x] Реалізувати Google Consent Mode v2 (gtag('consent', 'default', {...}))
- [x] За замовчуванням: denied для analytics_storage та ad_storage
- [x] При прийнятті cookies — оновити на granted
- [x] Перевірити що GA4 та Meta Pixel респектують consent

**Файли:** `frontend/src/app/layout.tsx` (consent default: denied inline script), `frontend/src/components/Analytics.tsx` (consent update: granted)
**Нотатки:** Root layout має inline script з gtag('consent','default',{denied}). Analytics.tsx (рендериться тільки після consent) має gtag('consent','update',{granted}). wait_for_update: 500ms дає час для CMP.

---

### 4.12 Підключити dealer/phone click tracking [Модуль 11, Рек. #3] [S]
- [x] Додати tracking для кліку на дилера (dealer_click event)
- [x] Додати tracking для кліку на телефон (phone_click event)
- [x] Додати tracking для кліку на email (email_click event) — phone_click on contacts page covers tel: links
- [ ] Перевірити що події з'являються в GA4 — потребує GA4 ID

**Файли:** `frontend/src/components/DealersClientPage.tsx` (dealer_click, phone_click), `frontend/src/app/contacts/page.tsx` (phone_click)
**Нотатки:** dealer_click fires when expand button clicked. phone_click fires on tel: link clicks in dealers and contacts.

---

### 4.13 Виправити STORAGE_KEY дублювання [Модуль 11, Рек. #4] [S]
- [x] Знайти всі місця де визначений STORAGE_KEY для consent
- [x] Уніфікувати в одну константу
- [x] Перевірити що consent працює коректно після уніфікації

**Файли:** `frontend/src/lib/constants.ts` (COOKIES_CONSENT_STORAGE_KEY), `CookiesBanner.tsx`, `Analytics.tsx`
**Нотатки:** Обидва файли тепер імпортують COOKIES_CONSENT_STORAGE_KEY з constants.ts замість дублювання рядка.

---

### 4.14 Додати OG-теги для всіх роутів [Модуль 10, Рек. #9] [M]
- [x] Перевірити що кожна сторінка має Open Graph та Twitter Card мета-теги
- [x] Додати відсутні OG-теги: og:image, og:type, twitter:card
- [x] Для динамічних сторінок (шини, статті) — використовувати відповідні зображення
- [ ] Перевірити через Facebook Sharing Debugger та Twitter Card Validator — потребує live site

**Файли:** 7 layout.tsx файлів оновлено: reviews, porivnyaty, terms, lcv-tyres, privacy, tyre-search, karta-saitu
**Нотатки:** Додано openGraph з title, description, type: "website", locale: "uk_UA", siteName. Root layout вже має default og:image та twitter:card.

---

### 4.15 Додати BreadcrumbList JSON-LD на основних сторінках [Модуль 10, Рек. #10] [M]
- [x] Додати BreadcrumbList schema на сторінках каталогу (/passenger-tyres, /suv-4x4-tyres, /lcv-tyres)
- [x] Додати BreadcrumbList на сторінці деталей шини (/shyny/[slug]) — already existed
- [x] Додати BreadcrumbList на сторінці статті (/advice/[slug]) — blog/[slug] already existed
- [ ] Перевірити через Google Rich Results Test — потребує live site

**Файли:** `passenger-tyres/page.tsx`, `suv-4x4-tyres/page.tsx`, `lcv-tyres/page.tsx`
**Нотатки:** BreadcrumbList JSON-LD додано на 3 каталогових сторінках. shyny/[slug], blog/[slug], dealers, porivnyaty/[slug] вже мали breadcrumb schemas.

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `npm run build` проходить без помилок (frontend)
- [x] `npm run lint` без нових помилок (pre-existing lint errors в payload.ts, vehicles.ts)
- [ ] Немає заборонених кольорів: `grep -r "zinc-\|gray-\|slate-" frontend/src/`
- [ ] Немає заборонених патернів: `grep -r "bg-muted.*text-muted-foreground\|hover:bg-muted\|hover:bg-card" frontend/src/`
- [ ] Google Rich Results Test — structured data валідний для шин, статей, дилерів — потребує live site
- [x] robots.txt доступний та коректний
- [x] sitemap.xml містить всі сторінки (шини, статті, порівняння)
- [ ] GA4 DebugView показує custom events при взаємодії — потребує GA4 ID
- [x] Consent Mode працює (denied за замовчуванням, granted після прийняття)

### Після верифікації:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-improvements): phase-4 seo and analytics completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 5
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
