# Фаза 2: P1 -- Metadata на ключових сторінках

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Додати Next.js Metadata (title, description) на 5 ключових сторінок, які зараз не мають metadata. Це критично для SEO -- без metadata Google використовує дефолтні значення з layout, що призводить до дублювання title/description між сторінками.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Знайти всі сторінки з існуючим metadata (як приклад/шаблон)
- [x] Перевірити формат metadata в існуючих сторінках
- [x] Визначити чи `/porivnyaty` є client component ("use client") -- якщо так, потрібен server wrapper

#### B. Аналіз залежностей
- [x] Чи потрібний окремий server wrapper для client-компонентів? (перевірити /porivnyaty)
- [x] Чи потрібно імпортувати тип Metadata з next?

**Нотатки:** /porivnyaty вже має layout.tsx з metadata export — додано openGraph.

#### C. Перевірка дизайну
- [x] Title формат: "Назва сторінки | Bridgestone Україна"
- [x] Description: 150-160 символів, українською
- [x] Кожна сторінка має унікальний title та description

---

### 2.1 Додати metadata на головну / (page.tsx)
- [x] Відкрити `frontend/src/app/page.tsx`
- [x] Додати `import type { Metadata } from 'next'`
- [x] Додати `export const metadata: Metadata = { title: '...', description: '...' }`
- [x] Title: "Bridgestone Україна — офіційний сайт | Шини для легкових авто, SUV, фургонів"
- [x] Description: унікальний опис головної сторінки українською (150-160 символів)

**Файли:** `frontend/src/app/page.tsx`

---

### 2.2 Додати metadata на /contacts (contacts/page.tsx)
- [x] Відкрити `frontend/src/app/contacts/page.tsx`
- [x] Додати `export const metadata: Metadata`
- [x] Title: "Контакти | Bridgestone Україна"
- [x] Description: опис контактної сторінки (зворотний зв'язок, форма)

**Файли:** `frontend/src/app/contacts/page.tsx`

---

### 2.3 Додати metadata на /about (about/page.tsx)
- [x] Відкрити `frontend/src/app/about/page.tsx`
- [x] Додати `export const metadata: Metadata`
- [x] Title: "Про Bridgestone | Bridgestone Україна"
- [x] Description: опис бренду, історія, місія

**Файли:** `frontend/src/app/about/page.tsx`

---

### 2.4 Додати metadata на /dealers (dealers/page.tsx)
- [x] Відкрити `frontend/src/app/dealers/page.tsx`
- [x] Додати `export const metadata: Metadata`
- [x] Title: "Де купити | Дилери Bridgestone в Україні"
- [x] Description: пошук авторизованих дилерів, карта

**Файли:** `frontend/src/app/dealers/page.tsx`

---

### 2.5 Додати metadata на /porivnyaty (porivnyaty/page.tsx)
- [x] Перевірити чи сторінка є client component ("use client")
- [x] layout.tsx вже існує з metadata — додано openGraph блок
- [x] Title: "Порівняння шин | Bridgestone Україна"
- [x] Description: інструмент порівняння шин, характеристики, ціни

**Файли:** `frontend/src/app/porivnyaty/layout.tsx`
**Нотатки:** Сторінка вже мала layout.tsx з metadata, додано openGraph.

---

### 2.6 Перевірити унікальність title та description
- [x] Переглянути всі metadata на всіх сторінках
- [x] Переконатися що title і description НЕ дублюються
- [x] Переконатися що все українською мовою
- [x] Перевірити TypeScript — помилок немає (крім pre-existing validator.ts)

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
   git commit -m "checklist(ui-ux-consistency-fixes): phase-2 metadata added to 5 key pages"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
