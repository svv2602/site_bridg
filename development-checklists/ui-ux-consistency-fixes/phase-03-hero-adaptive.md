# Фаза 3: P1 -- Hero секції без hero-adaptive

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Додати `hero-adaptive` або `hero-dark` класи на hero-секції сторінок `/reviews` та `/porivnyaty`.

## Задачі

### 3.0 Аналіз
- [x] Знайти всі сторінки з hero-adaptive та hero-dark
- [x] Вивчити CSS-класи hero-adaptive та hero-dark в hero.css
- [x] Визначити який клас підходить для кожної сторінки

---

### 3.1 /reviews/page.tsx: hero-adaptive
- [x] Замінено inline gradient `bg-gradient-to-br from-stone-100 via-stone-50 to-stone-50 dark:...` на `hero-adaptive`
- [x] Текст hero вже використовує правильні кольори

**Файли:** `frontend/src/app/reviews/page.tsx`

---

### 3.2 /porivnyaty/page.tsx: hero-dark
- [x] Замінено inline `bg-gradient-to-br from-stone-900 to-stone-800 text-white` на `hero-dark`
- [x] hero-dark підходить тут, оскільки секція завжди темна

**Файли:** `frontend/src/app/porivnyaty/page.tsx`

---

### 3.3 Верифікація
- [x] Перевірено — всі hero-секції в app/ мають hero-adaptive або hero-dark

---
