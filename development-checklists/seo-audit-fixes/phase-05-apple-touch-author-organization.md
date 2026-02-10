# Фаза 5: P3 — Apple Touch Icon, article:author, Organization дедуплікація

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати Apple Touch Icon та Web App Manifest для PWA-підтримки, додати article:author в OG-теги статей, консолідувати 3 дублюючих визначення Organization schema в єдине джерело.

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити `frontend/src/app/blog/[slug]/page.tsx` — openGraph блок (рядки 52-63)
- [ ] Вивчити всі 3 місця з Organization schema:
  - `frontend/src/app/layout.tsx` (рядки 79-98)
  - `frontend/src/lib/schema.ts` (рядки 148-166) — `generateOrganizationSchema()`
  - `frontend/src/app/about/layout.tsx` (рядки 26-49)
- [ ] Порівняти відмінності між 3 визначеннями Organization
- [ ] Перевірити чи є apple-touch-icon.png або manifest.json у public/

**Команди для пошуку:**
```bash
# Знайти всі Organization schema
grep -rn "Organization\|sameAs\|contactPoint" frontend/src/app/layout.tsx frontend/src/lib/schema.ts frontend/src/app/about/layout.tsx
# Перевірити наявність apple-touch-icon
ls frontend/public/apple-touch-icon* frontend/public/manifest* frontend/public/site.webmanifest* 2>/dev/null
# Знайти OG-теги у статтях
grep -n "openGraph\|authors\|author" frontend/src/app/blog/[slug]/page.tsx
```

#### B. Аналіз залежностей
- [ ] Чи є логотип для apple-touch-icon (180x180px)?
- [ ] Які дані потрібні для manifest.json?
- [ ] Яке визначення Organization schema найповніше?

**Нові типи:** -
**Нові API-функції:** -
**Нові компоненти:** -

#### C. Перевірка дизайну
- [ ] Визначити іконку для apple-touch-icon (180x180px PNG)
- [ ] Визначити кольори теми для manifest.json

**Референс-сторінка:** -

**Ціль:** Зрозуміти відмінності між Organization definitions та підготувати ресурси.

**Нотатки для перевикористання:** -

---

### 5.1 Додати apple-touch-icon.png (SEO-L4, LOW)
- [ ] Створити `frontend/public/apple-touch-icon.png` (180x180px)
  - Використати логотип Bridgestone на білому або червоному фоні
  - Формат: PNG, без прозорості
- [ ] Перевірити що Next.js автоматично підхоплює файл з `public/`
- [ ] Протестувати: `curl -o /dev/null -s -w "%{http_code}" http://localhost:3010/apple-touch-icon.png` повинен повертати 200

**Файли:** `frontend/public/apple-touch-icon.png` (новий)
**Джерело:** SEO_AUDIT SEO-L4
**Нотатки:** Впливає на PWA-оцінку та відображення при додаванні на домашній екран мобільних пристроїв.

---

### 5.2 Створити manifest.json (SEO-L4, LOW)
- [ ] Створити `frontend/public/manifest.json` або `frontend/src/app/manifest.ts`:
  ```json
  {
    "name": "Bridgestone Україна",
    "short_name": "Bridgestone",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#fafaf9",
    "theme_color": "#e30613",
    "icons": [
      { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
    ]
  }
  ```
- [ ] Додати іконки різних розмірів (192x192, 512x512) якщо доступні
- [ ] Перевірити що manifest доступний: `curl http://localhost:3010/manifest.json`

**Файли:** `frontend/public/manifest.json` або `frontend/src/app/manifest.ts` (новий)
**Джерело:** SEO_AUDIT SEO-L4
**Нотатки:** Динамічний manifest.ts краще за статичний manifest.json (аналогічно robots.ts).

---

### 5.3 Додати article:author в OG-теги статей (SEO-L3, LOW)
- [ ] У `frontend/src/app/blog/[slug]/page.tsx` додати `authors` у openGraph блок:
  ```typescript
  openGraph: {
    ...існуючі теги,
    authors: ['Bridgestone Ukraine'],
  },
  ```
- [ ] Перевірити HTML output — тег `<meta property="article:author" content="Bridgestone Ukraine">`

**Файли:** `frontend/src/app/blog/[slug]/page.tsx`
**Джерело:** SEO_AUDIT SEO-L3
**Нотатки:** OG-теги для статей вже включають publishedTime і modifiedTime, але не author.

---

### 5.4 Консолідувати Organization schema (SEO-L1, LOW)
- [ ] Визначити найповніше з 3 визначень Organization schema
- [ ] Використати `generateOrganizationSchema()` з `frontend/src/lib/schema.ts` як єдине джерело
- [ ] Оновити `frontend/src/app/layout.tsx` — імпортувати та використовувати `generateOrganizationSchema()`
- [ ] Оновити `frontend/src/app/about/layout.tsx` — імпортувати та використовувати `generateOrganizationSchema()`
- [ ] Видалити інлайнові визначення Organization з layout.tsx та about/layout.tsx
- [ ] Об'єднати sameAs посилання (Instagram є в schema.ts, але відсутній в layout.tsx)
- [ ] Протестувати JSON-LD output на головній сторінці та `/about`

**Файли:** `frontend/src/lib/schema.ts`, `frontend/src/app/layout.tsx`, `frontend/src/app/about/layout.tsx`
**Джерело:** SEO_AUDIT SEO-L1
**Нотатки:** 3 різних визначення з незначними розбіжностями (різні телефони, різний набір sameAs). Об'єднати в єдине джерело для consistency.

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
   git commit -m "checklist(seo-audit-fixes): phase-5 Apple Touch Icon, article:author, Organization dedup completed"
   ```
5. Онови PROGRESS.md:
   - Загальний прогрес: 23/23 (100%)
   - Додай запис в історію: "Всі фази завершені"
6. Перевір критерії успіху в README.md
