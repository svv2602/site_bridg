# Фаза 2: Frontend - Seasonal Hero + Logos

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-09
**Завершена:** 2026-01-09

## Ціль фази
Додати динамічний SeasonalHero на головну сторінку та логотипи джерел тестів для TestResultsSection.

## Передумови
- API endpoint `/api/seasonal` вже існує в backend-payload
- Логотипи потрібно створити або завантажити

---

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути поточний Hero на головній сторінці `frontend/src/app/page.tsx`
- [x] Перевірити API endpoint `/api/seasonal` в backend-payload
- [x] Вивчити seasonal config в `backend-payload/src/automation/seasonal.ts`

#### B. Аналіз залежностей
- [x] Чи потрібен новий API route в frontend?
- [x] Які формати логотипів використовувати (SVG)?

**Нові типи:** SeasonalData
**Нові API-функції:** frontend API route `/api/seasonal` (proxy до backend)
**Нові компоненти:** SeasonalHero.tsx, QuickSearchForm.tsx

#### C. Перевірка дизайну
- [x] Градієнти для сезонів (spring: orange-yellow, autumn: blue-cyan)
- [x] Fallback до default hero при помилках
- [x] Responsive design для hero

---

### 2.1 Створити SeasonalHero компонент

- [x] Створити `frontend/src/components/SeasonalHero.tsx`
- [x] Додати fetch до backend `/api/seasonal`
- [x] Реалізувати fallback при помилці або loading
- [x] Застосувати динамічний градієнт на основі сезону

**Файли:** `frontend/src/components/SeasonalHero.tsx`

---

### 2.2 Інтегрувати SeasonalHero на головну сторінку

- [x] Замінити статичний hero на SeasonalHero в `page.tsx`
- [x] Зберегти Quick Search форму
- [x] Перевірити що fallback працює коректно

**Файли:** `frontend/src/app/page.tsx`

---

### 2.3 Створити логотипи джерел тестів

- [x] Створити директорію `frontend/public/images/logos/`
- [x] Створити або завантажити `adac.svg`
- [x] Створити або завантажити `autobild.svg`
- [x] Створити або завантажити `tyrereviews.svg`
- [x] Створити або завантажити `tcs.svg`

**Файли:**
```
frontend/public/images/logos/
├── adac.svg
├── autobild.svg
├── tyrereviews.svg
└── tcs.svg
```

---

### 2.4 Оновити TestResultCard для використання логотипів

- [x] Оновити `TestResultCard.tsx` з Image компонентом
- [x] Додати mapping source → logo path
- [x] Додати fallback якщо логотип не знайдено

**Файли:** `frontend/src/components/TestResultCard.tsx`

---

## Верифікація

- [x] SeasonalHero показує правильний контент для поточного місяця
- [x] Градієнти змінюються в залежності від сезону
- [x] Quick Search форма працює в новому hero
- [x] Логотипи відображаються в TestResultCard
- [x] Fallback працює при помилці API
- [x] Responsive design працює

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(frontend): add SeasonalHero and test source logos

   - Add SeasonalHero component with dynamic content
   - Add test source logos (ADAC, AutoBild, TyreReviews, TCS)
   - Update TestResultCard to display source logos
   - Integrate SeasonalHero on homepage"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Загальний прогрес: 9/24
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
