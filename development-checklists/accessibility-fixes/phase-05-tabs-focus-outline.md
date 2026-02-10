# Фаза 5: P3 — SizesByDiameter tabs та Focus Outline

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Привести SizesByDiameter tabs до повного WAI-ARIA Tabs Pattern (tabIndex управління, ArrowLeft/ArrowRight навігація), збільшити focus outline з 1px до 2px та покращити контрастність кольору outline для кращої видимості.

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити `frontend/src/components/SizesByDiameter.tsx`:
  - Які ARIA-атрибути вже є (role="tablist", role="tab", aria-selected)?
  - Як працює перемикання табів?
  - Чи є tabIndex на кнопках?
  - Чи є onKeyDown обробник?
- [ ] Вивчити `frontend/src/components/QuickSearchForm.tsx` як ЗРАЗОК:
  - Як реалізовано tabIndex={0/-1}?
  - Як реалізовано ArrowLeft/ArrowRight?
  - Як реалізовано aria-controls та role="tabpanel"?
- [ ] Вивчити `frontend/src/app/globals.css` — поточний :focus-visible стиль
  - Який колір outline (var(--silver-accent))?
  - Яка товщина (1px)?

**Команди для пошуку:**
```bash
# SizesByDiameter
grep -n "aria-\|role=\|tabIndex\|onKeyDown\|tab\|selected" frontend/src/components/SizesByDiameter.tsx
# QuickSearchForm — зразок
grep -n "tabIndex\|ArrowLeft\|ArrowRight\|aria-controls\|tabpanel" frontend/src/components/QuickSearchForm.tsx
# Focus стилі
grep -n "focus-visible\|outline\|silver-accent" frontend/src/app/globals.css
# Перевірити значення CSS-змінної
grep -n "silver-accent" frontend/src/app/globals.css
```

#### B. Аналіз залежностей
- [ ] Чи вплине зміна focus outline на інші компоненти?
- [ ] Чи є компоненти з власними focus-стилями що перевизначають глобальні?

**Нові типи:** -
**Нові API-функції:** -
**Нові компоненти:** -

#### C. Перевірка дизайну
- [ ] Перевірити контрастність нового focus outline кольору
  - Поточний: `#D7D9DC` на `#fafaf9` = ~1.2:1 (недостатньо)
  - Ціль: мінімум 3:1 для non-text UI elements
  - Рекомендація: `var(--stone-600)` = `#57534e` на `#fafaf9` = ~5.9:1

**Референс-сторінка:** `frontend/src/components/QuickSearchForm.tsx`

**Ціль:** Зрозуміти різницю між поточною реалізацією SizesByDiameter та зразковою QuickSearchForm.

**Нотатки для перевикористання:** Можна перенести майже всю логіку tabs з QuickSearchForm.

---

### 5.1 SizesByDiameter: tabIndex управління (ISSUE-06)
- [ ] Додати `tabIndex={0}` на активний (selected) tab
- [ ] Додати `tabIndex={-1}` на всі неактивні таби
- [ ] Перевірити що Tab клавіша потрапляє тільки на активний tab, а не на всі

**Файли:** `frontend/src/components/SizesByDiameter.tsx`
**Джерело:** ACCESSIBILITY_AUDIT ISSUE-06
**Нотатки:** Зараз всі кнопки-таби мають однаковий tabIndex. За WAI-ARIA Tabs Pattern активна таба = tabIndex={0}, неактивні = tabIndex={-1}.

---

### 5.2 SizesByDiameter: ArrowLeft/ArrowRight навігація (ISSUE-06)
- [ ] Додати `onKeyDown` обробник на контейнер tablist або на кожний tab:
  - ArrowRight — переключитись на наступний tab (з wrap-around)
  - ArrowLeft — переключитись на попередній tab (з wrap-around)
  - Home — переключитись на перший tab
  - End — переключитись на останній tab
- [ ] При переключенні — перемістити фокус на новий активний tab
- [ ] Додати `aria-controls` на кожний tab (зв'язок з панеллю)
- [ ] Додати `role="tabpanel"` та `aria-labelledby` на панель контенту

**Файли:** `frontend/src/components/SizesByDiameter.tsx`
**Джерело:** ACCESSIBILITY_AUDIT ISSUE-06
**Нотатки:** Перенести патерн з QuickSearchForm. Там це вже реалізовано зразково.

---

### 5.3 Збільшити focus outline до 2px (ISSUE-07)
- [ ] У `frontend/src/app/globals.css` змінити:
  ```css
  /* Було: */
  :focus-visible {
    outline: 1px solid var(--silver-accent);
    outline-offset: 2px;
  }
  /* Стало: */
  :focus-visible {
    outline: 2px solid var(--stone-500);
    outline-offset: 2px;
  }
  ```
- [ ] Перевірити що outline коректно відображається на кнопках, посиланнях, input'ах
- [ ] Перевірити на світлій та темній темі

**Файли:** `frontend/src/app/globals.css`
**Джерело:** ACCESSIBILITY_AUDIT ISSUE-07
**Нотатки:** WCAG 2.2 рекомендує мінімум 2px outline для кращої видимості.

---

### 5.4 Покращити контраст outline кольору (ISSUE-07)
- [ ] Замінити `var(--silver-accent)` (#D7D9DC) на більш контрастний колір:
  - Рекомендація для світлої теми: `var(--stone-500)` (#78716c) — контраст ~4.3:1 на #fafaf9
  - Або `var(--stone-600)` (#57534e) — контраст ~5.9:1 на #fafaf9
- [ ] Переконатись що на темній темі outline теж достатньо контрастний
- [ ] Розглянути dark mode варіант: `@media (prefers-color-scheme: dark)` або `.dark` клас
- [ ] Перевірити контрастність через CCA або WebAIM Contrast Checker

**Файли:** `frontend/src/app/globals.css`
**Джерело:** ACCESSIBILITY_AUDIT ISSUE-07
**Нотатки:** Поточний #D7D9DC на #fafaf9 = ~1.2:1. Для non-text UI elements WCAG 2.1 вимагає мінімум 3:1 (Success Criterion 1.4.11).

---

### 5.5 Фінальне тестування доступності
- [ ] Запустити Lighthouse Accessibility audit
- [ ] Перевірити SizesByDiameter tabs з клавіатури (Tab, ArrowLeft, ArrowRight)
- [ ] Перевірити focus outline на різних елементах (кнопки, посилання, input)
- [ ] Перевірити контрастність focus outline на обох темах

**Файли:** -
**Нотатки:** Lighthouse цільовий score: 95+

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
   git commit -m "checklist(accessibility-fixes): phase-5 SizesByDiameter tabs and focus outline completed"
   ```
5. Онови PROGRESS.md:
   - Загальний прогрес: 24/24 (100%)
   - Додай запис в історію: "Всі фази завершені"
6. Перевір критерії успіху в README.md
