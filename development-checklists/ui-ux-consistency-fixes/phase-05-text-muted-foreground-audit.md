# Фаза 5: P2 -- text-muted-foreground аудит (170+ місць)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Проаналізувати всі 170+ використань `text-muted-foreground` та замінити на явні stone-кольори там, де це потрібно: на badge-ах, іконках та елементах поза `bg-card` контекстом. Залишити `text-muted-foreground` допустимим для описового тексту всередині `bg-card`.

## Правила заміни

| Контекст | Дія |
|----------|-----|
| Текст всередині `bg-card` | ЗАЛИШИТИ (CSS-змінна адаптується до теми) |
| Іконки (Search, Filter, ChevronRight тощо) | ЗАМІНИТИ на `text-stone-500 dark:text-stone-400` |
| Badge-і | ЗАМІНИТИ на `text-stone-500 dark:text-stone-400` |
| Label-и форм (поза bg-card) | ЗАМІНИТИ на `text-stone-600 dark:text-stone-400` |
| EmptyState компонент | ЗАМІНИТИ на `text-stone-500 dark:text-stone-400` |

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Виконати повний пошук `text-muted-foreground` в frontend/src/
- [ ] Класифікувати кожне використання: іконка / badge / текст в bg-card / інше
- [ ] Скласти список файлів для заміни vs файлів які залишаються

**Команди для пошуку:**
```bash
# Повний список
grep -rn "text-muted-foreground" frontend/src/ | wc -l
# Згруповано по файлах
grep -rl "text-muted-foreground" frontend/src/ | sort
# Іконки
grep -rn "text-muted-foreground" frontend/src/ | grep -i "icon\|Icon\|svg\|Lucide\|Chevron\|Search\|Filter"
```

#### B. Аналіз залежностей
- [ ] Чи є CSS-змінна `--muted-foreground` визначена для обох тем? (перевірити)

**Нові типи:** ні
**Нові API-функції:** ні
**Нові компоненти:** ні

#### C. Перевірка дизайну
- [ ] Переконатися що `text-stone-500 dark:text-stone-400` забезпечує достатній контраст
- [ ] Перевірити в обох темах

**Референс:** COLOR_SYSTEM.md -- розділ про дозволені текстові кольори

**Ціль:** Зрозуміти масштаб роботи та розрізнити "залишити" від "замінити".

**Нотатки для перевикористання:** -

---

### 5.1 Замінити text-muted-foreground на іконках форм пошуку
- [ ] `frontend/src/app/dealers/components/DealerFilters.tsx` (рядки 70, 86, 99) -- іконки Search/Filter
- [ ] `frontend/src/app/blog/page.tsx` (рядок 117) -- іконка пошуку
- [ ] `frontend/src/app/porivnyaty/page.tsx` (рядок 142) -- іконка пошуку
- [ ] Замінити на `text-stone-500 dark:text-stone-400`

**Файли:** `frontend/src/app/dealers/components/DealerFilters.tsx`, `frontend/src/app/blog/page.tsx`, `frontend/src/app/porivnyaty/page.tsx`
**Аудит-джерело:** HIGH-01 (п.1)

---

### 5.2 Замінити text-muted-foreground в FuelCalculator (labels)
- [ ] Відкрити `frontend/src/components/FuelCalculator.tsx`
- [ ] Замінити `text-muted-foreground` на label-ах (рядки 107, 119, 130, 148 та інші)
- [ ] Використати `text-stone-600 dark:text-stone-400` для label-ів форм
- [ ] Перевірити всі 10+ місць у файлі

**Файли:** `frontend/src/components/FuelCalculator.tsx`
**Аудит-джерело:** HIGH-01 (п.2)

---

### 5.3 Замінити text-muted-foreground в EmptyState компоненті
- [ ] Відкрити `frontend/src/components/ui/EmptyState.tsx`
- [ ] Рядки 22, 26: замінити `text-muted-foreground` на `text-stone-500 dark:text-stone-400`
- [ ] Перевірити що компонент візуально коректний

**Файли:** `frontend/src/components/ui/EmptyState.tsx`
**Аудит-джерело:** HIGH-01 (п.3)

---

### 5.4 Перевірити залишкові badge-і та іконки з text-muted-foreground
- [ ] Виконати `grep -rn "text-muted-foreground" frontend/src/`
- [ ] Для кожного залишкового -- визначити контекст (bg-card чи ні)
- [ ] Замінити ті, що на іконках/badge-ах поза bg-card
- [ ] Документувати залишкові (допустимі) використання

**Команда:**
```bash
grep -rn "text-muted-foreground" frontend/src/ | grep -v "bg-card"
```

**Нотатки:** -

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Виконай перевірки:
   ```bash
   # Залишкові text-muted-foreground (мають бути тільки в bg-card контекстах)
   grep -rn "text-muted-foreground" frontend/src/ | wc -l
   # Lint
   cd frontend && npm run lint
   ```
3. Зміни статус фази:
   - [x] Завершена
4. Заповни дату "Завершена: YYYY-MM-DD"
5. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(ui-ux-consistency-fixes): phase-5 text-muted-foreground audit -- badges and icons fixed"
   ```
6. Онови PROGRESS.md:
   - Поточна фаза: 6
   - Додай запис в історію
7. Відкрий наступну фазу та продовж роботу
