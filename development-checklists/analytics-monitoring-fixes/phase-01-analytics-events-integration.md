# Фаза 1: P0 Blocker -- Інтеграція аналітичних подій в UI

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Підключити всі визначені tracking компоненти та функції до відповідних сторінок та компонентів. Після завершення: tyre_view, tyre_search, form_submit, dealer_search, dealer_click, phone_click, comparison_view події реально відправляються при взаємодії користувача.

**Джерело:** ANALYTICS_MONITORING_AUDIT C1, C2, C3, C4, RELEASE_READINESS_REPORT P0-5

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити API AnalyticsEvents.tsx — які пропси приймають TrackTyreView, TrackDealerSearch, TrackComparisonView
- [x] Вивчити API analytics.ts — сигнатури trackTyreSearch, trackFormSubmit, trackDealerClick, trackPhoneClick
- [x] Вивчити структуру сторінок де потрібно підключити tracking

**Команди для пошуку:**
```bash
# Tracking компоненти
grep -n "export.*Track\|interface.*Props" frontend/src/components/AnalyticsEvents.tsx
# Tracking функції
grep -n "export.*track\|function track" frontend/src/lib/analytics.ts
# Сторінка шини — де рендерити TrackTyreView
grep -n "return\|export default" frontend/src/app/shyny/\[slug\]/page.tsx | head -10
# Форма контактів — де викликати trackFormSubmit
grep -n "onSubmit\|success\|setStatus" frontend/src/app/contacts/ContactForm.tsx | head -10
# QuickSearchForm — де викликати trackTyreSearch
grep -n "onSubmit\|handleSearch\|handleSubmit" frontend/src/components/QuickSearchForm.tsx | head -10
```

#### B. Аналіз залежностей
- [x] Чи потрібно додати 'use client' на сторінки для tracking компонентів?
- [x] TrackTyreView, TrackDealerSearch, TrackComparisonView — це client components?
- [x] Чи можна рендерити client tracking компонент у server page без wrapper?

**Нові типи:** -
**Нові API-функції:** -
**Нові компоненти:** Можливо DealerCard wrapper з tracking (якщо ще немає)

#### C. Перевірка дизайну
- [x] Tracking компоненти не рендерять UI — вони повертають null і лише відправляють events

**Ціль:** Зрозуміти API tracking компонентів та де саме їх підключити.

**Нотатки для перевикористання:** -

---

### 1.1 Підключити TrackTyreView на /shyny/[slug]
- [x] Імпортувати `TrackTyreView` з `@/components/AnalyticsEvents`
- [x] Додати `<TrackTyreView slug={tyre.slug} name={tyre.name} season={tyre.season} />` в JSX сторінки
- [x] Розмістити після основного контенту (перед закриттям return)

**Файли:** `frontend/src/app/shyny/[slug]/page.tsx`
**Нотатки:** TrackTyreView — client component що рендерить null. Безпечно вставляти в server page.

---

### 1.2 Підключити trackTyreSearch в QuickSearchForm
- [x] Імпортувати `analytics` з `@/lib/analytics`
- [x] В callback onSubmit/handleSearch додати виклик:
  ```tsx
  analytics.trackTyreSearch({
    width: selectedWidth,
    profile: selectedProfile,
    diameter: selectedDiameter,
    season: selectedSeason,
  });
  ```
- [x] Переконатися що виклик відбувається ПІСЛЯ успішного submit (не при помилках)

**Файли:** `frontend/src/components/QuickSearchForm.tsx`
**Нотатки:** QuickSearchForm вже є client component ('use client')

---

### 1.3 Підключити trackFormSubmit в ContactForm
- [x] Імпортувати `analytics` з `@/lib/analytics`
- [x] Після успішної відправки форми (після `setStatus('success')` або аналогічного) додати:
  ```tsx
  analytics.trackFormSubmit('contact');
  ```
- [x] Переконатися що tracking відбувається тільки при успішній відправці

**Файли:** `frontend/src/app/contacts/ContactForm.tsx`
**Нотатки:** ContactForm вже є client component

---

### 1.4 Підключити TrackDealerSearch на /dealers
- [x] Імпортувати `TrackDealerSearch` з `@/components/AnalyticsEvents`
- [x] Додати `<TrackDealerSearch />` (або з відповідними пропсами) в JSX сторінки дилерів
- [x] Розмістити в корпусі сторінки

**Файли:** `frontend/src/app/dealers/page.tsx`
**Нотатки:** Перевірити які пропси приймає TrackDealerSearch

---

### 1.5 Підключити trackDealerClick та trackPhoneClick в картках дилерів
- [x] Знайти компонент картки дилера (DealerCard або аналогічний)
- [x] Імпортувати `analytics` з `@/lib/analytics`
- [x] На клік по картці дилера додати:
  ```tsx
  analytics.trackDealerClick(dealer.name, dealer.city);
  ```
- [x] На клік по телефонному посиланню додати:
  ```tsx
  analytics.trackPhoneClick(dealer.name, dealer.phone);
  ```

**Файли:** Компонент картки дилера (знайти через grep `DealerCard\|dealer-card`), `frontend/src/app/dealers/page.tsx`
**Нотатки:** Перевірити сигнатури trackDealerClick та trackPhoneClick в analytics.ts

---

### 1.6 Підключити TrackComparisonView на /porivnyaty
- [x] Імпортувати `TrackComparisonView` з `@/components/AnalyticsEvents`
- [x] Додати `<TrackComparisonView />` (з відповідними пропсами) в JSX сторінки порівнянь
- [x] Розмістити в корпусі сторінки (на /porivnyaty/[slug] — сторінка порівняння деталей)

**Файли:** `frontend/src/app/porivnyaty/page.tsx`
**Нотатки:** Перевірити які пропси приймає TrackComparisonView та звідки брати дані

---

### 1.7 Тестування аналітичних подій
- [x] Відкрити DevTools → Console на /shyny/[будь-який-slug] — перевірити tyre_view event
- [x] Виконати пошук шин через QuickSearchForm — перевірити tyre_search event
- [x] Відправити контактну форму — перевірити form_submit event
- [x] Відкрити /dealers — перевірити dealer_search event
- [x] Відкрити /porivnyaty — перевірити comparison_view event
- [x] Перевірити що events логуються (analytics.ts має console.debug в dev mode)

**Файли:** -
**Нотатки:** GA4/Meta Pixel env-змінні можуть бути порожніми — events все одно повинні логуватися в dev console

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
   git commit -m "checklist(analytics-monitoring-fixes): phase-1 analytics events integration completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
