# Фаза 3: Базові компоненти

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-11
**Завершена:** 2026-01-11

## Ціль фази
Оновити базові UI компоненти: кнопки, inputs, badges відповідно до нової системи дизайну.

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти всі кнопки в проекті
- [x] Знайти всі inputs та selects
- [x] Переглянути `frontend/src/components/ui/Badge.tsx`
- [x] Переглянути `frontend/src/components/ui/EuLabelBadge.tsx`

**Команди для пошуку:**
```bash
# Кнопки
grep -r "bg-primary\|rounded-full.*px-" frontend/src/
# Inputs
grep -r "rounded-xl\|border-zinc" frontend/src/components/
# UI компоненти
ls frontend/src/components/ui/
```

#### B. Аналіз залежностей
- [x] Які компоненти використовують кнопки?
- [x] Які форми використовують inputs?

**Компоненти з кнопками:** 32 файли
**Форми з inputs:** 4 файли (QuickSearchForm, VehicleTyreSelector, FuelCalculator, LoadingSkeleton)

#### C. Перевірка дизайну
- [x] Вивчити `plan/result_audit/03-recommendations.md` — Button стилі
- [x] Вивчити `plan/result_audit/03-recommendations.md` — Input стилі

**Референс-документ:** `plan/result_audit/03-recommendations.md`

**Нотатки для перевикористання:** Створено CSS утиліти .btn-primary, .btn-secondary, .btn-ghost, .input, .select замість заміни всіх класів

---

### 3.1 Оновлення Primary Button стилів

- [x] Оновити globals.css з новими button стилями:
  ```css
  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--primary);
    color: white;
    padding: 0.875rem 2rem;
    border-radius: 9999px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.2s ease-out;
  }

  .btn-primary:hover {
    background: var(--primary-dark);
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(28, 25, 23, 0.1);
  }

  .btn-primary:active {
    transform: scale(0.98);
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Додано .btn-primary з hover та active станами

---

### 3.2 Оновлення Secondary Button стилів

- [x] Додати secondary button:
  ```css
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: transparent;
    color: var(--foreground);
    padding: 0.875rem 2rem;
    border: 2px solid var(--border);
    border-radius: 9999px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.2s ease-out;
  }

  .btn-secondary:hover {
    background: var(--card);
    border-color: var(--muted);
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Додано .btn-secondary з border та hover

---

### 3.3 Оновлення Ghost Button стилів

- [x] Додати ghost button:
  ```css
  .btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: transparent;
    color: var(--primary);
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    font-weight: 500;
    font-size: 0.875rem;
    transition: all 0.2s ease-out;
  }

  .btn-ghost:hover {
    background: rgba(227, 6, 19, 0.1);
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Додано .btn-ghost з напівпрозорим hover

---

### 3.4 Оновлення Input стилів

- [x] Додати/оновити input стилі:
  ```css
  .input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 2px solid var(--border);
    border-radius: 12px;
    font-size: 1rem;
    background: var(--card);
    color: var(--foreground);
    transition: all 0.2s ease;
  }

  .input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(227, 6, 19, 0.1);
  }

  .input::placeholder {
    color: var(--muted);
  }

  /* Dark mode input */
  [data-theme="dark"] .input {
    background: var(--card);
    border-color: var(--border);
    color: var(--foreground);
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Додано .input з focus станом та dark mode підтримкою

---

### 3.5 Оновлення Select стилів

- [x] Додати select стилі:
  ```css
  .select {
    appearance: none;
    width: 100%;
    padding: 0.875rem 2.5rem 0.875rem 1rem;
    border: 2px solid var(--border);
    border-radius: 12px;
    font-size: 1rem;
    background-color: var(--card);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2378716c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-position: right 0.75rem center;
    background-repeat: no-repeat;
    background-size: 1.25rem;
    color: var(--foreground);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(227, 6, 19, 0.1);
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Додано .select з SVG стрілкою та focus станом

---

### 3.6 Оновлення Badge.tsx

- [x] Відкрити `frontend/src/components/ui/Badge.tsx`
- [x] Оновити базові стилі:
  - border-radius з `rounded-md` на `rounded-lg` (12px)
  - padding з `px-2 py-1` на `px-3 py-1.5`
  - font-size мінімум `text-sm` (14px)

**Файли:** `frontend/src/components/ui/Badge.tsx`
**Нотатки:** Оновлено: zinc → stone, збільшено padding та font-size

---

### 3.7 Оновлення EuLabelBadge.tsx

- [x] Відкрити `frontend/src/components/ui/EuLabelBadge.tsx`
- [x] Збільшити мінімальний розмір:
  - `sm` variant: `px-2 py-1 text-xs` (мінімум 12px)
  - `md` variant: `px-2.5 py-1.5 text-sm`
  - `lg` variant: `px-3 py-2 text-base`
- [x] Оновити border-radius на `rounded-lg`

**Файли:** `frontend/src/components/ui/EuLabelBadge.tsx`
**Нотатки:** Оновлено: zinc → stone, text-[10px] → text-xs, rounded-md → rounded-lg

---

### 3.8 Оновлення сезонних badge стилів

- [x] Додати/оновити сезонні badge в globals.css:
  ```css
  .badge-summer {
    background: linear-gradient(135deg, #fb923c, #ea580c);
    color: white;
    padding: 0.375rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .badge-winter {
    background: linear-gradient(135deg, #38bdf8, #0284c7);
    color: white;
    padding: 0.375rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .badge-allseason {
    background: linear-gradient(135deg, #34d399, #059669);
    color: white;
    padding: 0.375rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** Додано .badge-summer, .badge-winter, .badge-allseason з градієнтами

---

### 3.9 Перевірка та тестування

- [x] Запустити `npm run build`
- [x] Візуально перевірити кнопки на різних сторінках
- [x] Перевірити inputs в QuickSearchForm
- [x] Перевірити badges на TyreCard

**Команди:**
```bash
cd frontend && npm run build && npm run dev
```

**Файли:** -
**Нотатки:** Build успішний! 55 сторінок згенеровано без помилок

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
   git commit -m "checklist(ui-ux-redesign): phase-3 base-components completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 4
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
