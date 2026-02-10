# Фаза 3: P2 — Heading Hierarchy

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Виправити ієрархію заголовків (H1 > H2 > H3) на головній сторінці та сторінці контактів.

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Homepage: CTA секція (рядок 390) має h3 без батьківського h2
- [x] Contacts: contact methods (рядок 121), FAQ (159), Map (182), CTA (210) — все h3 без h2
- [x] SeasonalHero: h3 (рядок 155) під h1 без h2

---

### 3.1 Виправити heading hierarchy на головній сторінці
- [x] CTA h3 "Не впевнені, які шини обрати?" → h2 (зберігаючи text-3xl font-bold)
- [x] SeasonalHero h3 (season card title) → h2 (зберігаючи text-xl font-semibold)

**Файли:** `frontend/src/app/page.tsx`, `frontend/src/components/SeasonalHero.tsx`

---

### 3.2 Виправити heading hierarchy на сторінці контактів
- [x] Contact methods h3 → h2 (зберігаючи text-lg font-semibold)
- [x] FAQ h3 "Часті запитання" → h2 (зберігаючи text-2xl font-bold)
- [x] FAQ h4 (питання) → h3 (зберігаючи font-semibold)
- [x] Map h3 "Ми на карті" → h2 (зберігаючи text-2xl font-bold)
- [x] CTA h3 "Потрібна негайна допомога?" → h2 (зберігаючи text-3xl font-bold)

**Файли:** `frontend/src/app/contacts/page.tsx`

---

### 3.3 Перевірити інші сторінки на heading hierarchy
- [x] Перевірено — інші сторінки мають коректну ієрархію

---
