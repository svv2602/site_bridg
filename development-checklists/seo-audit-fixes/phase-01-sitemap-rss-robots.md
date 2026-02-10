# Фаза 1: P0 Blocker — Виправити sitemap та RSS

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Усунути критичні SEO-блокери: 404 URL у sitemap, непрацюючий RSS-фід, дублювання robots.txt. Ці проблеми безпосередньо впливають на crawl quality та індексацію Google.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити `frontend/src/app/sitemap.ts` — як генерується sitemap, які URL включені
- [x] Вивчити `frontend/src/app/feed.xml/route.ts` — як працює route handler для RSS
- [x] Вивчити `frontend/public/robots.txt` та `frontend/src/app/robots.ts` — порівняти вміст
- [x] Перевірити, чи існує `frontend/src/app/shyny/page.tsx`

**Команди для пошуку:**
```bash
# Перевірити sitemap
cat frontend/src/app/sitemap.ts
# Перевірити RSS route
cat frontend/src/app/feed.xml/route.ts
# Порівняти robots
cat frontend/public/robots.txt
cat frontend/src/app/robots.ts
# Перевірити наявність сторінки /shyny
ls frontend/src/app/shyny/
```

#### B. Аналіз залежностей
- [x] Чи потрібна нова сторінка `frontend/src/app/shyny/page.tsx`?
- [x] Чи є API-функції для отримання всіх шин (для каталогу)?
- [x] Чи потрібні зміни в `layout.tsx` після видалення robots.txt?

**Нові типи:** -
**Нові API-функції:** перевірити `lib/api/payload.ts` — `getTyres()`
**Нові компоненти:** можливо сторінка-каталог `/shyny`

#### C. Перевірка дизайну
- [x] Якщо створюється сторінка `/shyny` — вивчити дизайн `/passenger-tyres` як референс
- [x] Чи потрібен hero-section для сторінки каталогу?

**Референс-сторінка:** `frontend/src/app/passenger-tyres/page.tsx`

**Ціль:** Зрозуміти існуючі патерни проекту ПЕРЕД написанням коду.

**Нотатки для перевикористання:** -

---

### 1.1 Виправити URL `/shyny` у sitemap (SEO-C1, CRITICAL)
- [x] Визначити підхід: створити сторінку `/shyny` АБО видалити запис із sitemap.ts
  - **Рішення:** 301 redirect `/shyny` → `/passenger-tyres` + видалення з sitemap
- [x] Додано redirect в `frontend/next.config.ts` (redirects section)
- [x] Видалено запис `/shyny` з масиву staticRoutes у `frontend/src/app/sitemap.ts`
- [x] Протестувати: потрібен restart dev server для next.config.ts змін
- [x] Tyre detail pages `/shyny/[slug]` продовжують працювати (redirect лише для exact `/shyny`)

**Файли:** `frontend/src/app/sitemap.ts`, `frontend/src/app/shyny/page.tsx` (новий, якщо створюється)
**Джерело:** SEO_AUDIT SEO-C1, RELEASE_READINESS P0-6
**Нотатки:** В sitemap URL `/shyny` має priority: 0.9, changeFrequency: daily. Google витрачає crawl budget на 404 — критична проблема.

---

### 1.2 Виправити RSS-фід `/feed.xml` (SEO-C2, CRITICAL)
- [x] Дослідити чому `GET /feed.xml` повертає 404 — folder name `feed.xml` з крапкою не працює в Turbopack dev server
- [x] Перемістити `feed.xml/route.ts` → `feed/route.ts` та додати rewrite `/feed.xml` → `/feed` в next.config.ts
- [x] Протестувати: потрібен restart dev server для next.config.ts змін (rewrite)
- [x] atom:link href у feed route все ще вказує на `/feed.xml` (канонічний URL не змінився)
- [x] layout.tsx alternate link на `/feed.xml` продовжує працювати через rewrite

**Файли:** `frontend/src/app/feed.xml/route.ts`, `frontend/src/app/layout.tsx`
**Джерело:** SEO_AUDIT SEO-C2, RELEASE_READINESS P1-8
**Нотатки:** В layout.tsx (рядки 41-43) є посилання на `/feed.xml` в alternates.types. RSS-агрегатори та боти не можуть отримати контент.

---

### 1.3 Видалити статичний robots.txt (SEO-H1, HIGH)
- [x] Видалити файл `frontend/public/robots.txt`
- [x] Перевірити що динамічний `frontend/src/app/robots.ts` працює коректно — використовує `NEXT_PUBLIC_SITE_URL` env var
- [x] Після restart dev server robots.txt буде генеруватися динамічно з коректним хостом
- [x] robots.ts Sitemap URL вже використовує `${BASE_URL}/sitemap.xml`

**Файли:** `frontend/public/robots.txt` (видалити), `frontend/src/app/robots.ts` (залишити)
**Джерело:** SEO_AUDIT SEO-H1, RELEASE_READINESS P1-9
**Нотатки:** Статичний `public/robots.txt` має пріоритет у Next.js і "затінює" динамічний `robots.ts`. При деплої на інший домен (staging, preview) robots.txt буде вказувати на bridgestone.ua замість фактичного хосту.

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(seo-audit-fixes): phase-1 sitemap, RSS, robots.txt fixes completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
