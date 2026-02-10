# Functional Fixes

## Ціль
Усунути функціональні проблеми, виявлені аудитом: порожній body статей блогу, 404 на endpoint content/generate, soft 404 на неіснуючих статтях, порожня колекція Reviews.

## Критерії успіху
- [ ] Всі 10 статей блогу мають заповнений body-контент
- [ ] GET /api/content/generate повертає коректну відповідь (або видалені посилання на нього)
- [ ] /blog/nonexistent-article повертає HTTP 404 (не 200)
- [ ] /shyny/nonexistent-tyre повертає HTTP 404 (перевірка)
- [ ] Колекція Reviews містить тестові відгуки
- [ ] Production build проходить без помилок

## Фази роботи
1. P1 -- Контент блогу (body: null) -- заповнення body для всіх статей
2. P1 -- GET /api/content/generate 404 -- виправлення або видалення endpoint-у
3. P2 -- Soft 404 на неіснуючих статтях -- коректний HTTP status code
4. P3 -- Колекція Reviews -- наповнення тестовими відгуками

## Джерело вимог
- `plan/prompt/AUDIT_AI_AGENT/report/FUNCTIONAL_AUDIT.md` -- основний аудит
- `plan/prompt/AUDIT_AI_AGENT/report/RELEASE_READINESS_REPORT.md` -- зведений звіт (P1-7, HIGH-002, MED-001, LOW-001)

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** -- перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** -- вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** -- використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
frontend/src/
├── app/
│   ├── blog/[slug]/      # Сторінка статті, not-found.tsx
│   ├── shyny/[slug]/      # Сторінка шини (reference для 404 handling)
│   └── reviews/           # Сторінка відгуків
├── components/            # UI компоненти
└── lib/
    ├── api/
    │   ├── payload.ts     # API клієнт CMS
    │   └── articles.ts    # Функції статей
    └── data.ts            # Типи та mock-дані

backend-payload/
├── src/
│   ├── collections/       # Articles.ts, Reviews.ts
│   └── endpoints/         # contentGeneration.ts
├── scripts/seed.ts        # Seeding БД
└── payload.config.ts      # Конфігурація endpoints
```

### Чекліст перед написанням коду:
- [ ] Шукав схожий функціонал в codebase?
- [ ] Вивчив патерни з схожих файлів?
- [ ] Перевикористовую існуючі компоненти/утиліти?
- [ ] Дотримуюся conventions проекту?

## Правила інтеграції з CMS/API

### Поточний стан:
- Frontend використовує `lib/api/payload.ts` для отримання даних з CMS
- Fallback на mock-дані якщо CMS недоступний
- Payload CMS: REST API на http://localhost:3001/api/
- Admin panel: http://localhost:3001/admin

### Чекліст:
- [ ] Тип додано в lib/data.ts?
- [ ] Mock-дані додано?
- [ ] API-функції створено в lib/api/?
- [ ] Компонент використовує API, а не mock напряму?

## Правила SEO

### Для кожної сторінки:
- [ ] `generateMetadata()` з title та description
- [ ] Для динамічних роутів -- `generateStaticParams()`
- [ ] Хлібні крихти з посиланнями
- [ ] notFound() при відсутності даних для динамічних роутів

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
