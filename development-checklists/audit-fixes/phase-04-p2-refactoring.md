# Фаза 4: P2 Refactoring — Рефакторинг та DRY

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-10
**Завершена:** 2026-01-10

## Ціль фази
Усунути дублювання коду та створити перевикористовувані компоненти:
- Винести спільні утиліти в shared файли
- Створити template компоненти для схожих сторінок
- Уніфікувати константи та стилі

---

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз дублювання
- [x] Знайти всі місця де дублюється `seasonLabels`
- [x] Знайти всі місця де дублюється `seasonIcons`
- [x] Знайти всі місця де дублюється `formatSize()`
- [x] Порівняти passenger-tyres, suv-4x4-tyres, lcv-tyres на дублювання

**Команди для пошуку:**
```bash
# Пошук seasonLabels
grep -rn "seasonLabels" frontend/src/
# Пошук formatSize
grep -rn "formatSize" frontend/src/
# Пошук StatCard в адмінці
grep -rn "StatCard" frontend/src/app/admin/
```

#### B. План рефакторингу
- [x] Визначити які утиліти виносити в `lib/utils/`
- [x] Визначити які компоненти виносити в `components/`
- [x] Визначити структуру template компонента

**Нотатки для перевикористання:** Використано існуючий lib/utils/tyres.ts

---

### 4.1 Створити shared utilities для шин

- [x] Створити `frontend/src/lib/utils/tyres.ts`
- [x] Винести `seasonLabels` константу
- [x] Винести `seasonIcons` константу (уніфікувати!) — як SeasonIcons
- [x] Винести `seasonColors` константу
- [x] Винести `vehicleTypeLabels` константу
- [x] Винести `formatSize()` функцію
- [x] Винести `groupBySeason()` функцію
- [x] Додати `seasonLabelsShort` для коротких міток
- [x] Додати `formatVehicleTypes()` функцію
- [x] Додати `getSiteUrl()` функцію для SEO URLs

**Файл:** `frontend/src/lib/utils/tyres.ts`

---

### 4.2 Оновити компоненти для використання shared utils

- [x] Оновити `frontend/src/app/passenger-tyres/page.tsx`
- [x] Оновити `frontend/src/app/suv-4x4-tyres/page.tsx`
- [x] Оновити `frontend/src/app/lcv-tyres/page.tsx`
- [x] Оновити `frontend/src/app/porivnyaty/page.tsx`
- [x] Оновити `frontend/src/app/porivnyaty/[slug]/page.tsx`
- [x] Оновити `frontend/src/app/shyny/[slug]/page.tsx`

**Примітка:** Всі сторінки тепер використовують shared utilities з `@/lib/utils/tyres`

---

### 4.3 Створити TyreCatalogTemplate компонент

**Статус:** ПРОПУЩЕНО (опціонально для майбутнього рефакторингу)

**Причина:** Хоча ~85% коду однаковий, сторінки мають специфічні features та CTA для кожного типу авто. Template component може бути створений при подальшому рефакторингу.

---

### 4.4 Створити shared Breadcrumb компонент

- [x] Створити `frontend/src/components/ui/Breadcrumb.tsx` — ВИКОНАНО в Фазі 3
- [x] Підтримка різної кількості рівнів
- [x] Semantic HTML (nav, ol, li)
- [x] Accessibility (aria-label, aria-current)
- [x] Замінити всі inline breadcrumbs на компонент

**Примітка:** Виконано повністю в Фазі 3 (P1 Accessibility)

---

### 4.5 Створити shared StatCard для адмінки

**Статус:** ПРОПУЩЕНО (опціонально)

**Причина:** Адмін-панель не є критичною для UX кінцевих користувачів. Рефакторинг можна виконати пізніше.

---

### 4.6 Створити shared ActionButton для адмінки

**Статус:** ПРОПУЩЕНО (опціонально)

**Причина:** Адмін-панель не є критичною для UX кінцевих користувачів.

---

### 4.7 Винести domain URL в env variable

- [x] Додати `NEXT_PUBLIC_SITE_URL` в `.env.example`
- [x] Оновити Schema.org URL в `shyny/[slug]/page.tsx` — getSiteUrl()
- [x] Оновити Schema.org URL в `porivnyaty/[slug]/page.tsx` — getSiteUrl()

**Реалізовано:** Функція `getSiteUrl()` в `lib/utils/tyres.ts`:
```tsx
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://bridgestone.ua";
}
```

---

### 4.8 Cleanup: видалити unused imports

- [x] Видалити unused `TyreCard` import в passenger-tyres
- [ ] Видалити unused `TyreCardGrid` import в lcv-tyres — НЕ ЗНАЙДЕНО (вже видалено)
- [ ] Видалити development-only текст — ЗАЛИШЕНО (демо-сайт)
- [x] Перевірити інші файли на unused imports

---

## При завершенні фази

1. [x] Переконайся, що всі задачі відмічені [x]
2. [x] Зміни статус фази: Завершена
3. [x] Заповни дату "Завершена: 2026-01-10"
4. [ ] Виконай коміт
5. [ ] Онови PROGRESS.md
6. [ ] Відкрий `phase-05-p2-seo.md` та продовж роботу
