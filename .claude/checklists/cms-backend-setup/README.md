# CMS / Backend — управління контентом

## Ціль
Налаштувати headless CMS для управління каталогом шин, дилерами, статтями та контентними сторінками.

## Критерії успіху
- [ ] CMS розгорнута та доступна
- [ ] Моделі даних створені (шини, дилери, статті, технології)
- [ ] API endpoints працюють
- [ ] Frontend підключений до CMS замість mock даних
- [ ] Ролі користувачів налаштовані (адмін, редактор)
- [ ] Завантаження зображень працює

## Фази роботи
1. **Вибір та налаштування CMS** — Strapi vs Payload vs інше
2. **Моделі даних** — створення content types
3. **API інтеграція** — підключення frontend до CMS
4. **Ролі та права** — налаштування доступу

## Джерело вимог
`01_TZ_Bridgestone_site.md` — пункт 7 "Адміністративна панель / CMS"

## Правила перевикористання коду

### Існуючі типи даних:
```
frontend/src/lib/data.ts:
- TyreModel      → Content Type "Tyre"
- TyreSize       → Component "TyreSize"
- Dealer         → Content Type "Dealer"
- Article        → Content Type "Article"
- Technology     → Content Type "Technology"
- VehicleFitment → Content Type "VehicleFitment"
```

### API шар (готовий до заміни):
```
frontend/src/lib/api/
├── tyres.ts     # getTyreModels, searchTyresBySize, searchTyresByCar
├── dealers.ts   # getDealers, getDealerById
└── articles.ts  # getArticles, getArticleBySlug
```

## Рекомендації по CMS

| CMS | Плюси | Мінуси |
|-----|-------|--------|
| **Strapi** | Популярний, багато плагінів, REST + GraphQL | Node.js, потребує хостинг |
| **Payload** | TypeScript native, сучасний | Менш відомий |
| **Sanity** | Hosted, GROQ запити | Платний на масштабі |
| **Directus** | SQL-based, гнучкий | Складніший setup |

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
