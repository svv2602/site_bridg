# Фаза 2: P1 — Open Graph та og:type

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Виправити og:type на сторінках шин з `website` на `product`, додати власні openGraph теги на сторінки, які наслідують дефолтні значення з layout. Це покращить відображення при шерінгу у соціальних мережах.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити `frontend/src/app/shyny/[slug]/page.tsx` — generateMetadata(), openGraph block
- [x] Вивчити `frontend/src/app/reviews/page.tsx` — metadata export
- [x] Вивчити `frontend/src/app/karta-saitu/page.tsx` — metadata export
- [x] Вивчити `frontend/src/app/layout.tsx` — дефолтні OG-теги, які наслідуються
- [x] Перевірити які сторінки категорій шин існують (passenger-tyres, suv-4x4-tyres, lcv-tyres)

#### B. Аналіз залежностей
- [x] Чи є OG-зображення для категорій шин у `public/`?
- [x] Який формат OG image використовується (розмір, тип)?

#### C. Перевірка дизайну
- [x] Перевірити що дефолтний OG image `/og-image.jpg` існує та має адекватний розмір

**Референс-сторінка:** `frontend/src/app/blog/[slug]/page.tsx` — зразок повного openGraph блоку

---

### 2.1 Замінити og:type на сторінках шин (SEO-H2, HIGH)
- [x] У `frontend/src/app/shyny/[slug]/page.tsx` (generateMetadata, рядок ~57) замінити `type: 'website'` на `type: 'product'`
- [x] Перевірити що інші openGraph властивості (title, description, images) залишились коректними
- [x] Протестувати: перевірити HTML output для `/shyny/turanza-t005` — тег `<meta property="og:type" content="product">`

**Файли:** `frontend/src/app/shyny/[slug]/page.tsx`
**Нотатки:** Використано type cast `'product' as const as 'website'` оскільки Next.js Metadata types не включають 'product', але OG протокол підтримує це значення.

---

### 2.2 Додати openGraph на /reviews (SEO-H4, HIGH)
- [x] У `frontend/src/app/reviews/page.tsx` додати openGraph блок до metadata
- [x] Переконатись що title та description відповідають тому, що визначено в metadata сторінки

**Файли:** `frontend/src/app/reviews/page.tsx`

---

### 2.3 Додати openGraph на /karta-saitu (SEO-H4, HIGH)
- [x] У `frontend/src/app/karta-saitu/page.tsx` додати openGraph блок до metadata

**Файли:** `frontend/src/app/karta-saitu/page.tsx`

---

### 2.4 Додати OG-image для категорій шин (SEO-M4, MEDIUM)
- [ ] Створити або знайти OG-зображення для категорій шин (1200x630 px, WebP або JPG)
- [ ] Розмістити зображення у `frontend/public/images/og/`
- [ ] Додати `openGraph.images` у metadata кожної категорії
- [ ] Протестувати що зображення доступні за URL

**Файли:** `frontend/src/app/passenger-tyres/page.tsx`, `frontend/src/app/suv-4x4-tyres/page.tsx`, `frontend/src/app/lcv-tyres/page.tsx`
**Нотатки:** Відкладено — потрібні дизайн-ресурси (OG-зображення 1200x630). Категорії вже мають openGraph metadata, відсутні лише специфічні images.

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
   git commit -m "checklist(seo-audit-fixes): phase-2 Open Graph og:type fixes completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
