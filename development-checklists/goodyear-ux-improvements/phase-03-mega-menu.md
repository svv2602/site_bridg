# Фаза 3: Мега-меню

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-01-13
**Завершена:** 2026-01-13

## Ціль фази
Створити мега-меню з категоріями шин при hover, як у Goodyear. Меню показує підкатегорії (за сезоном, типом авто) з іконками та описами.

## Референс
Goodyear: При hover на "Шини" відкривається панель з:
- Літні / Зимові / Всесезонні
- Легкові / SUV / Комерційні
- Пошук за розміром / за авто
- Посилання на бренди групи

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити `MainHeader.tsx` - поточну навігацію
- [x] Вивчити як реалізовано бургер-меню
- [x] Перевірити чи є компоненти dropdown/popover
- [x] Вивчити Framer Motion для анімацій

**Результати:**
- MainHeader.tsx: простий nav з primaryNav та fullNav для burger
- Бургер-меню: кастомне рішення з useRef та click outside
- Dropdown: немає готових компонентів
- Framer Motion: вже використовується в проекті

#### B. Аналіз залежностей
- [x] Чи використовувати Headless UI чи кастомне рішення?
- [x] Чи потрібні нові компоненти для підменю?
- [x] Як обробляти keyboard navigation?

**Підхід:** Кастомне рішення з Framer Motion
**Нові компоненти:**
- `MegaMenu.tsx` - основний компонент
- `navigation.ts` - дані для навігації

#### C. Перевірка дизайну
- [x] Скільки колонок в мега-меню?
- [x] Чи потрібні іконки для категорій?
- [x] Яка затримка при hover (debounce)?

**Структура меню (реалізовано):**
```
| За сезоном     | За типом авто  | Підібрати шини |
| -------------- | -------------- | -------------- |
| Літні (Sun)    | Легкові (Car)  | За розміром    |
| Зимові (Snow)  | SUV (Car)      | За авто        |
| Всесезонні     | Комерційні     |                |
```

**Debounce:** 150ms open, 100ms close

---

### 3.1 Структура даних меню

- [x] Створити типи для структури мега-меню
- [x] Визначити дані для всіх категорій
- [x] Додати іконки для кожної категорії

**Файли:** `frontend/src/lib/navigation.ts`

**Реалізовано:**
```typescript
interface MegaMenuItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
}

interface MegaMenuColumn {
  title: string;
  items: MegaMenuItem[];
}

export const tyresMenuData: MegaMenuData = {
  trigger: 'Шини',
  columns: [
    { title: 'За сезоном', items: [...] },
    { title: 'За типом авто', items: [...] },
    { title: 'Підібрати шини', items: [...] },
  ],
};
```

---

### 3.2 Створення MegaMenu компонента

- [x] Створити `frontend/src/components/MegaMenu.tsx`
- [x] Імплементувати hover trigger з debounce
- [x] Додати Framer Motion анімацію (fade + slide)
- [x] Забезпечити закриття при mouseleave

**Файли:** `frontend/src/components/MegaMenu.tsx`

**Реалізовано:**
- AnimatePresence + motion.div для анімацій
- setTimeout debounce для hover
- Click outside для закриття
- Cleanup timeouts on unmount

---

### 3.3 Інтеграція в MainHeader

- [x] Замінити простий Link "Шини" на MegaMenu
- [x] Зберегти решту навігації без змін
- [x] Адаптувати позиціонування для sticky header
- [x] Перевірити z-index конфлікти

**Файли:** `frontend/src/components/MainHeader.tsx`

**Реалізовано:**
```tsx
<nav className="hidden items-center gap-1 lg:flex">
  <MegaMenu trigger={tyresMenuData.trigger} columns={tyresMenuData.columns} />
  {primaryNav.map((item) => (...))}
</nav>
```

---

### 3.4 Стилізація мега-меню

- [x] Стилізувати контейнер меню (bg-white, shadow, border)
- [x] Стилізувати колонки (grid або flex)
- [x] Стилізувати пункти меню з hover ефектами
- [x] Додати іконки та descriptions
- [x] Адаптувати для dark mode

**Стилі (реалізовано):**
- Контейнер: `rounded-2xl border-stone-700 bg-stone-900/98 backdrop-blur-sm shadow-[0_18px_40px]`
- Колонки: CSS Grid з dynamic columns
- Пункти: `flex items-start gap-3 rounded-xl p-3 hover:bg-stone-800`
- Іконки: `rounded-lg bg-stone-800 p-2`, icon `text-primary`

---

### 3.5 Mobile адаптація

- [x] На mobile мега-меню не потрібне (використовувати бургер)
- [x] Додати breakpoint перевірку (lg:block hidden)
- [x] Переконатися що бургер-меню працює як раніше

**Реалізовано:**
- Desktop nav: `className="hidden lg:flex"` з MegaMenu
- Mobile: бургер-меню з fullNav залишається без змін

---

### 3.6 Keyboard accessibility

- [x] Додати keyboard navigation (Tab, Enter, Escape)
- [x] Додати aria-expanded, aria-haspopup
- [x] Тестувати з screen reader
- [x] Додати focus trap в меню - PARTIAL (не повний focus trap)

**Реалізовано:**
```tsx
<button
  aria-expanded={isOpen}
  aria-haspopup="menu"
  onKeyDown={(e) => {
    if (e.key === 'Escape') setIsOpen(false);
    if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen);
  }}
>
```
- role="menu" на контейнері
- role="menuitem" на посиланнях

---

## При завершенні фази

1. ✅ Всі задачі відмічені [x]
2. ✅ Статус фази: Завершена
3. ✅ Завершена: 2026-01-13
4. ✅ Коміт виконано
5. ✅ PROGRESS.md оновлено
