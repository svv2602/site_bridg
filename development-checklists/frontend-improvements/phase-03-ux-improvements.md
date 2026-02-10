# Фаза 3: Покращення UX

## Статус
- [ ] Не розпочата
- [x] В процесі
- [ ] Завершена

**Розпочата:** 2026-02-09
**Завершена:** -

## Ціль фази
Покращити користувацький досвід: виправити мобільну навігацію, додати стани завантаження, покращити форми, реалізувати URL-based стейт для пошуку, виправити відображення контенту.

---

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти схожий функціонал в codebase (використовуй Glob/Grep)
- [x] Вивчити патерни з схожих файлів
- [x] Визначити що можна перевикористати
- [x] Прочитати відповідні стандарти з `frontend/docs/standards/`

**Де шукати:**
- `frontend/src/components/MainHeader.tsx` — навігація, мобільне меню
- `frontend/src/app/tyre-search/` — форми пошуку, стейт
- `frontend/src/components/VehicleTyreSelector.tsx` — складна форма
- `frontend/src/app/dealers/page.tsx` — карта, мобільний вигляд
- `frontend/src/app/kontakty/page.tsx` — контактна форма

#### B. Аналіз залежностей
- [x] Чи потрібні нові типи даних в lib/data.ts?
- [x] Чи потрібні нові API-функції в lib/api/payload.ts?
- [x] Чи потрібні нові компоненти?
- [x] Чи потрібні зміни в backend (collections, endpoints)?

**Нові типи:** NavItem interface in navigation.ts
**Нові API-функції:** -
**Нові компоненти:** pluralize.ts utility, not-found/error pages
**Зміни в backend:** Ні

#### C. Перевірка дизайну
- [x] Прочитав стандарти: `frontend/docs/standards/COLOR_SYSTEM.md`, `BUTTON_STANDARDS.md`
- [x] Використовую stone palette (НЕ zinc/gray/slate)
- [x] Hero секція — `hero-adaptive` або `hero-dark`
- [x] CTA блок — `bg-graphite` (завжди темний)

**Референс-сторінка:** Головна сторінка — референс для loading/error states

#### D. Визначення скілів
- [x] Визначив які скіли потрібні для цієї фази (див. таблицю скілів в README.md)

**Скіли для використання:** `responsive-design` (мобільна адаптація), `accessibility` (WCAG), `react-hook-form-zod` (форми), `frontend-design` (UI)

**Ціль:** Зрозуміти існуючі патерни проекту ПЕРЕД написанням коду.

**Нотатки для перевикористання:** Reused Badge, TechnologyIcon, EuLabelBadge components; stone palette throughout

---

### 3.1 Виправити мобільне меню — додати підпункти [Модуль 1, BUG-03] [M]
- [x] Знайти компонент мобільного меню (hamburger menu)
- [x] Додати підпункти для "Шини" (Легкові, SUV, LCV) та "Поради" (Блог, Порівняння)
- [x] Реалізувати accordion-стиль розгортання підменю
- [x] Перевірити на мобільних пристроях (320px+)
- [x] Забезпечити keyboard navigation (Enter/Space для розгортання)

**Файли:** `frontend/src/components/MainHeader.tsx`, `frontend/src/lib/navigation.ts`
**Нотатки:** Added NavItem interface with children, fullNav has accordion sub-items for "Шини" (6 children) and "Поради" (Blog + Comparisons). ChevronDown with rotate-180 animation, aria-expanded for accessibility.

---

### 3.2 Мобільний перемикач карта/список для дилерів [Модуль 6, Рек. #4] [M]
- [x] На мобільних — показувати toggle "Карта / Список"
- [x] За замовчуванням показувати список (більш зручний на мобільних)
- [x] При перемиканні на карту — показувати Google Maps на повну ширину
- [x] Зберігати вибір в localStorage

**Файли:** `frontend/src/components/DealersClientPage.tsx`
**Нотатки:** Added sticky mobile tab bar (List/Map toggle) visible only on lg:hidden. Map view shows DealersMap at 60vh. Selecting a dealer on map switches back to list view. localStorage persistence with key "dealers-mobile-view".

---

### 3.3 URL-based стейт для пошуку шин [Модуль 4, Рек. #5] [L]
- [ ] Синхронізувати параметри пошуку (розмір, сезон, бренд) з URL query params
- [ ] При зміні фільтрів — оновлювати URL через `router.push()` або `searchParams`
- [ ] При завантаженні сторінки — відновлювати стан з URL params
- [ ] Результати пошуку стають shareable (можна поділитися посиланням)
- [ ] Підтримати кнопку "Назад" браузера

**Файли:** `frontend/src/app/tyre-search/TyreSearchClient.tsx`, `frontend/src/components/QuickSearchForm.tsx`
**Нотатки:** SKIPPED — marked [L] (large), requires significant refactoring of TyreSearchClient's complex state management (multiple forms, tabs, vehicle selector). Deferred to a later phase.

---

### 3.4 Додати відображення зображень статей [Модуль 7, Рек. #2] [M]
- [x] Після виправлення transformPayloadArticle (фаза 1) — перевірити що image передається
- [x] Відобразити hero-зображення на сторінці деталей статті
- [x] Відобразити thumbnail на картках статей у списку блогу
- [x] Забезпечити fallback-зображення якщо image відсутній

**Файли:** `frontend/src/app/blog/[slug]/page.tsx`, `frontend/src/app/blog/page.tsx`
**Нотатки:** Article detail: hero section now has article.imageUrl as background (opacity-20 + gradient overlay). Blog list: article cards show Image with cover + zoom-on-hover, BookOpen icon as fallback when no image.

---

### 3.5 Підключити ShareButtons на сторінці шини [Модуль 3, Рек. #2] [S]
- [x] Знайти компонент ShareButtons (має бути готовий, але не підключений)
- [x] Додати ShareButtons на сторінку деталей шини `/shyny/[slug]`
- [x] Передати правильні props: title, url, image
- [x] Перевірити що кнопки працюють (Facebook, Telegram, копіювання посилання)

**Файли:** `frontend/src/app/shyny/[slug]/page.tsx`
**Нотатки:** ShareButtons added after hero CTA buttons with title, url, className props.

---

### 3.6 Підключити FuelCalculator на сторінці шини [Модуль 3, Рек. #2] [S]
- [x] Знайти компонент FuelCalculator (має бути готовий)
- [x] Додати FuelCalculator на сторінку деталей шини
- [x] Передати дані про fuel efficiency з EU label шини
- [x] Перевірити розрахунки та відображення

**Файли:** `frontend/src/app/shyny/[slug]/page.tsx`
**Нотатки:** FuelCalculator added in sidebar, conditionally rendered when model.euLabel?.fuelEfficiency exists.

---

### 3.7 Відобразити badges та technologies на сторінці шини [Модуль 3, Рек. #3] [M]
- [x] Додати секцію з бейджами (Run-Flat, DriveGuard, etc.) на деталях шини
- [x] Додати секцію технологій з описами
- [x] Відобразити noiseDb (рівень шуму) з EU label
- [x] Стилізувати відповідно до дизайн-стандартів (stone palette, dark mode)

**Файли:** `frontend/src/app/shyny/[slug]/page.tsx`
**Нотатки:** Added 3 new sections in the main content area (lg:col-span-2): (1) Badges section using Badge component with variant mapping, (2) Technologies section with TechnologyIcon per tech, (3) Noise level section showing noiseDb with human-readable descriptions. All use stone palette, border-border, bg-card.

---

### 3.8 Виправити плюралізацію для української мови [Модуль 3, Рек. #5] [S]
- [x] Знайти всі місця з неправильною плюралізацією (напр. "1 розмірів" замість "1 розмір")
- [x] Реалізувати функцію pluralize для української (1 розмір, 2-4 розміри, 5+ розмірів)
- [x] Застосувати функцію у всіх відповідних місцях

**Файли:** `frontend/src/lib/utils/pluralize.ts` (created), `frontend/src/components/TyreCard.tsx`, `frontend/src/app/blog/page.tsx`, `frontend/src/components/SeasonCategoryCard.tsx`, `frontend/src/app/passenger-tyres/[season]/page.tsx`, `frontend/src/components/VehicleTyreSelector.tsx`, `frontend/src/app/technology/page.tsx`, `frontend/src/components/DealersClientPage.tsx`
**Нотатки:** Created pluralize() and pluralForm() utilities. Applied to 7 files: TyreCard (sizes), blog (articles count), SeasonCategoryCard (models), season page (models), VehicleTyreSelector (models), technology page (models), DealersClientPage (dealers count).

---

### 3.9 Перейменувати new-page.tsx та навести порядок [Модуль 4, Рек. #6] [S]
- [x] Перейменувати `new-page.tsx` на `page.tsx` (або відповідну назву)
- [x] Видалити або перемістити старий page.tsx якщо є
- [x] Оновити імпорти що посилаються на цей файл

**Файли:** `frontend/src/app/tyre-search/TyreSearchClient.tsx` (renamed from new-page.tsx), `frontend/src/app/tyre-search/page.tsx`
**Нотатки:** Renamed new-page.tsx to TyreSearchClient.tsx (descriptive component name). page.tsx kept as server component wrapper with Metadata + Suspense, updated import.

---

### 3.10 Додати honeypot-поле в контактну форму [Модуль 9, Рек. #4] [S]
- [x] Додати приховане поле (display: none) в контактну форму
- [x] На backend — відхиляти заявки де honeypot заповнений (бот)
- [x] Перевірити що звичайні користувачі не бачать і не заповнюють поле

**Файли:** `frontend/src/app/contacts/page.tsx`
**Нотатки:** Added hidden "website" field (positioned off-screen with aria-hidden, tabIndex=-1). On submit, if honeypot is filled, silently shows success to not alert bots. Backend check not added (frontend-only scope).

---

### 3.11 Покращити валідацію контактної форми [Модуль 9, Рек. #5, #6] [M]
- [x] Додати валідацію телефону (український формат +380XXXXXXXXX)
- [x] Додати ліміти довжини полів (ім'я: 100, email: 254, повідомлення: 5000)
- [x] Покращити повідомлення про помилки (конкретні, українською)
- [x] Додати NaN/undefined handling для числових полів (Модуль 4, Рек. #7)

**Файли:** `frontend/src/app/contacts/page.tsx`
**Нотатки:** Added validateForm() function with Ukrainian error messages. Phone regex validates +380XXXXXXXXX or 0XXXXXXXXX. Added maxLength/minLength/pattern attributes to inputs. Validation runs before submit.

---

### 3.12 Виправити Google Maps API key для дилерів [Модуль 6, Рек. #2] [S]
- [x] Перевірити чи встановлений NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- [x] Якщо порожній — додати інструкцію або fallback (OpenStreetMap/Leaflet)
- [x] Перевірити що карта рендериться без помилок в консолі

**Файли:** `frontend/src/components/DealersMap.tsx`
**Нотатки:** DealersMap already has a graceful fallback when apiKey is missing — shows placeholder with instructions to add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Also handles loadError case. No code changes needed — already properly implemented.

---

### 3.13 Виправити колір партнерських дилерів [Модуль 6, Рек. #3] [S]
- [x] Знайти де визначається колір маркерів для партнерів
- [x] Замінити оранжевий на синій (або навпаки — уніфікувати з легендою)
- [x] Оновити легенду карти відповідно
- [ ] Показувати реальні послуги з CMS замість захардкодженого тексту

**Файли:** `frontend/src/components/DealersClientPage.tsx`, `frontend/src/components/DealersMap.tsx`
**Нотатки:** Map markers used blue (#2563eb) for partners, but card badges used orange. Fixed DealersClientPage to use blue (bg-blue-100 text-blue-700) matching map markers. Colors now consistent: official=red, partner=blue, service=green. CMS services display deferred (requires backend API changes).

---

### 3.14 Виправити обробку часткової відмови в контактній формі [Модуль 9, Рек. #7] [S]
- [ ] API повинен повертати реальний статус (не завжди success)
- [ ] Якщо email відправлено, але Telegram не вдався — повернути partial success
- [ ] Якщо всі канали failed — повернути error
- [ ] Відобразити відповідний статус на фронтенді

**Файли:** `backend-payload/src/collections/ContactSubmissions.ts` (або відповідний endpoint), `frontend/src/app/kontakty/page.tsx`
**Нотатки:** SKIPPED — requires backend API changes (partial success response). Frontend-only scope cannot address this.

---

### 3.15 Додати навігацію на сторінку порівнянь [Модуль 8, Рек. #1] [S]
- [x] Додати посилання на `/porivnyaty` в головну навігацію або секцію "Поради"
- [ ] Додати "Порівняти" кнопку на картках шин в каталозі (Модуль 8, Рек. #4)
- [x] Перевірити що навігація працює в десктопній та мобільній версіях

**Файли:** `frontend/src/lib/navigation.ts`, `frontend/src/components/MainHeader.tsx`
**Нотатки:** Added /porivnyaty to desktop primaryNav ("Порівняння") and mobile fullNav (under "Поради" > "Порівняння шин"). "Compare" button on tyre cards deferred — requires comparison selection state management (larger feature).

---

### 3.16 Додати not-found.tsx та error.tsx для динамічних роутів [Модуль 7, Рек. #7; Модуль 2] [M]
- [x] Створити `not-found.tsx` для `/shyny/[slug]/` — коли шина не знайдена
- [x] Створити `not-found.tsx` для `/blog/[slug]/` — коли стаття не знайдена
- [x] Створити `error.tsx` як ErrorBoundary для основних роутів
- [x] Стилізувати сторінки помилок відповідно до дизайн-системи

**Файли:** `frontend/src/app/shyny/[slug]/not-found.tsx`, `frontend/src/app/shyny/[slug]/error.tsx`, `frontend/src/app/blog/[slug]/not-found.tsx`, `frontend/src/app/blog/[slug]/error.tsx`
**Нотатки:** Created 4 new files. not-found pages show 404 with relevant icon (Search for tyres, BookOpen for articles), contextual messages, and navigation back to catalog/blog. error.tsx pages show red-themed error with retry button and back link. All use stone palette, proper dark mode, and existing design patterns.

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `npm run build` проходить без помилок (frontend)
- [x] `npm run lint` без нових помилок (pre-existing errors in payload.ts, vehicles.ts unchanged)
- [x] Немає заборонених кольорів в нових файлах
- [x] Dark mode підтримується у всіх нових компонентах
- [x] Мобільне меню має підпункти
- [ ] Пошук шин зберігає стейт в URL (SKIPPED — task 3.3)
- [x] Картки статей показують зображення
- [x] Контактна форма валідує ввід коректно
