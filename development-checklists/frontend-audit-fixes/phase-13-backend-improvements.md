# Фаза 13: Backend Improvements

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Покращити backend: rate limiting, валідація даних, нові endpoints, оптимізація API.

## Задачі

### 13.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути існуючий rate limiting (якщо є)
- [x] Переглянути Payload hooks та access control
- [x] Переглянути API route handlers

---

### 13.1 Rate limiting on contact API
- [x] Додати rate limiting на `/api/contact`
- [x] Рекомендація: max 5 запитів / 15 хвилин з одного IP
- [x] Розглянути: `@upstash/ratelimit`, custom in-memory, або middleware

**Файли:** `frontend/src/app/api/contact/route.ts`
**Severity:** Medium | **Source:** BACKEND #11, Contacts #3

---

### 13.2 Rate limiting on search APIs
- [x] `/api/tyres/search` — додати rate limiting
- [x] `/api/tyres/sizes` — додати rate limiting
- [x] `/api/vehicles/search` — додати rate limiting

**Файли:**
- `frontend/src/app/api/tyres/search/route.ts`
- `frontend/src/app/api/tyres/sizes/route.ts`
- `frontend/src/app/api/vehicles/search/route.ts`
**Severity:** Medium | **Source:** TB-3, TS-38

---

### 13.3 ContactSubmissions server-side validation
- [x] Додати `validate` функції для полей в Payload collection
- [x] name: min/max length
- [x] email: proper format
- [x] phone: regex validation
- [x] message: min/max length

**Файли:** `backend-payload/src/collections/ContactSubmissions.ts`
**Severity:** Medium | **Source:** BACKEND #10

---

### 13.4 Dealers collection improvements
- [x] Додати `isActive` boolean field (деактивація без видалення)
- [x] Додати `validate` на coordinates (min/max для latitude/longitude)
- [x] Додати індекси на `city` та `type` для пошуку
- [x] Маппінг `services` поля — передавати на фронтенд

**Файли:**
- `backend-payload/src/collections/Dealers.ts`
- `frontend/src/lib/api/dealers.ts`
**Severity:** Medium-Low | **Source:** DB-2, DB-3, DB-4, DB-5

---

### 13.5 Review stats server endpoint
- [x] Створити custom endpoint `/api/reviews/stats`
- [x] Серверна агрегація: average rating, count, distribution
- [x] Параметр `?tyre=<id>` для статистики по шині
- [x] Замінити клієнтську агрегацію з limit 100

**Файли:**
- Новий endpoint в backend
- `frontend/src/lib/api/reviews.ts`
**Severity:** High | **Source:** BACKEND #7

---

### 13.6 Tyres API pagination
- [x] Жорсткий `limit=100` може обрізати дані при росте каталогу
- [x] Додати підтримку пагінації на фронтенді
- [x] АБО збільшити limit з документацією

**Файли:**
- `frontend/src/lib/api/payload.ts:209`
**Severity:** Medium | **Source:** B-B5, P-9

---

### 13.7 Tags dedicated endpoint
- [x] `getPayloadArticleTags()` завантажує всі статті (500) для тегів
- [x] Створити ефективний endpoint для тегів
- [x] АБО використати Payload aggregation

**Файли:** `frontend/src/lib/api/payload.ts:391-400`
**Severity:** Info | **Source:** BD-3

---

### 13.8 Review caching strategy alignment
- [x] ReviewsSection `revalidate=60` vs основні дані `revalidate=3600`
- [x] Уніфікувати стратегію кешування
- [x] Random shuffle робить кеш неефективним — видалити або seed-based

**Файли:**
- `frontend/src/lib/api/reviews.ts:71`
- `frontend/src/components/ReviewsSection.tsx:37`
**Severity:** Low | **Source:** B-B8, B-B10, S-7

---

### 13.9 `isPublished` default safety
- [x] Reviews: `isPublished` defaults to `true`
- [x] Небезпечно при додаванні публічної форми
- [x] Змінити default на `false` або додати workflow

**Файли:** `backend-payload/src/collections/Reviews.ts:139`
**Severity:** Info | **Source:** BD-6, R-23

---

### 13.10 Technology-tyre bidirectional relation
- [x] `tyreSlugs` завжди пустий — однонаправленна зв'язок tyres→technologies
- [x] Додати зворотній зв'язок або hook для автозаповнення

**Файли:**
- `backend-payload/src/collections/Technologies.ts`
- `frontend/src/lib/api/technologies.ts:12`
**Severity:** Info | **Source:** BD-5, T-8, T-24

---

### 13.11 Google Maps API key restriction
- [x] `NEXT_PUBLIC_*` робить ключ публічним
- [x] Налаштувати HTTP referrer restriction в Google Cloud Console
- [x] Обмежити до `bridgestone.ua` та `localhost`

**Файли:** `frontend/src/components/DealersMap.tsx:140`
**Severity:** Medium | **Source:** D-32

---

### 13.12 API timeouts
- [x] QuickSearchForm fetch без timeouts
- [x] Додати AbortController з timeout (10s) на всі fetch виклики
- [x] Показувати error message при timeout

**Файли:** `frontend/src/components/QuickSearchForm.tsx:68-213`
**Severity:** Medium | **Source:** Homepage #10

---

### 13.13 ReviewsSectionWithMore production URL
- [x] Client-side fetch з `NEXT_PUBLIC_PAYLOAD_URL` може бути `localhost:3001` в Docker
- [x] Перевірити env configuration для production

**Файли:** `frontend/src/components/ReviewsSectionWithMore.tsx:30`
**Severity:** Medium | **Source:** T-12

---

### 13.14 Stale Strapi comment cleanup
- [x] Видалити застарілий коментар про Strapi в API route

**Файли:** `frontend/src/app/api/tyres/search/route.ts:32`
**Severity:** Low | **Source:** TB-5, TS-42

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази: [x] Завершена
3. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(frontend-audit-fixes): phase-13 backend improvements completed"
   ```
4. Онови PROGRESS.md: Загальний прогрес: завершено!
