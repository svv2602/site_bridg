# Фаза 3: Мега-меню

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

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
- [ ] Вивчити `MainHeader.tsx` - поточну навігацію
- [ ] Вивчити як реалізовано бургер-меню
- [ ] Перевірити чи є компоненти dropdown/popover
- [ ] Вивчити Framer Motion для анімацій

**Команди для пошуку:**
```bash
# Поточний header
cat frontend/src/components/MainHeader.tsx

# Існуючі dropdown компоненти
grep -r "dropdown\|popover" frontend/src/components/

# Framer Motion usage
grep -r "motion\." frontend/src/components/
```

#### B. Аналіз залежностей
- [ ] Чи використовувати Headless UI чи кастомне рішення?
- [ ] Чи потрібні нові компоненти для підменю?
- [ ] Як обробляти keyboard navigation?

**Підхід:** Кастомне рішення з Framer Motion
**Нові компоненти:** MegaMenu.tsx, MegaMenuItem.tsx

#### C. Перевірка дизайну
- [ ] Скільки колонок в мега-меню?
- [ ] Чи потрібні іконки для категорій?
- [ ] Яка затримка при hover (debounce)?

**Структура меню:**
```
| За сезоном     | За типом авто  | Пошук        |
| -------------- | -------------- | ------------ |
| Літні          | Легкові        | За розміром  |
| Зимові         | SUV/4x4        | За авто      |
| Всесезонні     | Комерційні     |              |
```

**Нотатки для перевикористання:** -

---

### 3.1 Структура даних меню

- [ ] Створити типи для структури мега-меню
- [ ] Визначити дані для всіх категорій
- [ ] Додати іконки для кожної категорії

**Файли:** `frontend/src/lib/navigation.ts` (новий)

**Структура:**
```typescript
interface MegaMenuColumn {
  title: string;
  items: {
    label: string;
    href: string;
    icon?: LucideIcon;
    description?: string;
  }[];
}

interface MegaMenuData {
  trigger: string;
  columns: MegaMenuColumn[];
}

export const tyresMenuData: MegaMenuData = {
  trigger: 'Шини',
  columns: [
    {
      title: 'За сезоном',
      items: [
        { label: 'Літні шини', href: '/passenger-tyres?season=summer', icon: Sun },
        { label: 'Зимові шини', href: '/passenger-tyres?season=winter', icon: Snowflake },
        { label: 'Всесезонні', href: '/passenger-tyres?season=all-season', icon: Cloud },
      ],
    },
    // ...
  ],
};
```

**Нотатки:** -

---

### 3.2 Створення MegaMenu компонента

- [ ] Створити `frontend/src/components/MegaMenu.tsx`
- [ ] Імплементувати hover trigger з debounce
- [ ] Додати Framer Motion анімацію (fade + slide)
- [ ] Забезпечити закриття при mouseleave

**Файли:** `frontend/src/components/MegaMenu.tsx`

**Базова структура:**
```tsx
'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface MegaMenuProps {
  trigger: string;
  columns: MegaMenuColumn[];
}

export function MegaMenu({ trigger, columns }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(true), 150);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(false), 100);
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button className="...">{trigger}</button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl"
          >
            {/* Menu content */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Нотатки:** -

---

### 3.3 Інтеграція в MainHeader

- [ ] Замінити простий Link "Шини" на MegaMenu
- [ ] Зберегти решту навігації без змін
- [ ] Адаптувати позиціонування для sticky header
- [ ] Перевірити z-index конфлікти

**Файли:** `frontend/src/components/MainHeader.tsx`

**Зміни:**
```tsx
// Замість:
<Link href="/passenger-tyres">Шини</Link>

// Використати:
<MegaMenu trigger="Шини" columns={tyresMenuData.columns} />
```

**Нотатки:** -

---

### 3.4 Стилізація мега-меню

- [ ] Стилізувати контейнер меню (bg-white, shadow, border)
- [ ] Стилізувати колонки (grid або flex)
- [ ] Стилізувати пункти меню з hover ефектами
- [ ] Додати іконки та descriptions
- [ ] Адаптувати для dark mode

**Файли:** `frontend/src/components/MegaMenu.tsx`

**Стилі:**
```tsx
// Контейнер
className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-2xl rounded-2xl overflow-hidden"

// Колонки
className="grid grid-cols-3 gap-8 p-8"

// Пункт меню
className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
```

**Нотатки:** -

---

### 3.5 Mobile адаптація

- [ ] На mobile мега-меню не потрібне (використовувати бургер)
- [ ] Додати breakpoint перевірку (lg:block hidden)
- [ ] Переконатися що бургер-меню працює як раніше

**Файли:** `frontend/src/components/MainHeader.tsx`

**Логіка:**
```tsx
{/* Desktop: Mega menu */}
<div className="hidden lg:flex items-center">
  <MegaMenu trigger="Шини" ... />
</div>

{/* Mobile: Burger menu (existing) */}
<div className="lg:hidden">
  {/* existing burger menu code */}
</div>
```

**Нотатки:** -

---

### 3.6 Keyboard accessibility

- [ ] Додати keyboard navigation (Tab, Enter, Escape)
- [ ] Додати aria-expanded, aria-haspopup
- [ ] Тестувати з screen reader
- [ ] Додати focus trap в меню

**Файли:** `frontend/src/components/MegaMenu.tsx`

**Accessibility attributes:**
```tsx
<button
  aria-expanded={isOpen}
  aria-haspopup="menu"
  onKeyDown={(e) => {
    if (e.key === 'Escape') setIsOpen(false);
    if (e.key === 'Enter') setIsOpen(!isOpen);
  }}
>
```

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
   git commit -m "checklist(goodyear-ux): phase-3 mega menu completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 4
   - Загальний прогрес: 22/48 задач
   - Додай запис в історію
6. Відкрий `phase-04-vehicle-type-blocks.md` та продовж роботу
