# Фаза 3: Інтеграція з CMS (P1)

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-01-11
**Завершена:** 2026-01-11

## Ціль фази
Замінити hardcoded дані на динамічні з API/CMS.

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити API функції в `lib/api/payload.ts`
- [x] Вивчити API функції в `lib/api/tyres.ts`
- [x] Вивчити як tyre-search отримує динамічні дані

#### B. Аналіз залежностей
- [x] API для розмірів шин: `/api/tyres/sizes` - існує
- [x] API для пошуку: `/api/tyres/search` - існує
- [x] API для марок авто: `/api/vehicles/brands` - існує

**Нотатки для перевикористання:**
- `/app/api/tyres/sizes/route.ts` - каскадні фільтри за type=width|height|diameter
- `/app/api/vehicles/brands/route.ts` - всі марки авто
- `/app/api/vehicles/models/route.ts` - моделі за brandId
- `/app/api/vehicles/years/route.ts` - роки за modelId

---

### 3.1 Аналіз QuickSearchForm

**Файл:** `frontend/src/components/QuickSearchForm.tsx`

- [x] Знайти всі hardcoded масиви (widths, heights, diameters)
- [x] Знайти hardcoded марки/моделі авто
- [x] Визначити які API endpoints потрібні

**Нотатки:** Всі endpoints вже існують в `/api/tyres/sizes` та `/api/vehicles/`

---

### 3.2 Створити API для марок авто (якщо не існує)

**Перевірити:** `frontend/src/app/api/vehicles/`

- [x] Перевірити чи існує API для марок авто - ТАК
- [x] `/api/vehicles/brands/route.ts` - вже існує
- [x] `/api/vehicles/models/route.ts` - вже існує

**Нотатки:** API вже повністю реалізовані

---

### 3.3 Рефакторити QuickSearchForm - розміри

**Файл:** `frontend/src/components/QuickSearchForm.tsx`

- [x] Додати useState для widths, heights, diameters
- [x] Додати useEffect для завантаження widths при монтуванні
- [x] Додати каскадне завантаження heights при виборі width
- [x] Додати каскадне завантаження diameters при виборі height
- [x] Додати loading стани для кожного селекту

**Нотатки:** Повністю рефакторено з динамічними даними та loading states

---

### 3.4 Рефакторити QuickSearchForm - авто

- [x] Додати useState для makes, models
- [x] Завантажувати makes при монтуванні
- [x] Завантажувати models при виборі make
- [x] Завантажувати years при виборі model
- [x] Додати loading стани

**Нотатки:** Додано каскадні фільтри для марки → модель → рік

---

### 3.5 Інтегрувати LexicalRenderer для статей

**Файл:** `frontend/src/app/advice/[slug]/page.tsx`

- [x] Імпортувати LexicalRenderer
- [x] Замінити блок з previewText на LexicalRenderer
- [x] Додати поле content до Article interface (lib/data.ts)
- [x] Оновити transformPayloadArticle для включення body (lib/api/payload.ts)

**Нотатки:** Тепер статті з CMS будуть рендеритись через LexicalRenderer, fallback на previewText

---

### 3.6 Замінити hardcoded featured tyres на головній

**Файл:** `frontend/src/app/page.tsx`

- [x] Імпортувати функцію getTyreModels
- [x] Замінити масив `featuredTyres` на дані з API (filter by isPopular)
- [x] Конвертувати page.tsx з client на server component

**Нотатки:** Створено AnimatedSection.tsx для client-side анімацій

---

### 3.7 Замінити hardcoded articles на головній

**Файл:** `frontend/src/app/page.tsx`

- [x] Імпортувати getLatestArticles з API
- [x] Замінити масив `articles` на дані з API (limit: 3)
- [x] Використовувати теги як категорії

**Нотатки:** Дані тепер завантажуються динамічно на сервері

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x] ✅
2. Зміни статус фази на [x] Завершена ✅
3. Заповни дату "Завершена: YYYY-MM-DD" ✅
4. Виконай коміт
5. Онови PROGRESS.md
6. Відкрий `phase-04-accessibility.md`
