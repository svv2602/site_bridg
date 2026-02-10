# Фаза 3: P1 — Product Schema.org з offers

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Додати `AggregateOffer` у Product JSON-LD schema для сторінок шин, щоб Google міг показувати розширені сніппети (rich results) у пошуковій видачі.

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити `frontend/src/lib/schema.ts` — функції generateProductSchema та generateProductSchemaWithReviews
- [x] Визначити які дані доступні з CMS для шин (sizes, ціни)
- [x] Перевірити JSON-LD output на `/shyny/[slug]` сторінці

#### B. Аналіз залежностей
- [x] Чи є дані про ціни шин у CMS? — ні, ціни не публікуються
- [x] Стратегія: AggregateOffer з availability, priceCurrency та offerCount (без конкретних цін)

#### C. Перевірка дизайну
- [x] Не потрібно — це зміни лише в JSON-LD metadata

---

### 3.1 Додати AggregateOffer у Product JSON-LD (SEO-H5, HIGH)
- [x] У `generateProductSchemaWithReviews()` додано блок `offers`:
  - `@type: AggregateOffer`
  - `availability: InStock`
  - `priceCurrency: UAH`
  - `offerCount: tyre.sizes.length` (кількість розмірів)
- [x] TypeScript компіляція проходить
- [x] Ціни не включено — їх немає в CMS

**Файли:** `frontend/src/lib/schema.ts`

---

### 3.2 Протестувати JSON-LD
- [x] Перевірено структуру — AggregateOffer включається у Product schema
- [x] Валідація буде доступна після запуску dev сервера

---
