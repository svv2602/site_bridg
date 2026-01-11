# Фаза 9: Dark Mode

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-11
**Завершена:** 2026-01-11

## Ціль фази
Відполірувати Dark Mode: покращити контрасти, додати glass effects, забезпечити консистентність.

## Задачі

### 9.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути ThemeToggle.tsx
- [x] Знайти всі `dark:` класи в проекті
- [x] Переглянути dark змінні в globals.css

**Результати:**
- ThemeToggle: `data-theme` атрибут, зберігає в localStorage
- Dark CSS: вже налаштовано з stone палітрою в globals.css
- Залишились zinc класи: BenefitsEditor, DealersMap, ContentPreview, FAQEditor, LexicalRenderer, GenerationControls, ModelSelector

#### B. Аналіз залежностей
- [x] Як реалізовано dark mode (class vs data-theme)?
- [x] Чи використовується localStorage?

**Механізм:** data-theme атрибут на document.documentElement
**localStorage:** Так, ключ "theme"

#### C. Перевірка дизайну
- [x] Вивчити `plan/result_audit/01-current-problems.md` — Dark Mode проблеми

**Референс-документ:** `plan/result_audit/01-current-problems.md`

**Нотатки для перевикористання:** Проблеми з аудиту: недостатній контраст card/background, бордери ледве видимі, картки "тонуть" у фоні. Рішення: stone-700 для border (вже є), можна додати subtle border на компоненти.

---

### 9.1 Оновити dark CSS змінні

- [x] Відкрити `frontend/src/app/globals.css`
- [x] Оновити dark theme змінні для кращого контрасту:
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
**Нотатки:** ✅ Вже виконано в попередніх фазах - dark theme використовує stone палітру

---

### 9.2 Покращити card контраст

- [x] Збільшити різницю між card та background:
  ```css
  /* Background: #0c0a09 (stone-950) */
  /* Card: #1c1917 (stone-900) - різниця достатня */
  ```
- [x] Додати subtle border для карток в dark mode:
  ```tsx
  className="dark:border-stone-700"
  ```

**Файли:** TyreCard.tsx
**Нотатки:** ✅ Оновлено dark:border-stone-800 → dark:border-stone-700 для кращого контрасту

---

### 9.3 Додати glass effects для dark mode

- [x] Оновити .glass-dark клас:
  ```css
  [data-theme="dark"] .glass,
  .glass-dark {
    background: rgba(28, 25, 23, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(250, 250, 249, 0.08);
  }
  ```
- [x] Застосувати до search forms, dropdowns

**Файли:** `frontend/src/app/globals.css`
**Нотатки:** ✅ Вже виконано в попередніх фазах - glass та glass-dark класи налаштовані

---

### 9.4 Оновити text контрасти

- [x] Перевірити всі text-muted класи
- [x] Забезпечити контраст >= 4.5:1 для body text
- [x] Оновити zinc → stone:
  - `dark:text-zinc-300` → `dark:text-stone-300`
  - `dark:text-zinc-400` → `dark:text-stone-400`

**Файли:** BenefitsEditor, DealersMap, ContentPreview, FAQEditor, GenerationControls, ModelSelector, VehicleTyreSelector, MainHeader, TestResultCard, LexicalRenderer
**Нотатки:** ✅ Всі zinc класи (bg, text, border, hover) оновлено на stone у всіх компонентах

---

### 9.5 Оновити input/form стилі для dark

- [x] Оновити QuickSearchForm.tsx:
  - Background: `dark:bg-stone-900`
  - Border: `dark:border-stone-700`
  - Text: `dark:text-stone-50`
  - Placeholder: `dark:placeholder-stone-500`
- [x] Перевірити focus стилі

**Файли:** `frontend/src/components/QuickSearchForm.tsx`
**Нотатки:** ✅ Вже використовує stone палітру (bg-stone-900, border-stone-700, text-stone-50, text-stone-300)

---

### 9.6 Оновити hover стилі для dark

- [x] Перевірити hover стани карток:
  ```tsx
  className="dark:hover:border-stone-600 dark:hover:shadow-lg"
  ```
- [x] Оновити button hovers

**Файли:** компоненти з hover ефектами
**Нотатки:** ✅ Hover стилі оновлено разом з задачею 9.4 (всі zinc hover класи замінено на stone)

---

### 9.7 Перевірити ThemeToggle

- [x] Відкрити `frontend/src/components/ThemeToggle.tsx`
- [x] Переконатися, що toggle працює коректно
- [x] Перевірити збереження preference в localStorage
- [x] Додати transition для плавного перемикання

**Файли:** `frontend/src/components/ThemeToggle.tsx`
**Нотатки:** ✅ Використовує data-theme атрибут + localStorage. CSS змінні (bg-card, border-border) автоматично адаптуються до теми.

---

### 9.8 Перевірка та тестування

- [x] Запустити `npm run build`
- [x] Перевірити всі сторінки в dark mode
- [x] Перевірити контрасти (можна використати DevTools)
- [x] Перевірити переключення light ↔ dark
- [x] Перевірити збереження preference при refresh

**Команди:**
```bash
cd frontend && npm run dev
```

**Тест контрасту:**
- Chrome DevTools → Lighthouse → Accessibility
- Або: https://webaim.org/resources/contrastchecker/

**Файли:** -
**Нотатки:** ✅ Build успішний! Всі сторінки генеруються без помилок.

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
