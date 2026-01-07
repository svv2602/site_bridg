# Фаза 1: Product Schema

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати Product schema для карток шин.

## Задачі

### 1.1 Утиліта для JSON-LD
- [ ] Створити `frontend/src/lib/schema.ts`
- [ ] Функція `generateProductSchema(tyre: TyreModel)`

**Приклад schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Bridgestone Turanza T005",
  "description": "...",
  "brand": {
    "@type": "Brand",
    "name": "Bridgestone"
  },
  "category": "Tyres",
  "image": "https://...",
  "offers": {
    "@type": "AggregateOffer",
    "availability": "https://schema.org/InStock"
  }
}
```

**Файли:** `frontend/src/lib/schema.ts`

---

### 1.2 Інтеграція в картку шини
- [ ] Додати JSON-LD script в `shyny/[slug]/page.tsx`
- [ ] Використати `<script type="application/ld+json">`

**Файли:** `frontend/src/app/shyny/[slug]/page.tsx`

---

### 1.3 Валідація
- [ ] Перевірити через Google Rich Results Test
- [ ] Виправити помилки якщо є

**URL:** https://search.google.com/test/rich-results

---

## При завершенні фази

1. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(schema): phase-1 Product schema completed"
   ```
2. Відкрий phase-02-local-business.md
