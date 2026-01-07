# Фаза 3: Article + BreadcrumbList Schema

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати schema для статей та хлібних крихт.

## Задачі

### 3.1 Article Schema
- [ ] Функція `generateArticleSchema(article: Article)`
- [ ] Інтегрувати в `advice/[slug]/page.tsx`

**Приклад:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "description": "...",
  "author": {
    "@type": "Organization",
    "name": "Bridgestone Україна"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Bridgestone Україна"
  },
  "datePublished": "2026-01-07"
}
```

**Файли:** `frontend/src/lib/schema.ts`, `frontend/src/app/advice/[slug]/page.tsx`

---

### 3.2 BreadcrumbList Schema
- [ ] Функція `generateBreadcrumbSchema(items: {name, url}[])`
- [ ] Додати до сторінок з хлібними крихтами

**Приклад:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Головна", "item": "https://..."},
    {"@type": "ListItem", "position": 2, "name": "Шини", "item": "https://..."}
  ]
}
```

**Файли:** `frontend/src/lib/schema.ts`

---

### 3.3 Фінальна валідація
- [ ] Перевірити всі типи schema через Rich Results Test
- [ ] Виправити warnings якщо є

---

## При завершенні фази

1. Виконай фінальний коміт:
   ```bash
   git add .
   git commit -m "checklist(schema): completed

   - Product schema for tyres
   - LocalBusiness schema for dealers
   - Article schema for blog posts
   - BreadcrumbList schema"
   ```
2. Онови PROGRESS.md — задача завершена!
