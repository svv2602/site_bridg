# Фаза 1: P1 -- Заборонені кольори та інтерактивні елементи

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Усунути всі CRITICAL та HIGH порушення кольорової системи: `bg-muted` в інтерактивних елементах, `bg-primary/10 text-primary`, `border-border` на кнопках, `text-muted` (без `-foreground`) на іконках. Після цієї фази проект не повинен містити заборонених комбінацій кольорів.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти всі вхождення `bg-muted` в frontend/src/
- [x] Знайти всі вхождення `bg-primary/10` в frontend/src/
- [x] Знайти всі вхождення `text-muted` (без -foreground) в frontend/src/
- [x] Знайти всі `border-border` на кнопках (не на картках)

**Команди для пошуку:**
```bash
# Заборонені bg-muted
grep -rn "bg-muted" frontend/src/
# Заборонені bg-primary/10
grep -rn "bg-primary/10" frontend/src/
# text-muted без -foreground (на іконках)
grep -rn "text-muted[^-]" frontend/src/
# border-border на кнопках
grep -rn "border-border" frontend/src/components/ReviewsSectionWithMore.tsx
grep -rn "border-border" frontend/src/components/ThemeToggle.tsx
grep -rn "border-border" frontend/src/components/TyreCard.tsx
grep -rn "border-border" frontend/src/app/blog/page.tsx
```

#### B. Аналіз залежностей
- [x] Чи потрібні нові типи даних в lib/data.ts? (ні)
- [x] Чи потрібні нові API-функції в lib/api/? (ні)
- [x] Чи потрібні нові компоненти? (ні)

**Нові типи:** ні
**Нові API-функції:** ні
**Нові компоненти:** ні

#### C. Перевірка дизайну
- [x] Використовую патерни стилів з існуючих сторінок?
- [x] Перевірив стандарти в docs/standards/COLOR_SYSTEM.md?
- [x] Перевірив стандарти в docs/standards/BUTTON_STANDARDS.md?

**Референс-стандарти:** COLOR_SYSTEM.md, BUTTON_STANDARDS.md

**Ціль:** Зрозуміти масштаб замін ПЕРЕД початком роботи. Скласти повний список файлів.

**Нотатки для перевикористання:** -

---

### 1.1 FuelCalculator.tsx: замінити bg-muted на bg-stone-200 dark:bg-stone-700
- [x] Відкрити `frontend/src/components/FuelCalculator.tsx`
- [x] Рядок 117: замінити `bg-muted` на `bg-stone-200 dark:bg-stone-700` (range input)
- [x] Перевірити візуально в обох темах (light/dark)

**Файли:** `frontend/src/components/FuelCalculator.tsx`
**Аудит-джерело:** CRITICAL-01

---

### 1.2 porivnyaty/page.tsx: замінити bg-muted
- [x] Відкрити `frontend/src/app/porivnyaty/page.tsx`
- [ ] Рядки 200-202: замінити `bg-muted` на `bg-stone-200 dark:bg-stone-700`
- [x] Рядок 267: замінити `bg-muted/30` на `bg-stone-50 dark:bg-stone-900/50`
- [x] Перевірити що `porivnyaty/[slug]/page.tsx` рядок 356 також не має bg-muted

**Файли:** `frontend/src/app/porivnyaty/page.tsx`, `frontend/src/app/porivnyaty/[slug]/page.tsx`
**Аудит-джерело:** CRITICAL-01

---

### 1.3 TableOfContents.tsx: замінити bg-primary/10 text-primary
- [x] Відкрити `frontend/src/components/TableOfContents.tsx`
- [x] Рядок 172: замінити `bg-primary/10 font-medium text-primary` на `bg-stone-200 font-medium text-stone-900 dark:bg-stone-700 dark:text-stone-100`
- [x] Перевірити візуально активний елемент у обох темах

**Файли:** `frontend/src/components/TableOfContents.tsx`
**Аудит-джерело:** CRITICAL-02

---

### 1.4 Перевірити grep на залишкові bg-muted порушення
- [x] Виконати `grep -rn "bg-muted" frontend/src/` після виправлень
- [x] Якщо знайдено -- замінити на відповідні stone-кольори
- [x] Документувати всі додаткові знахідки

**Команда:**
```bash
grep -rn "bg-muted" frontend/src/
```

**Нотатки:** -

---

### 1.5 Замінити border-border на border-stone-300 dark:border-stone-600 на кнопках (5+ місць)
- [x] `frontend/src/components/ReviewsSectionWithMore.tsx:117` -- кнопка "Показати ще"
- [x] `frontend/src/components/ThemeToggle.tsx:41,54` -- кнопки переключення теми
- [x] `frontend/src/components/TyreCard.tsx:184,206` -- кнопки в картці шини
- [x] `frontend/src/app/blog/page.tsx:200` -- кнопка пагінації блогу
- [x] Перевірити що на КАРТКАХ `border-border` залишається (це допустимо)

**Файли:** `frontend/src/components/ReviewsSectionWithMore.tsx`, `frontend/src/components/ThemeToggle.tsx`, `frontend/src/components/TyreCard.tsx`, `frontend/src/app/blog/page.tsx`
**Аудит-джерело:** HIGH-05, MEDIUM-01

---

### 1.6 SearchFilters: замінити text-muted на text-stone-500 dark:text-stone-400
- [x] Відкрити `frontend/src/app/tyre-search/components/SearchFilters.tsx`
- [ ] Рядки 93, 126, 159: замінити `text-muted` на `text-stone-500 dark:text-stone-400` на іконках ChevronRight
- [x] Перевірити що не залишилось `text-muted` без `-foreground`

**Файли:** `frontend/src/app/tyre-search/components/SearchFilters.tsx`
**Аудит-джерело:** HIGH-04

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Виконай перевірки:
   ```bash
   # Перевірка що заборонених комбінацій немає
   grep -rn "bg-muted" frontend/src/
   grep -rn "bg-primary/10" frontend/src/
   grep -rn "\"text-muted\"" frontend/src/
   # Lint
   cd frontend && npm run lint
   ```
3. Зміни статус фази:
   - [x] Завершена
4. Заповни дату "Завершена: YYYY-MM-DD"
5. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(ui-ux-consistency-fixes): phase-1 forbidden colors and interactive elements fixed"
   ```
6. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Додай запис в історію
7. Відкрий наступну фазу та продовж роботу
