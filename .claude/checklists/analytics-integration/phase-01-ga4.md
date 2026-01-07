# Фаза 1: Google Analytics 4

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Інтегрувати GA4 з базовим відстеженням та custom events.

## Задачі

### 1.1 Встановлення залежностей
- [ ] Встановити `@next/third-parties` або налаштувати вручну
- [ ] Додати env змінну `NEXT_PUBLIC_GA4_MEASUREMENT_ID`

**Файли:** `frontend/package.json`, `frontend/.env.local`

---

### 1.2 Базовий код GA4
- [ ] Додати gtag script в layout.tsx або _app.tsx
- [ ] Перевірити що pageviews відстежуються

**Файли:** `frontend/src/app/layout.tsx`

---

### 1.3 Custom events
- [ ] Створити утиліту `frontend/src/lib/analytics.ts`
- [ ] Event: `tyre_search` — при пошуку шин
- [ ] Event: `tyre_view` — при перегляді картки шини
- [ ] Event: `dealer_click` — при переході до дилера
- [ ] Event: `phone_click` — при кліку на телефон

**Файли:** `frontend/src/lib/analytics.ts`

---

### 1.4 Додати events до компонентів
- [ ] Пошук шин (tyre-search/page.tsx)
- [ ] Картка шини (shyny/[slug]/page.tsx)
- [ ] Сторінка дилерів (dealers/page.tsx)

**Файли:** Відповідні page.tsx файли

---

## При завершенні фази

1. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(analytics): phase-1 GA4 completed"
   ```
2. Онови PROGRESS.md
3. Відкрий phase-02-meta-pixel.md
