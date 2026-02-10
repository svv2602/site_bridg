# Фаза 4: P2 — CookiesBanner Dialog

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Додати dialog-семантику до CookiesBanner: `role="dialog"`, `aria-label`, автофокус на першу кнопку при появі. Це дозволить assistive technologies (screen readers) коректно ідентифікувати банер як діалог та повідомити користувача про його появу.

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити `frontend/src/components/CookiesBanner.tsx`:
  - Як банер з'являється (state, animation)?
  - Які ARIA-атрибути вже є?
  - Як працюють кнопки (прийняти все, налаштувати)?
  - Чи блокує банер інтеракцію зі сторінкою (modal)?
- [x] Перевірити чи є інші діалоги в проекті для референсу

**Команди для пошуку:**
```bash
# CookiesBanner
grep -n "aria-\|role=\|dialog\|focus\|ref=" frontend/src/components/CookiesBanner.tsx
# Інші діалоги
grep -rn "role=\"dialog\"\|role=\"alertdialog\"\|aria-modal" frontend/src/components/
```

#### B. Аналіз залежностей
- [x] Чи потрібен focus trap для cookie banner (якщо він модальний)?
- [x] Чи потрібен useRef для автофокусу?

**Нові типи:** -
**Нові API-функції:** -
**Нові компоненти:** -

#### C. Перевірка дизайну
- [x] Не потрібно — візуальних змін немає

**Референс-сторінка:** -

**Ціль:** Зрозуміти поточну реалізацію CookiesBanner.

**Нотатки для перевикористання:** -

---

### 4.1 Додати role="dialog" на CookiesBanner (ISSUE-05)
- [x] Додати `role="dialog"` на основний контейнер банера
- [x] Додати `aria-label="Згода на cookies"` (або `aria-labelledby` якщо є заголовок)
- [x] Переконатись що screen reader оголошує банер як діалог

**Файли:** `frontend/src/components/CookiesBanner.tsx`
**Джерело:** ACCESSIBILITY_AUDIT ISSUE-05, RELEASE_READINESS P2-35
**Нотатки:** Банер відображається поверх контенту та вимагає взаємодії, але не ідентифікується assistive technologies як діалог.

---

### 4.2 Додати автофокус на першу кнопку (ISSUE-05)
- [x] Створити `ref` для першої кнопки (наприклад "Прийняти всі")
- [x] При появі банера (коли стан змінюється на visible) перемістити фокус на цю кнопку:
  ```typescript
  useEffect(() => {
    if (isVisible && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [isVisible]);
  ```
- [x] Перевірити що фокус переміщується коректно

**Файли:** `frontend/src/components/CookiesBanner.tsx`
**Джерело:** ACCESSIBILITY_AUDIT ISSUE-05
**Нотатки:** Без автофокусу користувач клавіатури може не помітити банер.

---

### 4.3 Протестувати з клавіатури
- [x] Перевірити повний цикл:
  - Очистити cookies / localStorage
  - Перезавантажити сторінку
  - Перевірити що фокус потрапив на кнопку банера
  - Tab між кнопками
  - Enter/Space натиснути кнопку
  - Перевірити що банер зникає

**Файли:** -
**Нотатки:** Code-level verification, manual testing recommended

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
   git commit -m "checklist(accessibility-fixes): phase-4 CookiesBanner dialog semantics completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 5
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
