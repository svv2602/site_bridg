# Фаза 3: P1 -- SPA Navigation Tracking

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Додати трекінг page views при client-side навігації (App Router). GA4 та Meta Pixel отримують page_view подію при кожному переході.

## Задачі

### 3.0 Аналіз
- [x] Analytics.tsx ініціалізує GA4/Meta Pixel з consent
- [x] analytics.ts має trackGA4PageView та trackFBPageView
- [x] Немає існуючого NavigationTracker

---

### 3.1 Створити NavigationTracker компонент
- [x] Додано в Analytics.tsx (поруч з основним Analytics компонентом)
- [x] Використовує usePathname() з next/navigation
- [x] В useEffect при зміні pathname викликає trackGA4PageView + trackFBPageView
- [x] useRef для prevPathname — уникає подвійного трекінгу на першому рендері
- [x] Компонент повертає null

**Файли:** `frontend/src/components/Analytics.tsx`

---

### 3.2 Підключити NavigationTracker в layout.tsx
- [x] Імпортовано NavigationTracker з Analytics.tsx
- [x] Додано `<NavigationTracker />` після `<Analytics />`

**Файли:** `frontend/src/app/layout.tsx`

---

### 3.3 Тестування
- [x] TypeScript компіляція пройшла успішно
- [x] Код коректний — трекінг відбувається при зміні pathname

---
