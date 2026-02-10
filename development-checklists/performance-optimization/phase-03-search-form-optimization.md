# Фаза 3: P2 -- Оптимізація QuickSearchForm та useVehicleSearch

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Рефакторити QuickSearchForm (7 useEffect + 16 useState -> useReducer або SWR) та useVehicleSearch (13 useEffect, відсутність AbortController в handleSearch). Зменшити кількість ре-рендерів та усунути потенційні race conditions.

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити QuickSearchForm.tsx -- всі useState та useEffect
- [ ] Вивчити useVehicleSearch.ts -- всі useEffect та fetch-логіка
- [ ] Зрозуміти каскадну залежність: widths -> heights -> diameters, brands -> models -> years -> kits
- [ ] Визначити які useEffect можна об'єднати

**Команди для пошуку:**
```bash
# QuickSearchForm аналіз
grep -n "useState\|useEffect" frontend/src/components/QuickSearchForm.tsx
# useVehicleSearch аналіз
grep -n "useState\|useEffect\|AbortController" frontend/src/components/VehicleTyreSelector/useVehicleSearch.ts
# useFetch хук (використовується в useVehicleSearch)
grep -rn "useFetch" frontend/src/
```

#### B. Аналіз залежностей
- [ ] Чи встановлений SWR або React Query? (перевірити package.json)
- [ ] Чи є useFetch хук з AbortController? (перевірити)
- [ ] Чи є інші компоненти що залежать від стану QuickSearchForm?

**Нові типи:** можливо reducer action types
**Нові API-функції:** ні
**Нові компоненти:** ні

#### C. Перевірка дизайну
- [ ] Після рефакторингу -- пошук шин повинен працювати ідентично
- [ ] Каскадні selects: вибір width -> heights оновлюються, і т.д.

**Референс-файл:** `frontend/src/components/QuickSearchForm.tsx`

**Ціль:** Визначити підхід: useReducer (мінімальний рефакторинг) або SWR (більший рефакторинг, краший кеш).

**Нотатки для перевикористання:** Перевірити useFetch хук -- можливо він вже має AbortController.

---

### 3.1 QuickSearchForm: рефакторинг 16 useState -> useReducer
- [ ] Визначити тип стану (SearchFormState) з усіма полями
- [ ] Визначити дії (SearchFormAction): SET_WIDTHS, SET_HEIGHTS, SELECT_WIDTH, etc.
- [ ] Створити reducer функцію
- [ ] Замінити 16 useState на useReducer
- [ ] Зберегти сумісність з існуючим JSX (мінімальні зміни в render)
- [ ] Перевірити що каскадні selects працюють коректно

**Файли:** `frontend/src/components/QuickSearchForm.tsx`
**Аудит-джерело:** PERF-004

**Нотатки:** Якщо SWR вже встановлений -- розглянути варіант з useSWR для кешування API-відповідей. Якщо ні -- useReducer є мінімально інвазивним рішенням.

---

### 3.2 QuickSearchForm: оптимізувати 7 useEffect
- [ ] Об'єднати useEffect для початкового завантаження (widths + brands) в один
- [ ] Перевірити чи можна об'єднати каскадні useEffect
- [ ] Додати cleanup функції для AbortController де відсутні
- [ ] Перевірити що всі залежності в dependency arrays коректні

**Файли:** `frontend/src/components/QuickSearchForm.tsx`
**Аудит-джерело:** PERF-004

---

### 3.3 useVehicleSearch: додати AbortController в handleSearch
- [ ] Відкрити `frontend/src/components/VehicleTyreSelector/useVehicleSearch.ts`
- [ ] Знайти функцію `handleSearch` (рядок ~260)
- [ ] Додати AbortController:
  ```tsx
  const controller = new AbortController();
  const res = await fetch(url, { signal: controller.signal });
  ```
- [ ] Додати cleanup: зберігати controller в ref та abort при новому запиті
- [ ] Перевірити що пошук працює при швидкому переключенні параметрів

**Файли:** `frontend/src/components/VehicleTyreSelector/useVehicleSearch.ts`
**Аудит-джерело:** PERF-005

---

### 3.4 useVehicleSearch: об'єднати useEffect де можливо
- [ ] Проаналізувати 13 useEffect на предмет об'єднання
- [ ] Initialization steps (через initStep) -- об'єднати в один useEffect з switch
- [ ] Каскадні залежності -- залишити окремими (вони мають різні dependency arrays)
- [ ] Задокументувати що було об'єднано

**Файли:** `frontend/src/components/VehicleTyreSelector/useVehicleSearch.ts`
**Аудит-джерело:** PERF-005

---

### 3.5 Тестування: пошук шин працює коректно після рефакторингу
- [ ] Відкрити /tyre-search або головну сторінку з формою
- [ ] Перевірити пошук "за розміром": вибрати ширину -> висоту -> діаметр -> пошук
- [ ] Перевірити пошук "за авто": вибрати марку -> модель -> рік -> комплектацію -> пошук
- [ ] Перевірити швидке переключення параметрів (race condition тест)
- [ ] Перевірити що `npm run lint` проходить

**Нотатки:** -

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Виконай перевірки:
   ```bash
   # Кількість useState та useEffect (має зменшитися)
   grep -c "useState\|useEffect" frontend/src/components/QuickSearchForm.tsx
   grep -c "useState\|useEffect" frontend/src/components/VehicleTyreSelector/useVehicleSearch.ts
   # AbortController перевірка
   grep -n "AbortController" frontend/src/components/VehicleTyreSelector/useVehicleSearch.ts
   # Lint та build
   cd frontend && npm run lint && npm run build
   ```
3. Зміни статус фази:
   - [x] Завершена
4. Заповни дату "Завершена: YYYY-MM-DD"
5. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(performance-optimization): phase-3 QuickSearchForm useReducer, useVehicleSearch AbortController"
   ```
6. Онови PROGRESS.md:
   - Поточна фаза: 4
   - Додай запис в історію
7. Відкрий наступну фазу та продовж роботу
