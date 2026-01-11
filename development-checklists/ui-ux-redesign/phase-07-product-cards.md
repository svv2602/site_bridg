# Фаза 7: Картки товарів

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-11
**Завершена:** 2026-01-11

## Ціль фази
Оновити TyreCard компонент та пов'язані елементи відповідно до нової системи дизайну.

## Задачі

### 7.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути `frontend/src/components/TyreCard.tsx`
- [x] Переглянути `frontend/src/components/ui/EuLabelBadge.tsx`
- [x] Переглянути `frontend/src/components/ui/TechnologyIcon.tsx`
- [x] Знайти всі місця використання TyreCard

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
- [x] Які props приймає TyreCard?
- [x] Які variants є (compact, featured)?
- [x] Де показуються EU Labels?

**Props TyreCard:** tyre: TyreModel, variant: default/compact/featured
**Variants:** default (h-72), compact (h-56), featured (h-80)
**EU Labels location:** в TyreCard content section

#### C. Перевірка дизайну
- [x] Вивчити `plan/result_audit/01-current-problems.md` — TyreCard проблеми

**Референс-документ:** `plan/result_audit/01-current-problems.md`

**Нотатки для перевикористання:** stone palette, hover:-translate-y-1, scale-105

---

### 7.1 Оновлення TyreCard — базові стилі

- [x] Відкрити `frontend/src/components/TyreCard.tsx`
- [x] Оновити border-radius:
  - Картка: `rounded-2xl` → `rounded-xl` (20px)
- [x] Оновити border та shadow:
  ```tsx
  className="border border-stone-200 dark:border-stone-800
             shadow-sm hover:shadow-lg transition-all duration-300"
  ```
- [x] Замінити всі zinc на stone

**Файли:** `frontend/src/components/TyreCard.tsx`
**Нотатки:** Оновлено rounded-xl, stone borders, shadow-sm/lg

---

### 7.2 Оновлення TyreCard — hover ефекти

- [x] Додати translateY на hover:
  ```tsx
  className="hover:-translate-y-1 hover:shadow-lg"
  ```
- [x] Зменшити scale ефект для image:
  - `group-hover:scale-110` → `group-hover:scale-105`
- [x] Оновити title hover color

**Файли:** `frontend/src/components/TyreCard.tsx`
**Нотатки:** hover:-translate-y-1, scale-105, group-hover:text-primary

---

### 7.3 Оновлення TyreCard — image section

- [x] Оновити gradient фону image placeholder:
  ```tsx
  className="bg-gradient-to-br from-stone-50 to-stone-100
             dark:from-stone-900 dark:to-stone-800"
  ```
- [x] Оновити overlay gradient

**Файли:** `frontend/src/components/TyreCard.tsx`
**Нотатки:** Замінено zinc→stone для градієнтів

---

### 7.4 Оновлення сезонних badges

- [x] Оновити стилі сезонних badges в TyreCard:
  - Збільшити padding до `px-3 py-1.5`
  - Збільшити border-radius до `rounded-lg` (12px)
  - Змінити на gradient backgrounds
- [x] Використати нові класи `.badge-summer`, `.badge-winter`, `.badge-allseason`

**Файли:** `frontend/src/components/TyreCard.tsx`
**Нотатки:** Підключено badge-summer/winter/allseason з градієнтами

---

### 7.5 Оновлення test/award badges

- [x] Оновити стилі для test badges:
  - Winner: gradient gold
  - Recommended: gradient green
  - Top3: gradient blue
- [x] Збільшити border-radius

**Файли:** `frontend/src/components/TyreCard.tsx`
**Нотатки:** Використовує Badge компонент (оновлено в Phase 3)

---

### 7.6 Оновлення EuLabelBadge

- [x] Відкрити `frontend/src/components/ui/EuLabelBadge.tsx`
- [x] Збільшити мінімальний розмір тексту:
  - sm: `text-xs` (12px мінімум)
  - md: `text-sm` (14px)
  - lg: `text-base` (16px)
- [x] Оновити border-radius на `rounded-lg`
- [x] Покращити кольорові класи для A-E рейтингів

**Файли:** `frontend/src/components/ui/EuLabelBadge.tsx`
**Нотатки:** Оновлено в Phase 3 — rounded-lg, text-xs мін

---

### 7.7 Оновлення content section

- [x] Оновити типографіку заголовка:
  ```tsx
  className="text-lg font-semibold text-stone-900 dark:text-stone-50
             group-hover:text-primary transition-colors"
  ```
- [x] Оновити description стилі
- [x] Оновити sizes preview стилі

**Файли:** `frontend/src/components/TyreCard.tsx`
**Нотатки:** Заголовок text-lg font-bold, description text-sm text-muted-foreground

---

### 7.8 Оновлення technologies section

- [x] Переглянути `frontend/src/components/ui/TechnologyIcon.tsx`
- [x] Оновити розміри іконок якщо потрібно
- [x] Оновити tooltip стилі (якщо є)

**Файли:** `frontend/src/components/ui/TechnologyIcon.tsx`
**Нотатки:** Замінено zinc→stone, text-xs для +N badge

---

### 7.9 Перевірка та тестування

- [x] Запустити `npm run build`
- [x] Перевірити TyreCard на головній сторінці
- [x] Перевірити TyreCard на сторінках каталогу
- [x] Перевірити всі variants (default, compact, featured)
- [x] Перевірити dark mode

**Команди:**
```bash
cd frontend && npm run dev
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
   git commit -m "checklist(ui-ux-redesign): phase-7 product-cards completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 8
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
