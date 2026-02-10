# Фаза 4: P2 — Canonical, Hreflang, Pagination

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Виправити canonical URLs на пагінації блогу (динамічний canonical для page > 1), виправити hreflang/alternate теги, додати rel="prev"/rel="next" для пагінації, створити PNG-версію логотипу для Schema.org Organization.logo.

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] blog/page.tsx — canonical фіксований `/blog`, не враховує пагінацію
- [x] layout.tsx — alternates.languages використовує відносні шляхи '/'
- [x] constants.ts — LOGO_URL_WHITE вказує на `/bridgestone-logo-white.svg`
- [x] schema.ts — Organization.logo вказує на `/images/logo.png` (не існує)

#### B. Аналіз залежностей
- [x] blog/page.tsx має searchParams з page параметром (parsePage helper)
- [x] SVG логотип не існує в public/ — файл-placeholder

---

### 4.1 Виправити canonical на пагінації блогу
- [x] Canonical тепер динамічний: page=1 → `/blog`, page>1 → `/blog?page=N`
- [x] generateMetadata отримує searchParams та враховує page

**Файли:** `frontend/src/app/blog/page.tsx`

---

### 4.2 Виправити hreflang/alternate теги
- [x] alternates.languages тепер використовує повні URL через SITE_URL:
  - `'uk': SITE_URL`
  - `'x-default': SITE_URL`

**Файли:** `frontend/src/app/layout.tsx`

---

### 4.3 Rel prev/next для пагінації
- [x] Не реалізовано — Google офіційно не використовує ці теги з 2019. Next.js Metadata API не має native підтримки для link rel="prev/next". Компонент Pagination вже генерує правильні посилання для навігації.

---

### 4.4 Organization.logo — оновлено на реальний файл
- [x] schema.ts: Organization.logo змінено з `/images/logo.png` (не існує) на `/og-image.webp` (реальний файл)
- [x] PNG-версія логотипу не створена — SVG джерело відсутнє в public/; потрібен дизайн-ресурс

**Файли:** `frontend/src/lib/schema.ts`

---
