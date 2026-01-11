# Фаза 7: Картки товарів

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Оновити TyreCard компонент та пов'язані елементи відповідно до нової системи дизайну.

## Задачі

### 7.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Переглянути `frontend/src/components/TyreCard.tsx`
- [ ] Переглянути `frontend/src/components/ui/EuLabelBadge.tsx`
- [ ] Переглянути `frontend/src/components/ui/TechnologyIcon.tsx`
- [ ] Знайти всі місця використання TyreCard

**Команди для пошуку:**
```bash
# TyreCard
cat frontend/src/components/TyreCard.tsx
# Використання
grep -r "TyreCard" frontend/src/
# EuLabel
cat frontend/src/components/ui/EuLabelBadge.tsx
```

#### B. Аналіз залежностей
- [ ] Які props приймає TyreCard?
- [ ] Які variants є (compact, featured)?
- [ ] Де показуються EU Labels?

**Props TyreCard:** -
**Variants:** -
**EU Labels location:** -

#### C. Перевірка дизайну
- [ ] Вивчити `plan/result_audit/01-current-problems.md` — TyreCard проблеми

**Референс-документ:** `plan/result_audit/01-current-problems.md`

**Нотатки для перевикористання:** -

---

### 7.1 Оновлення TyreCard — базові стилі

- [ ] Відкрити `frontend/src/components/TyreCard.tsx`
- [ ] Оновити border-radius:
  - Картка: `rounded-2xl` → `rounded-xl` (20px)
- [ ] Оновити border та shadow:
  ```tsx
  className="border border-stone-200 dark:border-stone-800
             shadow-sm hover:shadow-lg transition-all duration-300"
  ```
- [ ] Замінити всі zinc на stone

**Файли:** `frontend/src/components/TyreCard.tsx`
**Нотатки:** -

---

### 7.2 Оновлення TyreCard — hover ефекти

- [ ] Додати translateY на hover:
  ```tsx
  className="hover:-translate-y-1 hover:shadow-lg"
  ```
- [ ] Зменшити scale ефект для image:
  - `group-hover:scale-110` → `group-hover:scale-105`
- [ ] Оновити title hover color

**Файли:** `frontend/src/components/TyreCard.tsx`
**Нотатки:** -

---

### 7.3 Оновлення TyreCard — image section

- [ ] Оновити gradient фону image placeholder:
  ```tsx
  className="bg-gradient-to-br from-stone-50 to-stone-100
             dark:from-stone-900 dark:to-stone-800"
  ```
- [ ] Оновити overlay gradient

**Файли:** `frontend/src/components/TyreCard.tsx`
**Нотатки:** -

---

### 7.4 Оновлення сезонних badges

- [ ] Оновити стилі сезонних badges в TyreCard:
  - Збільшити padding до `px-3 py-1.5`
  - Збільшити border-radius до `rounded-lg` (12px)
  - Змінити на gradient backgrounds
- [ ] Використати нові класи `.badge-summer`, `.badge-winter`, `.badge-allseason`

**Файли:** `frontend/src/components/TyreCard.tsx`
**Нотатки:** -

---

### 7.5 Оновлення test/award badges

- [ ] Оновити стилі для test badges:
  - Winner: gradient gold
  - Recommended: gradient green
  - Top3: gradient blue
- [ ] Збільшити border-radius

**Файли:** `frontend/src/components/TyreCard.tsx`
**Нотатки:** -

---

### 7.6 Оновлення EuLabelBadge

- [ ] Відкрити `frontend/src/components/ui/EuLabelBadge.tsx`
- [ ] Збільшити мінімальний розмір тексту:
  - sm: `text-xs` (12px мінімум)
  - md: `text-sm` (14px)
  - lg: `text-base` (16px)
- [ ] Оновити border-radius на `rounded-lg`
- [ ] Покращити кольорові класи для A-E рейтингів

**Файли:** `frontend/src/components/ui/EuLabelBadge.tsx`
**Нотатки:** -

---

### 7.7 Оновлення content section

- [ ] Оновити типографіку заголовка:
  ```tsx
  className="text-lg font-semibold text-stone-900 dark:text-stone-50
             group-hover:text-primary transition-colors"
  ```
- [ ] Оновити description стилі
- [ ] Оновити sizes preview стилі

**Файли:** `frontend/src/components/TyreCard.tsx`
**Нотатки:** -

---

### 7.8 Оновлення technologies section

- [ ] Переглянути `frontend/src/components/ui/TechnologyIcon.tsx`
- [ ] Оновити розміри іконок якщо потрібно
- [ ] Оновити tooltip стилі (якщо є)

**Файли:** `frontend/src/components/ui/TechnologyIcon.tsx`
**Нотатки:** -

---

### 7.9 Перевірка та тестування

- [ ] Запустити `npm run build`
- [ ] Перевірити TyreCard на головній сторінці
- [ ] Перевірити TyreCard на сторінках каталогу
- [ ] Перевірити всі variants (default, compact, featured)
- [ ] Перевірити dark mode

**Команди:**
```bash
cd frontend && npm run dev
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
   git commit -m "checklist(ui-ux-redesign): phase-7 product-cards completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 8
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
