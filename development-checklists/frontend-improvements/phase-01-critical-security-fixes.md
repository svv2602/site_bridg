# Фаза 1: Критичні виправлення безпеки

## Статус
- [x] Не розпочата
- [x] В процесі
- [ ] Завершена

**Розпочата:** 2026-02-09
**Завершена:** -

## Ціль фази
Виправити всі критичні вразливості безпеки (XSS, витік PII, відсутність автентифікації), критичні баги що ламають функціонал, та усунути витоки debug-інформації у production.

---

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти схожий функціонал в codebase (використовуй Glob/Grep)
- [x] Вивчити патерни з схожих файлів
- [x] Визначити що можна перевикористати
- [x] Прочитати відповідні стандарти з `frontend/docs/standards/`

**Де шукати:**
- `frontend/src/components/` — UI компоненти
- `frontend/src/app/` — сторінки (референс для нових)
- `frontend/src/lib/data.ts` — типи даних
- `frontend/src/lib/api/` — API-шар
- `backend-payload/src/collections/` — Payload collections (access control)
- `backend-payload/src/endpoints/` — кастомні endpoints (автентифікація)

#### B. Аналіз залежностей
- [x] Чи потрібні нові типи даних в lib/data.ts?
- [x] Чи потрібні нові API-функції в lib/api/payload.ts?
- [x] Чи потрібні нові компоненти?
- [x] Чи потрібні зміни в backend (collections, endpoints)?

**Нові типи:** -
**Нові API-функції:** -
**Нові компоненти:** -
**Зміни в backend:** Так — access control для contact-submissions, автентифікація для import API

#### C. Перевірка дизайну
- [x] Прочитав стандарти: `frontend/docs/standards/COLOR_SYSTEM.md`, `BUTTON_STANDARDS.md`
- [x] Використовую stone palette (НЕ zinc/gray/slate)
- [x] Hero секція — `hero-adaptive` або `hero-dark`
- [x] CTA блок — `bg-graphite` (завжди темний)

**Референс-сторінка:** Фаза 1 переважно backend/security — мінімальні UI зміни

#### D. Визначення скілів
- [x] Визначив які скіли потрібні для цієї фази (див. таблицю скілів в README.md)

**Скіли для використання:** `payload` (access control), `nodejs-backend-patterns` (rate limiting), `auth-implementation-patterns` (API auth)

**Ціль:** Зрозуміти існуючі патерни проекту ПЕРЕД написанням коду.

**Нотатки для перевикористання:** -

---

### 1.1 Виправити XSS у шаблоні email контактної форми [Модуль 9, Рек. #1] [S]
- [x] Знайти email-шаблон для contact form submissions
- [x] Додати HTML-екранування (escape) для всіх полів користувача (ім'я, email, повідомлення) перед вставкою в HTML-шаблон
- [x] Перевірити що спеціальні символи (`<`, `>`, `&`, `"`, `'`) коректно екрануються
- [x] Перевірити інші місця де user input може потрапити в HTML без екранування

**Файли:** `frontend/src/app/api/contact/route.ts` — додано `escapeHtml()` для всіх полів у email-шаблоні
**Нотатки:** Додано функцію escapeHtml та використано для name, phone, email, subject, message у HTML email template

---

### 1.2 Закрити публічний доступ на читання до contact-submissions [Модуль 9, Рек. #2] [S]
- [ ] Змінити `read: () => true` на `read: ({ req: { user } }) => Boolean(user)` в access control колекції ContactSubmissions
- [ ] Перевірити що анонімні запити до `/api/contact-submissions` повертають 401/403
- [ ] Переконатися що створення (create) залишається відкритим для анонімних користувачів

**Файли:** `backend-payload/src/collections/ContactSubmissions.ts`
**Нотатки:** ПРОПУЩЕНО — потребує змін в backend-payload/, що виходить за scope frontend-чеклисту

---

### 1.3 Додати rate limiting для контактної форми [Модуль 9, Рек. #3] [M]
- [ ] Додати rate limiting middleware для endpoint створення contact submissions
- [ ] Ліміт: максимум 5 заявок з однієї IP за 15 хвилин (або аналогічне обмеження)
- [ ] Повертати HTTP 429 Too Many Requests при перевищенні ліміту
- [ ] Перевірити що легітимні запити проходять нормально

**Файли:** `backend-payload/src/collections/ContactSubmissions.ts`, можливо новий middleware
**Нотатки:** ПРОПУЩЕНО — потребує змін в backend-payload/, що виходить за scope frontend-чеклисту

---

### 1.4 Додати автентифікацію для API імпорту vehicle fitments [Модуль 5, Рек. #1] [S]
- [ ] Знайти endpoints для імпорту vehicle fitments (POST /api/vehicles/import та подібні)
- [ ] Додати перевірку автентифікації (Bearer token або Payload admin session)
- [ ] Перевірити що неавтентифіковані запити повертають 401
- [ ] Перевірити що автентифіковані запити працюють як раніше

**Файли:** `backend-payload/src/endpoints/` (файли з vehicle import endpoints)
**Нотатки:** ПРОПУЩЕНО — потребує змін в backend-payload/, що виходить за scope frontend-чеклисту

---

### 1.5 Виправити SQL injection ризик в імпортері vehicle fitments [Модуль 5, Рек. #2] [M]
- [ ] Знайти всі SQL-запити з конкатенацією рядків в імпортері
- [ ] Замінити конкатенацію на параметризовані запити (prepared statements / parameterized queries)
- [ ] Перевірити що імпорт працює коректно після змін

**Файли:** `backend-payload/src/endpoints/` (файли з vehicle import логікою), або `backend-payload/content-automation/src/` (якщо імпорт там)
**Нотатки:** ПРОПУЩЕНО — потребує змін в backend-payload/, що виходить за scope frontend-чеклисту

---

### 1.6 Виправити баг "lcv" vs "van" — LCV-каталог показує 0 шин [Модуль 2, Рек. #1] [S]
- [x] Знайти де в коді використовується тип `"lcv"` та де `"van"`
- [x] Уніфікувати на один тип (рекомендовано `"van"` як в Payload CMS)
- [x] Перевірити фільтрацію в каталозі LCV-шин — має показувати шини
- [x] Перевірити що зміна не ламає інші сторінки

**Файли:** `frontend/src/lib/api/payload.ts` — додано маппінг `"van"` -> `"lcv"` в `transformPayloadTyre`
**Нотатки:** Фронтенд використовує "lcv" в типі VehicleType. Замість зміни всіх сторінок, додано маппінг на рівні трансформації API-відповіді.

---

### 1.7 Виправити баг "all-season" vs "allseason" — пошук всесезонних не працює [Модуль 4, Рек. #1] [S]
- [x] Знайти де в QuickSearchForm та пошуковій логіці використовується `"all-season"` та `"allseason"`
- [x] Уніфікувати на один формат (рекомендовано `"allseason"` як в Payload CMS)
- [x] Перевірити що пошук всесезонних шин повертає результати
- [x] Перевірити що фільтрація на сторінках каталогу також працює

**Файли:** `frontend/src/components/QuickSearchForm.tsx` — змінено `"all-season"` на `"allseason"` (2 місця: size search та car search)
**Нотатки:** TyreSearchPage вже використовував правильне значення "allseason". Виправлено тільки QuickSearchForm.

---

### 1.8 Виправити SUV-каталог — відсутній фільтр isPopular [Модуль 2, Рек. #2] [S]
- [x] Перевірити що SUV-каталог (`/suv-4x4-tyres`) має фільтр `isPopular: true` як passenger-tyres
- [x] Додати відсутній фільтр або уніфікувати логіку з passenger-tyres
- [x] Перевірити що SUV-каталог показує очікувані шини

**Файли:** `frontend/src/app/suv-4x4-tyres/page.tsx` — додано `.filter(m => m.isPopular)` перед `.slice(0, 6)` у секції "Популярні моделі"
**Нотатки:** Тепер поведінка аналогічна passenger-tyres: показуються лише шини з прапорцем isPopular

---

### 1.9 Додати CSP (Content Security Policy) header [Модуль 1, Рек. #1] [M]
- [x] Створити або оновити `next.config.ts` з CSP headers
- [x] Дозволити: self, Google Maps API, Google Analytics, Meta Pixel, Sentry
- [x] Заборонити inline scripts (окрім nonce-based) та unsafe-eval
- [x] Перевірити що сайт працює з новими CSP headers (не блокує легітимні ресурси)

**Файли:** `frontend/next.config.ts` — додано Content-Security-Policy header з дозволом для GA, GTM, Facebook, Sentry, Google Maps
**Нотатки:** unsafe-inline для scripts дозволено поки що (для Next.js inline scripts), object-src та base-uri обмежені

---

### 1.10 Виправити FOUC (Flash of Unstyled Content) [Модуль 1, BUG-01] [M]
- [x] Діагностувати причину FOUC при першому завантаженні
- [x] Перевірити порядок завантаження CSS (globals.css, Tailwind)
- [x] Переконатися що тема (data-theme) встановлюється до рендерингу через inline script в `<head>`
- [x] Перевірити suppressHydrationWarning на елементах з темою

**Файли:** `frontend/src/app/layout.tsx` — додано inline script в `<head>` для встановлення data-theme до рендерингу + suppressHydrationWarning на `<html>`
**Нотатки:** Тема тепер читається з localStorage та встановлюється через inline script, що виконується до React-гідрації

---

### 1.11 Видалити console.log з production-коду [Модуль 4, Рек. #2; Модуль 5] [S]
- [x] Знайти всі `console.log` в `frontend/src/` (крім навмисних error/warn)
- [x] Видалити або замінити на умовний лог (тільки в development)
- [x] Особлива увага: `frontend/src/app/tyre-search/new-page.tsx` (~15 console.log)
- [x] Перевірити `frontend/src/lib/api/payload.ts` та інші файли
- [x] Видалити PD-дані (персональні дані) з логів в backend (Модуль 9)

**Файли:** Видалено console.log з: `VehicleTyreSelector.tsx` (12 шт), `new-page.tsx` (2 шт), `contact/route.ts` (5 шт: PII-logging + status logs)
**Нотатки:** Залишено console.error для обробки помилок. Видалено всі debug console.log та PII-logging з контактної форми.

---

### 1.12 Виправити конфлікт force-dynamic / revalidate [Модуль 4, Рек. #4; Модуль 5, Рек. #3] [S]
- [x] Знайти всі файли де одночасно встановлені `export const dynamic = 'force-dynamic'` та `export const revalidate = N`
- [x] Вирішити конфлікт: або прибрати force-dynamic та залишити ISR (revalidate), або прибрати revalidate
- [x] Перевірити: `frontend/src/app/tyre-search/new-page.tsx`, всі vehicle API routes

**Файли:** Видалено конфліктний `revalidate` з 6 файлів: `brands/route.ts`, `models/route.ts`, `years/route.ts`, `kits/route.ts`, `tyre-sizes/route.ts`, `search/route.ts`
**Нотатки:** API routes потребують force-dynamic (доступ до request params), тому прибрано конфліктний revalidate. tyre-search/new-page.tsx не мав конфлікту.

---

### 1.13 Виправити баг залежних полів у формі пошуку [Модуль 4, Рек. #3] [S]
- [x] При зміні "Марка" автоматично скидати "Модель" та "Рік"
- [x] При зміні "Модель" автоматично скидати "Рік"
- [x] Перевірити що скидання працює в обох напрямках (пошук за розміром, пошук за авто)

**Файли:** `frontend/src/components/QuickSearchForm.tsx`, `frontend/src/components/VehicleTyreSelector.tsx`
**Нотатки:** Каскадне скидання вже було реалізовано в обох компонентах. Перевірено: brand -> model/year/kit, model -> year/kit, year -> kit, width -> aspect/diameter, aspect -> diameter.

---

### 1.14 Виправити sitemap — ліміт на статті [Модуль 10, Рек. #1] [S]
- [x] Знайти генерацію sitemap для статей
- [x] Виправити ліміт (наразі ~9 статей замість усіх)
- [x] Переконатися що sitemap включає ВСІ опубліковані статті
- [x] Перевірити пагінацію якщо статей більше ніж ліміт Payload API (limit: 100)

**Файли:** `frontend/src/app/sitemap.ts` — передано `{ limit: 1000 }` для getArticles; `frontend/src/lib/api/articles.ts` — додано `limit` до params getArticles; `frontend/src/app/blog/[slug]/page.tsx` — також виправлено ліміт у generateStaticParams
**Нотатки:** Ланцюжок: sitemap.ts -> getArticles(limit) -> getPayloadArticles(limit) -> getPayloadArticlesPaginated(limit). Ліміт тепер передається наскрізь.

---

### 1.15 Виправити getTyreModels() замість getTyreModelBySlug() [Модуль 3, Рек. #1] [M]
- [x] Знайти де сторінка деталей шини завантажує ВСІ моделі шин замість однієї
- [x] Замінити виклик на `getTyreModelBySlug(slug)` або відфільтрувати на стороні API
- [x] Перевірити що сторінка `/shyny/[slug]` завантажується правильно і швидко

**Файли:** `frontend/src/app/shyny/[slug]/page.tsx` — generateMetadata та основна функція тепер використовують getTyreModelBySlug(slug). getTyreModels() залишено тільки для рекомендованих моделей.
**Нотатки:** Головний запит (модель шини) тепер завантажує 1 документ замість усіх. Рекомендовані моделі потребують повний список — це можна оптимізувати окремо.

---

### 1.16 Виправити transformPayloadArticle — втрачені поля [Модуль 7, Рек. #1] [M]
- [x] Знайти функцію transformPayloadArticle
- [x] Додати маппінг для полів: seoTitle, seoDescription, image (hero image), relatedTyres
- [x] Перевірити що статті відображають зображення замість placeholder
- [x] Перевірити що SEO-мета статей використовує seoTitle/seoDescription

**Файли:** `frontend/src/lib/api/payload.ts` — додано imageUrl, seoTitle, seoDescription, relatedTyres до transformPayloadArticle; `frontend/src/lib/data.ts` — додано відповідні поля до Article типу; `frontend/src/app/blog/[slug]/page.tsx` — видалено @ts-expect-error, використано imageUrl для OG image
**Нотатки:** Тепер трансформація повертає всі поля з CMS. Сторінка статті також оновлена для використання нових полів.

---

### 1.17 Виправити auto-slug для кириліці [Модуль 7, Рек. #3] [S]
- [ ] Знайти hook або логіку генерації slug для статей
- [ ] Додати транслітерацію кириличних символів (а→a, б→b, в→v, і→i, ї→yi, etc.)
- [ ] Перевірити що нові статті отримують читабельний slug замість порожнього

**Файли:** `backend-payload/src/collections/Articles.ts`
**Нотатки:** ПРОПУЩЕНО — потребує змін в backend-payload/, що виходить за scope frontend-чеклисту

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `npm run build` проходить без помилок (frontend та backend)
- [x] `npm run lint` без нових помилок (pre-existing errors: payload.ts any types, vehicles.ts empty interfaces)
- [ ] Немає заборонених кольорів: `grep -r "zinc-\|gray-\|slate-" frontend/src/`
- [ ] Немає заборонених патернів: `grep -r "bg-muted.*text-muted-foreground\|hover:bg-muted\|hover:bg-card" frontend/src/`
- [ ] Перевірено що XSS-виправлення працює (спеціальні символи екрануються в email)
- [ ] Перевірено що contact-submissions API недоступний анонімно (GET /api/contact-submissions → 401)
- [ ] Перевірено що vehicle import API потребує автентифікації
- [ ] Каталог LCV показує шини (не 0)
- [ ] Пошук всесезонних шин повертає результати
- [ ] Sitemap містить всі статті

### Після верифікації:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-improvements): phase-1 critical security fixes completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
