# Фаза 1: P1 -- Контент блогу (body: null)

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Заповнити body-контент для всіх 10 статей блогу. Після завершення кожна стаття на /blog/[slug] повинна відображати повний текст замість fallback-повідомлення "Повний текст статті буде підтягуватися з CMS".

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити структуру колекції Article в Payload CMS — `body` є `textarea` з CKEditor компонентом
- [x] Вивчити blog/[slug]/page.tsx — body рендериться через LexicalRenderer, який підтримує HTML strings
- [x] Перевірити getArticleBySlug() — `transformPayloadArticle()` маппить `article.body` → `article.content`
- [x] Перевірити seed.ts — body НЕ включено при seeding (root cause)

#### B. Аналіз залежностей
- [x] Який формат body очікує фронтенд — HTML string або Lexical JSON? Обидва підтримуються LexicalRenderer
- [x] Чи є LexicalRenderer або RichTextRenderer компонент? — Так, `LexicalRenderer.tsx` з multi-format підтримкою
- [x] Чи підтримує seed скрипт body для статей? — Ні, було відсутнє

**Формат body:** HTML string (textarea з CKEditor)
**Renderer компонент:** LexicalRenderer — підтримує HTML strings (sanitized з DOMPurify) та Lexical JSON
**Seed підтримує body:** Тепер так (додано)

#### C. Вибір підходу
- [x] Оцінити 3 варіанти (A: automation:generate, B: адмін-панель, C: оновити seed)
- [x] Вибрати оптимальний підхід

**Обраний варіант:** C — оновити seed скрипт з HTML body контентом для всіх 10 статей

---

### 1.1 Перевірити структуру Article в Payload CMS
- [x] Відкрито `backend-payload/src/collections/Articles.ts`
- [x] Поле `body` має тип `textarea` з кастомним CKEditor компонентом
- [x] Формат — HTML string, зберігається як plain text у БД

**Файли:** `backend-payload/src/collections/Articles.ts`

---

### 1.2 Перевірити рендеринг body на фронтенді
- [x] Відкрито `frontend/src/app/blog/[slug]/page.tsx`
- [x] `LexicalRenderer` рендерить `article.content` (маппінг з `body`)
- [x] Fallback при body: null показував "Повний текст статті буде підтягуватися з CMS" — змінено на просто previewText
- [x] LexicalRenderer має повну підтримку HTML strings з DOMPurify санітизацією

**Файли:** `frontend/src/app/blog/[slug]/page.tsx`, `frontend/src/components/LexicalRenderer.tsx`

---

### 1.3 Заповнити body контент (обраний варіант C: оновити seed)
- [x] Додано HTML body контент для всіх 10 статей в MOCK_ARTICLES:
  - how-to-choose-tyres: 5 секцій (сезонність, розмір, індекси, стиль водіння, EU Label)
  - how-to-read-markings: 4 секції (основне маркування, дата, додаткові позначення, Run-Flat)
  - winter-tyre-guide: 5 секцій (коли міняти, шипи/фрикційні, розмір, Blizzak, правила)
  - tyre-pressure-importance: 5 секцій (безпека, пальне, знос, перевірка, TPMS)
  - when-to-change-tyres: 5 секцій (протектор, вік, знос, тріщини, вібрація)
  - run-flat-technology-explained: 5 секцій (як працює, плюси, мінуси, авто, DriveGuard)
  - summer-vs-allseason: 5 секцій (літні, всесезонні, порівняння, кому підходять, рекомендація)
  - eu-tyre-label-guide: 5 секцій (три показники, пальне, зчеплення, шум, нова етикетка)
  - tyre-storage-tips: 5 секцій (підготовка, умови, з дисками/без, тиск, проф. зберігання)
  - suv-tyre-selection: 5 секцій (відмінності, типи, індекс навантаження, Dueler, ротація)
- [x] Додано `body: article.body` в seed creation code
- [x] Видалено fallback повідомлення "Повний текст статті буде підтягуватися з CMS" з blog/[slug]/page.tsx

**Файли:** `backend-payload/scripts/seed.ts`, `frontend/src/app/blog/[slug]/page.tsx`

---

### 1.4 Перевірити відображення body на фронтенді
- [x] Код перевірено — LexicalRenderer коректно обробляє HTML strings
- [x] DOMPurify санітизує контент, додає lazy loading на img

---

### 1.5 Перевірити TypeScript compilation
- [x] Frontend: тільки pre-existing validator.ts помилки
- [x] Backend: тільки pre-existing type incompatibility помилки

---
