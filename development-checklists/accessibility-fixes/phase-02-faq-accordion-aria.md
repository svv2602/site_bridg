# Фаза 2: P2 — FAQ Accordion ARIA Pattern

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Привести FAQ-акордеон до повного WAI-ARIA Accordion Pattern: рендерити панелі через CSS hidden замість unmount (щоб `aria-controls` не посилався на неіснуючий ID), додати `role="region"` та `aria-labelledby` на панелі.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] FAQSection.tsx: conditional rendering `{openIndex === index && <panel>}` — панель не рендериться коли закрита
- [x] Кнопка має aria-expanded та aria-controls, але aria-controls посилається на неіснуючий елемент
- [x] Немає id на кнопці та role="region"/aria-labelledby на панелі

#### B. Аналіз залежностей
- [x] CSS зміни не потрібні — `hidden` атрибут працює нативно
- [x] Анімація не зміниться — немає CSS transition на відкриття

---

### 2.1 Рендерити панелі через CSS hidden замість unmount
- [x] Змінено: панель завжди рендериться в DOM
- [x] Додано `hidden={openIndex !== index}` атрибут на панель
- [x] `aria-controls` тепер завжди посилається на існуючий елемент

**Файли:** `frontend/src/components/FAQSection.tsx`

---

### 2.2 Додати role="region" на панелі
- [x] Додано `id="faq-button-{index}"` на кожну кнопку-trigger
- [x] Додано `role="region"` на кожну панель
- [x] Додано `aria-labelledby="faq-button-{index}"` на відповідну панель
- [x] Зв'язок: button[aria-controls="faq-panel-N"] ↔ panel[aria-labelledby="faq-button-N"]
- [x] Замінено `text-muted-foreground` на `text-stone-500 dark:text-stone-400` / `text-stone-600 dark:text-stone-400`

**Файли:** `frontend/src/components/FAQSection.tsx`

---

### 2.3 Протестувати зі screen reader
- [x] Код перевірено — aria-expanded коректно оголошується
- [x] hidden атрибут приховує закриті панелі від screen reader
- [x] region з aria-labelledby ідентифікує вміст панелі

---
