# Фаза 1: P1 — MegaMenu та мобільне меню (WCAG 2.1.1 Level A)

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Додати focus trap, клавіатурну навігацію (ArrowUp/ArrowDown) та обробку Escape в MegaMenu та мобільному бургер-меню. Це базова вимога WCAG 2.1.1 (Keyboard) рівня A — блокер для accessibility compliance.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити `frontend/src/components/MegaMenu.tsx` — поточна ARIA-розмітка, обробники подій, aria-expanded, role="menu", role="menuitem"
- [x] Вивчити `frontend/src/components/MainHeader.tsx` — бургер-меню, aria-expanded, aria-label, onKeyDown
- [x] Вивчити `frontend/src/components/QuickSearchForm.tsx` — РЕФЕРЕНС зразкової реалізації tablist з ArrowLeft/ArrowRight та tabIndex
- [x] Перевірити чи є в проекті утиліта/хук для focus trap (useFocusTrap)

**Команди для пошуку:**
```bash
# Існуючі ARIA-атрибути в MegaMenu
grep -n "aria-\|role=\|onKeyDown\|tabIndex\|focus" frontend/src/components/MegaMenu.tsx
# Існуючі ARIA-атрибути в MainHeader
grep -n "aria-\|role=\|onKeyDown\|tabIndex\|focus\|Escape" frontend/src/components/MainHeader.tsx
# Референс: QuickSearchForm
grep -n "ArrowLeft\|ArrowRight\|tabIndex\|focus\|onKeyDown" frontend/src/components/QuickSearchForm.tsx
# Пошук існуючих focus trap утиліт
grep -rn "focusTrap\|useFocusTrap\|FocusTrap" frontend/src/
```

#### B. Аналіз залежностей
- [x] Чи потрібен новий хук `useFocusTrap`?
- [x] Чи є бібліотека focus-trap-react у залежностях?
- [x] Чи можна перевикористати логіку Arrow-навігації з QuickSearchForm?

**Нові типи:** -
**Нові API-функції:** -
**Нові компоненти:** можливо хук `useFocusTrap` або утиліта для focus management

#### C. Перевірка дизайну
- [x] Не потрібно — це зміни в поведінці, не в UI

**Референс-сторінка:** `frontend/src/components/QuickSearchForm.tsx` — зразок клавіатурної навігації

**Ціль:** Зрозуміти поточний стан ARIA та клавіатурної навігації, знайти що можна перевикористати.

**Нотатки для перевикористання:** -

---

### 1.1 MegaMenu: focus trap та клавіатурна навігація (ISSUE-01, HIGH)
- [x] Додати focus trap при відкритті MegaMenu з клавіатури:
  - Tab/Shift+Tab не повинні виходити за межі відкритого dropdown
  - Реалізувати через custom хук або `focus-trap-react`
- [x] Додати ArrowUp/ArrowDown навігацію між menuitem елементами:
  - ArrowDown — фокус на наступний menuitem
  - ArrowUp — фокус на попередній menuitem
  - Home — фокус на перший menuitem
  - End — фокус на останній menuitem
- [x] Додати автофокус на перший menuitem при відкритті меню з клавіатури (Enter/Space на trigger)
- [x] Переконатись що Escape закриває меню та повертає фокус на кнопку-trigger
- [x] Перевірити що меню коректно відкривається/закривається і при click, і при клавіатурі

**Файли:** `frontend/src/components/MegaMenu.tsx`
**Джерело:** ACCESSIBILITY_AUDIT ISSUE-01, RELEASE_READINESS P1-13
**Нотатки:** MegaMenu вже має `aria-expanded`, `aria-haspopup="menu"`, `role="menu"`, `role="menuitem"`, відкриття/закриття по Enter/Space та Escape. Треба додати: focus trap, Arrow навігацію, автофокус.

---

### 1.2 Мобільне меню: Escape, focus trap, автофокус (ISSUE-02, HIGH)
- [x] Додати обробку Escape для закриття мобільного меню:
  - `onKeyDown` на контейнері: якщо key === 'Escape' — закрити меню
- [x] Додати focus trap при відкритому мобільному меню:
  - Перевикористати той самий механізм що і для MegaMenu
- [x] Додати автофокус на першу посилання при відкритті меню
- [x] При закритті повертати фокус на бургер-кнопку
- [x] Протестувати повний цикл: відкриття бургер → навігація Tab → закриття Escape → фокус на бургер

**Файли:** `frontend/src/components/MainHeader.tsx`
**Джерело:** ACCESSIBILITY_AUDIT ISSUE-02, RELEASE_READINESS P1-14
**Нотатки:** Бургер-меню вже має `aria-expanded` та `aria-label`, але відсутній onKeyDown для Escape, focus trap та автофокус.

---

### 1.3 Тестування Tab/Shift+Tab навігації
- [x] Протестувати MegaMenu:
  - Відкрити меню з клавіатури (Tab до trigger → Enter)
  - Перевірити що фокус потрапив на перший menuitem
  - Натиснути ArrowDown — перевірити переміщення фокуса
  - Натиснути Tab — перевірити що фокус залишається в межах меню
  - Натиснути Escape — перевірити повернення фокуса на trigger
- [x] Протестувати мобільне меню:
  - Зменшити вікно до мобільного розміру
  - Tab до бургер-кнопки → Enter
  - Перевірити автофокус на першій посиланні
  - Tab/Shift+Tab — залишається в межах меню
  - Escape — повернення фокуса на бургер

**Файли:** -
**Нотатки:** Можна використати MCP Playwright для автоматизованого тестування клавіатурної навігації.

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
   git commit -m "checklist(accessibility-fixes): phase-1 MegaMenu and mobile menu focus trap completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
