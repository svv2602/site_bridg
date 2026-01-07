# Фаза 2: LocalBusiness Schema

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати LocalBusiness schema для сторінки дилерів.

## Задачі

### 2.1 Функція generateDealerSchema
- [ ] Додати в `frontend/src/lib/schema.ts`
- [ ] Функція `generateLocalBusinessSchema(dealer: Dealer)`

**Приклад schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "AutoPartsStore",
  "name": "Офіційний дилер Bridgestone — Назва",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "...",
    "addressLocality": "Київ",
    "addressCountry": "UA"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 50.4501,
    "longitude": 30.5234
  },
  "telephone": "+380...",
  "openingHours": "Mo-Fr 09:00-18:00"
}
```

**Файли:** `frontend/src/lib/schema.ts`

---

### 2.2 Інтеграція в сторінку дилерів
- [ ] Додати JSON-LD для кожного дилера або aggregated list
- [ ] Або додати при кліку на InfoWindow (опційно)

**Файли:** `frontend/src/app/dealers/page.tsx`

---

### 2.3 Валідація
- [ ] Перевірити через Google Rich Results Test

---

## При завершенні фази

1. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(schema): phase-2 LocalBusiness schema completed"
   ```
2. Відкрий phase-03-article-breadcrumbs.md
