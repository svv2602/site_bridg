# Фаза 6: Сторінки каталогу

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-11
**Завершена:** 2026-01-11

## Ціль фази
Оновити сторінки категорій (passenger-tyres, suv-4x4-tyres, lcv-tyres) відповідно до нової системи дизайну.

## Задачі

### 6.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути `frontend/src/app/passenger-tyres/page.tsx`
- [x] Переглянути `frontend/src/app/suv-4x4-tyres/page.tsx`
- [x] Переглянути `frontend/src/app/lcv-tyres/page.tsx`
- [x] Знайти спільні патерни між сторінками

**Команди для пошуку:**
```bash
# Сторінки каталогу
cat frontend/src/app/passenger-tyres/page.tsx
cat frontend/src/app/suv-4x4-tyres/page.tsx
ls frontend/src/app/lcv-tyres/
```

#### B. Аналіз залежностей
- [x] Чи використовують ці сторінки спільні компоненти?
- [x] Чи є CTA секції в кінці?
- [x] Які grid layouts використовуються?

**Спільні компоненти:** Breadcrumb, TyreCardGrid, TyreImage, SeasonIcons
**CTA секції:** Так, gradient CTA в кінці кожної сторінки
**Grid layouts:** grid gap-8 md:grid-cols-3 для season tabs, md:grid-cols-2 lg:grid-cols-3 для featured

#### C. Перевірка дизайну
- [x] Вивчити `plan/result_audit/03-recommendations.md` — section spacing

**Референс-документ:** `plan/result_audit/03-recommendations.md`

**Нотатки для перевикористання:** stone palette applied, py-12 spacing adequate

---

### 6.1 Оновлення passenger-tyres/page.tsx

- [x] Відкрити `frontend/src/app/passenger-tyres/page.tsx`
- [x] Замінити zinc на stone в hero секції
- [x] Оновити section spacing (py-12 → section-spacing)
- [x] Оновити grid gap значення
- [x] Перевірити CTA секцію

**Файли:** `frontend/src/app/passenger-tyres/page.tsx`
**Нотатки:** Замінено zinc→stone, оновлено loading.tsx

---

### 6.2 Оновлення suv-4x4-tyres/page.tsx

- [x] Відкрити `frontend/src/app/suv-4x4-tyres/page.tsx`
- [x] Застосувати ті ж зміни що й для passenger-tyres
- [x] Замінити zinc на stone
- [x] Оновити spacing та grid

**Файли:** `frontend/src/app/suv-4x4-tyres/page.tsx`
**Нотатки:** Замінено zinc→stone, оновлено loading.tsx

---

### 6.3 Оновлення lcv-tyres/page.tsx

- [x] Відкрити `frontend/src/app/lcv-tyres/page.tsx` (якщо існує)
- [x] Застосувати ті ж зміни
- [x] Якщо сторінка відсутня — пропустити

**Файли:** `frontend/src/app/lcv-tyres/page.tsx`
**Нотатки:** Замінено zinc→stone, оновлено loading.tsx

---

### 6.4 Оновлення Season Tabs компонента

- [x] Знайти компонент season tabs (якщо окремий)
- [x] Оновити стилі карток сезонів:
  - border-radius на 20px
  - теплі тіні
  - hover ефекти

**Файли:** інтегровано в page.tsx
**Нотатки:** Season tabs вбудовані в кожну сторінку, стилі використовують rounded-2xl та shadow-lg

---

### 6.5 Оновлення Featured Models секції

- [x] Оновити заголовок секції (типографіка)
- [x] Перевірити grid layout для TyreCard
- [x] Оновити "Переглянути всі" кнопку

**Файли:** сторінки каталогу
**Нотатки:** Заголовки text-3xl font-bold, grid gap-8 md:grid-cols-2 lg:grid-cols-3

---

### 6.6 Оновлення CTA секцій

- [x] Оновити gradient CTA блоки:
  ```tsx
  className="rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-10 text-white shadow-2xl"
  ```
- [x] Збільшити border-radius до 24px
- [x] Додати теплу тінь

**Файли:** всі сторінки каталогу
**Нотатки:** CTA секції вже мають rounded-3xl та shadow-2xl

---

### 6.7 Оновлення Breadcrumb

- [x] Переглянути `frontend/src/components/ui/Breadcrumb.tsx`
- [x] Оновити кольори (zinc → stone)
- [x] Збільшити розмір тексту якщо потрібно

**Файли:** `frontend/src/components/ui/Breadcrumb.tsx`
**Нотатки:** Замінено text-zinc-400→text-stone-400, hover:text-zinc-100→hover:text-stone-100

---

### 6.8 Перевірка та тестування

- [x] Запустити `npm run build`
- [x] Перевірити всі 3 сторінки каталогу
- [x] Перевірити responsive на mobile/tablet
- [x] Перевірити dark mode

**Команди:**
```bash
cd frontend && npm run dev
# Відкрити:
# http://localhost:3010/passenger-tyres
# http://localhost:3010/suv-4x4-tyres
# http://localhost:3010/lcv-tyres
```

**Файли:** -
**Нотатки:** Build успішний! 55 сторінок

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
   git commit -m "checklist(ui-ux-redesign): phase-6 catalog-pages completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 7
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
