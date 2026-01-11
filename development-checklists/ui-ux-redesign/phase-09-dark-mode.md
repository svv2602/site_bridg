# Фаза 9: Dark Mode

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Відполірувати Dark Mode: покращити контрасти, додати glass effects, забезпечити консистентність.

## Задачі

### 9.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Переглянути ThemeToggle.tsx
- [ ] Знайти всі `dark:` класи в проекті
- [ ] Переглянути dark змінні в globals.css

**Команди для пошуку:**
```bash
# ThemeToggle
cat frontend/src/components/ThemeToggle.tsx
# Dark classes
grep -r "dark:" frontend/src/components/ | head -30
# Dark variables
grep -A20 "data-theme=\"dark\"" frontend/src/app/globals.css
```

#### B. Аналіз залежностей
- [ ] Як реалізовано dark mode (class vs data-theme)?
- [ ] Чи використовується localStorage?

**Механізм:** -
**localStorage:** -

#### C. Перевірка дизайну
- [ ] Вивчити `plan/result_audit/01-current-problems.md` — Dark Mode проблеми

**Референс-документ:** `plan/result_audit/01-current-problems.md`

**Нотатки для перевикористання:** -

---

### 9.1 Оновити dark CSS змінні

- [ ] Відкрити `frontend/src/app/globals.css`
- [ ] Оновити dark theme змінні для кращого контрасту:
  ```css
  [data-theme="dark"] {
    --background: #0c0a09;      /* stone-950 */
    --foreground: #fafaf9;      /* stone-50 */
    --card: #1c1917;            /* stone-900 - трохи світліше */
    --card-foreground: #fafaf9;
    --border: #44403c;          /* stone-700 - видиміший */
    --muted: #a8a29e;           /* stone-400 */
    --muted-foreground: #d6d3d1; /* stone-300 */
  }
  ```

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** -

---

### 9.2 Покращити card контраст

- [ ] Збільшити різницю між card та background:
  ```css
  /* Background: #0c0a09 (stone-950) */
  /* Card: #1c1917 (stone-900) - різниця достатня */
  ```
- [ ] Додати subtle border для карток в dark mode:
  ```tsx
  className="dark:border-stone-700"
  ```

**Файли:** компоненти з картками
**Нотатки:** -

---

### 9.3 Додати glass effects для dark mode

- [ ] Оновити .glass-dark клас:
  ```css
  [data-theme="dark"] .glass,
  .glass-dark {
    background: rgba(28, 25, 23, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(250, 250, 249, 0.08);
  }
  ```
- [ ] Застосувати до search forms, dropdowns

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** -

---

### 9.4 Оновити text контрасти

- [ ] Перевірити всі text-muted класи
- [ ] Забезпечити контраст >= 4.5:1 для body text
- [ ] Оновити zinc → stone:
  - `dark:text-zinc-300` → `dark:text-stone-300`
  - `dark:text-zinc-400` → `dark:text-stone-400`

**Файли:** всі компоненти з dark: класами
**Нотатки:** -

---

### 9.5 Оновити input/form стилі для dark

- [ ] Оновити QuickSearchForm.tsx:
  - Background: `dark:bg-stone-900`
  - Border: `dark:border-stone-700`
  - Text: `dark:text-stone-50`
  - Placeholder: `dark:placeholder-stone-500`
- [ ] Перевірити focus стилі

**Файли:** `frontend/src/components/QuickSearchForm.tsx`
**Нотатки:** -

---

### 9.6 Оновити hover стилі для dark

- [ ] Перевірити hover стани карток:
  ```tsx
  className="dark:hover:border-stone-600 dark:hover:shadow-lg"
  ```
- [ ] Оновити button hovers

**Файли:** компоненти з hover ефектами
**Нотатки:** -

---

### 9.7 Перевірити ThemeToggle

- [ ] Відкрити `frontend/src/components/ThemeToggle.tsx`
- [ ] Переконатися, що toggle працює коректно
- [ ] Перевірити збереження preference в localStorage
- [ ] Додати transition для плавного перемикання

**Файли:** `frontend/src/components/ThemeToggle.tsx`
**Нотатки:** -

---

### 9.8 Перевірка та тестування

- [ ] Запустити `npm run build`
- [ ] Перевірити всі сторінки в dark mode
- [ ] Перевірити контрасти (можна використати DevTools)
- [ ] Перевірити переключення light ↔ dark
- [ ] Перевірити збереження preference при refresh

**Команди:**
```bash
cd frontend && npm run dev
```

**Тест контрасту:**
- Chrome DevTools → Lighthouse → Accessibility
- Або: https://webaim.org/resources/contrastchecker/

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
   git commit -m "checklist(ui-ux-redesign): phase-9 dark-mode completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 10
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
