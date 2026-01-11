# Фаза 6: Сторінки каталогу

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Оновити сторінки категорій (passenger-tyres, suv-4x4-tyres, lcv-tyres) відповідно до нової системи дизайну.

## Задачі

### 6.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Переглянути `frontend/src/app/passenger-tyres/page.tsx`
- [ ] Переглянути `frontend/src/app/suv-4x4-tyres/page.tsx`
- [ ] Переглянути `frontend/src/app/lcv-tyres/page.tsx`
- [ ] Знайти спільні патерни між сторінками

**Команди для пошуку:**
```bash
# Сторінки каталогу
cat frontend/src/app/passenger-tyres/page.tsx
cat frontend/src/app/suv-4x4-tyres/page.tsx
ls frontend/src/app/lcv-tyres/
```

#### B. Аналіз залежностей
- [ ] Чи використовують ці сторінки спільні компоненти?
- [ ] Чи є CTA секції в кінці?
- [ ] Які grid layouts використовуються?

**Спільні компоненти:** -
**CTA секції:** -
**Grid layouts:** -

#### C. Перевірка дизайну
- [ ] Вивчити `plan/result_audit/03-recommendations.md` — section spacing

**Референс-документ:** `plan/result_audit/03-recommendations.md`

**Нотатки для перевикористання:** -

---

### 6.1 Оновлення passenger-tyres/page.tsx

- [ ] Відкрити `frontend/src/app/passenger-tyres/page.tsx`
- [ ] Замінити zinc на stone в hero секції
- [ ] Оновити section spacing (py-12 → section-spacing)
- [ ] Оновити grid gap значення
- [ ] Перевірити CTA секцію

**Файли:** `frontend/src/app/passenger-tyres/page.tsx`
**Нотатки:** -

---

### 6.2 Оновлення suv-4x4-tyres/page.tsx

- [ ] Відкрити `frontend/src/app/suv-4x4-tyres/page.tsx`
- [ ] Застосувати ті ж зміни що й для passenger-tyres
- [ ] Замінити zinc на stone
- [ ] Оновити spacing та grid

**Файли:** `frontend/src/app/suv-4x4-tyres/page.tsx`
**Нотатки:** -

---

### 6.3 Оновлення lcv-tyres/page.tsx

- [ ] Відкрити `frontend/src/app/lcv-tyres/page.tsx` (якщо існує)
- [ ] Застосувати ті ж зміни
- [ ] Якщо сторінка відсутня — пропустити

**Файли:** `frontend/src/app/lcv-tyres/page.tsx`
**Нотатки:** -

---

### 6.4 Оновлення Season Tabs компонента

- [ ] Знайти компонент season tabs (якщо окремий)
- [ ] Оновити стилі карток сезонів:
  - border-radius на 20px
  - теплі тіні
  - hover ефекти

**Файли:** відповідний компонент
**Нотатки:** -

---

### 6.5 Оновлення Featured Models секції

- [ ] Оновити заголовок секції (типографіка)
- [ ] Перевірити grid layout для TyreCard
- [ ] Оновити "Переглянути всі" кнопку

**Файли:** сторінки каталогу
**Нотатки:** -

---

### 6.6 Оновлення CTA секцій

- [ ] Оновити gradient CTA блоки:
  ```tsx
  className="rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-10 text-white shadow-2xl"
  ```
- [ ] Збільшити border-radius до 24px
- [ ] Додати теплу тінь

**Файли:** всі сторінки каталогу
**Нотатки:** -

---

### 6.7 Оновлення Breadcrumb

- [ ] Переглянути `frontend/src/components/ui/Breadcrumb.tsx`
- [ ] Оновити кольори (zinc → stone)
- [ ] Збільшити розмір тексту якщо потрібно

**Файли:** `frontend/src/components/ui/Breadcrumb.tsx`
**Нотатки:** -

---

### 6.8 Перевірка та тестування

- [ ] Запустити `npm run build`
- [ ] Перевірити всі 3 сторінки каталогу
- [ ] Перевірити responsive на mobile/tablet
- [ ] Перевірити dark mode

**Команди:**
```bash
cd frontend && npm run dev
# Відкрити:
# http://localhost:3010/passenger-tyres
# http://localhost:3010/suv-4x4-tyres
# http://localhost:3010/lcv-tyres
```

**Файли:** -
**Нотатки:** -

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
