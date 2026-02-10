# Фаза 6: P3 -- Border-radius, text-stone-500, ThemeToggle

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Усунути мінорні неконсистентності: уніфікувати border-radius карток (TyreCard `rounded-xl` -> `rounded-2xl`), додати `dark:text-stone-400` до `text-stone-500` на іконках, перевірити стилі ThemeToggle.

## Задачі

### 6.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Перевірити border-radius всіх карток (rounded-xl vs rounded-2xl)
- [ ] Знайти всі `text-stone-500` без `dark:text-stone-400`
- [ ] Вивчити стилі ThemeToggle

**Команди для пошуку:**
```bash
# Border-radius карток
grep -rn "rounded-xl" frontend/src/components/ | grep -v "rounded-2xl\|rounded-3xl"
grep -rn "rounded-2xl" frontend/src/components/
# text-stone-500 без dark
grep -rn "text-stone-500" frontend/src/ | grep -v "dark:text-stone"
# ThemeToggle стилі
cat frontend/src/components/ThemeToggle.tsx
```

#### B. Аналіз залежностей
- [ ] Чи вплине зміна rounded-xl на інші компоненти?
- [ ] Чи є тести для TyreCard?

**Нові типи:** ні
**Нові API-функції:** ні
**Нові компоненти:** ні

#### C. Перевірка дизайну
- [ ] Єдиний стандарт border-radius: `rounded-2xl` для карток
- [ ] Стандарт для іконок: `text-stone-500 dark:text-stone-400`

**Референс:** CARD_STYLING.md -- `rounded-2xl`

**Ціль:** Визначити обсяг мінорних змін та їх безпечність.

**Нотатки для перевикористання:** -

---

### 6.1 Уніфікувати border-radius: TyreCard rounded-xl -> rounded-2xl
- [ ] Відкрити `frontend/src/components/TyreCard.tsx`
- [ ] Рядок 79: замінити `rounded-xl` на `rounded-2xl`
- [ ] Перевірити візуально що картка виглядає коректно
- [ ] Перевірити що не зламалась grid-розкладка

**Файли:** `frontend/src/components/TyreCard.tsx`
**Аудит-джерело:** MEDIUM-06

---

### 6.2 Додати dark:-варіант для text-stone-500 на іконках QuickSearchForm
- [ ] Відкрити `frontend/src/components/QuickSearchForm.tsx`
- [ ] Знайти всі `text-stone-500` на іконках
- [ ] Додати `dark:text-stone-400` до кожного
- [ ] Перевірити в dark mode

**Файли:** `frontend/src/components/QuickSearchForm.tsx`
**Аудит-джерело:** LOW-01

---

### 6.3 Додати dark:-варіант для text-stone-500 на іконках SearchFilters
- [ ] Відкрити `frontend/src/app/tyre-search/components/SearchFilters.tsx`
- [ ] Знайти всі `text-stone-500` на іконках (не плутати з text-muted виправленими в фазі 1)
- [ ] Додати `dark:text-stone-400` до кожного
- [ ] Перевірити в dark mode

**Файли:** `frontend/src/app/tyre-search/components/SearchFilters.tsx`
**Аудит-джерело:** LOW-01

---

### 6.4 Перевірити ThemeToggle стилі на консистентність
- [ ] Відкрити `frontend/src/components/ThemeToggle.tsx`
- [ ] Перевірити що `border-border` вже замінено в фазі 1 (задача 1.5)
- [ ] Перевірити що кнопки використовують stone-палітру
- [ ] Перевірити hover та active стани
- [ ] Якщо фаза 1 не охопила -- виправити тут

**Файли:** `frontend/src/components/ThemeToggle.tsx`
**Аудит-джерело:** LOW-03

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Виконай перевірки:
   ```bash
   # Фінальна перевірка всіх стандартів
   grep -rn "bg-muted" frontend/src/
   grep -rn "bg-primary/10" frontend/src/
   grep -rn "rounded-xl" frontend/src/components/ | grep -v "rounded-2xl\|rounded-3xl"
   # Lint та build
   cd frontend && npm run lint && npm run build
   ```
3. Зміни статус фази:
   - [x] Завершена
4. Заповни дату "Завершена: YYYY-MM-DD"
5. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(ui-ux-consistency-fixes): phase-6 minor consistency fixes (border-radius, dark variants, ThemeToggle)"
   ```
6. Онови PROGRESS.md:
   - Загальний прогрес: 35/35 (100%)
   - Додай запис в історію: "Всі фази завершені"
7. Онови README.md -- відміть критерії успіху
