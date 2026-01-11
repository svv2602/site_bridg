# Фаза 3: Інтеграція з CMS (P1)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Замінити hardcoded дані на динамічні з API/CMS.

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити API функції в `lib/api/payload.ts`
- [ ] Вивчити API функції в `lib/api/tyres.ts`
- [ ] Вивчити як tyre-search отримує динамічні дані

**Команди для пошуку:**
```bash
# Пошук API функцій
ls frontend/src/lib/api/
# Пошук fetch викликів
grep -rn "fetch(" frontend/src/app/tyre-search/
# Пошук API routes
ls frontend/src/app/api/
```

#### B. Аналіз залежностей
- [ ] API для розмірів шин: `/api/tyres/sizes` - існує
- [ ] API для пошуку: `/api/tyres/search` - існує
- [ ] API для марок авто: потрібно перевірити

**Нотатки для перевикористання:**
- `/app/tyre-search/new-page.tsx` - референс для динамічних селектів
- `/app/api/tyres/sizes/route.ts` - каскадні фільтри

---

### 3.1 Аналіз QuickSearchForm

**Файл:** `frontend/src/components/QuickSearchForm.tsx`

- [ ] Знайти всі hardcoded масиви (widths, heights, diameters)
- [ ] Знайти hardcoded марки/моделі авто
- [ ] Визначити які API endpoints потрібні

**Hardcoded дані для заміни:**
- `widths: ["175", "185", "195", ...]` → API `/api/tyres/sizes?field=width`
- `heights: ["45", "50", "55", ...]` → API `/api/tyres/sizes?field=height`
- `diameters: ["14", "15", "16", ...]` → API `/api/tyres/sizes?field=diameter`
- `carMakes` → API `/api/vehicles/makes`
- `carModels` → API `/api/vehicles/models`

**Нотатки:** -

---

### 3.2 Створити API для марок авто (якщо не існує)

**Перевірити:** `frontend/src/app/api/vehicles/`

- [ ] Перевірити чи існує API для марок авто
- [ ] Якщо ні - створити `/api/vehicles/makes/route.ts`
- [ ] Якщо ні - створити `/api/vehicles/models/route.ts`

**Нотатки:** -

---

### 3.3 Рефакторити QuickSearchForm - розміри

**Файл:** `frontend/src/components/QuickSearchForm.tsx`

- [ ] Додати useState для widths, heights, diameters
- [ ] Додати useEffect для завантаження widths при монтуванні
- [ ] Додати каскадне завантаження heights при виборі width
- [ ] Додати каскадне завантаження diameters при виборі height
- [ ] Додати loading стани для кожного селекту

**Референс:** Вивчити реалізацію в `tyre-search/new-page.tsx`

**Нотатки:** -

---

### 3.4 Рефакторити QuickSearchForm - авто

- [ ] Додати useState для makes, models
- [ ] Завантажувати makes при монтуванні
- [ ] Завантажувати models при виборі make
- [ ] Додати loading стани

**Нотатки:** -

---

### 3.5 Інтегрувати LexicalRenderer для статей

**Файл:** `frontend/src/app/advice/[slug]/page.tsx`

**Проблема:** Сторінка показує тільки previewText, не повний контент.

- [ ] Імпортувати LexicalRenderer
- [ ] Замінити блок з previewText на LexicalRenderer
- [ ] Перевірити що стаття з CMS рендериться правильно

**Код:**
```tsx
import { LexicalRenderer } from "@/components/LexicalRenderer";

// В компоненті:
{article.content ? (
  <LexicalRenderer content={article.content} />
) : (
  <p className="text-muted-foreground">{article.previewText}</p>
)}
```

**Нотатки:** -

---

### 3.6 Замінити hardcoded featured tyres на головній

**Файл:** `frontend/src/app/page.tsx`

- [ ] Імпортувати функцію для отримання популярних шин
- [ ] Замінити масив `featuredTyres` на дані з API
- [ ] Додати fallback на mock дані

**Нотатки:** -

---

### 3.7 Замінити hardcoded articles на головній

**Файл:** `frontend/src/app/page.tsx`

- [ ] Імпортувати getArticles з API
- [ ] Замінити масив `articles` на дані з API (limit: 3)
- [ ] Додати fallback на mock дані

**Нотатки:** -

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази на [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(cms): phase-3 dynamic data from API"
   ```
5. Онови PROGRESS.md
6. Відкрий `phase-04-accessibility.md`
