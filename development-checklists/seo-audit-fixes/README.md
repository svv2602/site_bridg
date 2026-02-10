# SEO Audit Fixes

## Ціль
Усунути всі проблеми, виявлені під час SEO-аудиту сайту Bridgestone Ukraine: виправити sitemap, RSS-фід, Open Graph теги, Schema.org розмітку, canonical URLs, та інші SEO-дефекти для повної готовності до production-запуску.

## Критерії успіху
- [ ] Всі URL у sitemap.xml повертають HTTP 200
- [ ] RSS-фід `/feed.xml` повертає валідний XML
- [ ] `robots.txt` працює тільки через динамічний `robots.ts`
- [ ] `og:type` на сторінках шин = `product`
- [ ] Усі ключові сторінки мають власні openGraph теги
- [ ] Product Schema.org містить `offers` (AggregateOffer)
- [ ] Canonical на пагінації блогу є динамічним
- [ ] Hreflang/alternate теги коректно рендеряться або прибрані
- [ ] Apple Touch Icon та manifest.json створено
- [ ] Organization schema не дублюється (єдине джерело)

## Фази роботи
1. [P0 Blocker — Sitemap та RSS] - Виправити критичні проблеми sitemap, RSS-фіду, robots.txt
2. [P1 — Open Graph та og:type] - Виправити og:type для шин, додати OG теги на сторінки
3. [P1 — Product Schema.org з offers] - Додати AggregateOffer в JSON-LD Product schema
4. [P2 — Canonical, Hreflang, Pagination] - Виправити canonical на пагінації, hreflang теги
5. [P3 — Apple Touch Icon, article:author, Organization дедуплікація] - Дрібні SEO-покращення

## Джерело вимог
- `/home/snisar/RubyProjects/site_Bridgestone/plan/prompt/AUDIT_AI_AGENT/report/SEO_AUDIT.md`
- `/home/snisar/RubyProjects/site_Bridgestone/plan/prompt/AUDIT_AI_AGENT/report/RELEASE_READINESS_REPORT.md`

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** - перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** - вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** - використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
frontend/src/
├── app/
│   ├── sitemap.ts          # Динамічний sitemap
│   ├── robots.ts           # Динамічний robots.txt
│   ├── feed.xml/route.ts   # RSS-фід route handler
│   ├── layout.tsx          # Глобальні metadata, OG, Schema.org
│   ├── blog/page.tsx       # Пагінація, canonical
│   ├── blog/[slug]/page.tsx # Стаття metadata, OG
│   ├── shyny/[slug]/page.tsx # Шина metadata, OG, og:type
│   ├── reviews/page.tsx    # Відгуки metadata
│   └── karta-saitu/page.tsx # Карта сайту metadata
├── lib/
│   ├── schema.ts           # Schema.org JSON-LD генерація
│   └── constants.ts        # URL, логотипи, константи
└── public/
    ├── robots.txt          # Статичний (треба видалити)
    └── og-image.jpg        # OG-зображення за замовчуванням
```

### Чекліст перед написанням коду:
- [ ] Шукав схожий функціонал в codebase?
- [ ] Вивчив патерни з схожих файлів?
- [ ] Перевикористовую існуючі компоненти/утиліти?
- [ ] Дотримуюся conventions проекту?

## Правила SEO

### Для кожної сторінки:
- [ ] `generateMetadata()` з title та description
- [ ] Для динамічних роутів - `generateStaticParams()`
- [ ] Хлібні крихти з посиланнями

### Формат URL:
- Сторінки шин: `/shyny/{slug}`
- Статті: `/blog/{slug}`
- Каталоги: `/passenger-tyres`, `/suv-4x4-tyres`

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
