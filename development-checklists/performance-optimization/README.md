# Performance Optimization

## Ціль
Усунути проблеми продуктивності, виявлені аудитом: оптимізувати зображення (og-image 1.7 MB, hero PNG), зменшити клієнтський бандл (DOMPurify), рефакторити надмірно складні компоненти (QuickSearchForm, useVehicleSearch), оптимізувати API-запити (depth/limit), додати preconnect та виправити deprecated Sentry API.

## Критерії успіху
- [ ] og-image.jpg сконвертовано у WebP, розмір < 200 KB
- [ ] Hero PNG зображення сконвертовані у WebP
- [ ] DOMPurify санітизація винесена на серверну сторону або lazy-loaded
- [ ] QuickSearchForm: кількість useState зменшена (useReducer або SWR)
- [ ] useVehicleSearch: AbortController додано в handleSearch
- [ ] API листинги шин використовують depth=1 + select
- [ ] Preconnect для Google Maps API додано в layout.tsx
- [ ] getDealerById використовує прямий запрос по ID
- [ ] Sentry deprecation warnings виправлені
- [ ] `npm run build` проходить успішно
- [ ] First Load JS не збільшився (перевірити через build output)

## Фази роботи
1. **P1 -- Оптимізація зображень** - og-image.jpg WebP, hero PNG -> WebP
2. **P2 -- DOMPurify та Bundle Optimization** - серверна санітизація, SeasonalHero cleanup
3. **P2 -- Оптимізація QuickSearchForm та useVehicleSearch** - useReducer, AbortController
4. **P2 -- API Optimization** - depth=1, select, limit для листингів
5. **P3 -- Preconnect, Dealer API, Sentry** - мінорні покращення

## Джерело вимог
- `/plan/prompt/AUDIT_AI_AGENT/report/PERFORMANCE_AUDIT.md`
- `/plan/prompt/AUDIT_AI_AGENT/report/RELEASE_READINESS_REPORT.md` (пункти 15, 28-32, 50-53)

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** - перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** - вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** - використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
frontend/src/
├── components/          # UI компоненти
│   ├── QuickSearchForm.tsx      # Каскадні selects (рефакторинг)
│   ├── LexicalRenderer.tsx      # DOMPurify (оптимізація)
│   ├── SeasonalHero.tsx         # Client-side fetch cleanup
│   └── VehicleTyreSelector/    # useVehicleSearch хук
├── app/
│   └── layout.tsx              # Preconnect hints
├── lib/
│   └── api/
│       ├── payload.ts          # API depth/limit
│       └── dealers.ts          # getDealerById
└── public/
    ├── og-image.jpg            # 1.7 MB -> WebP
    └── images/hero/            # PNG -> WebP
```

### Чекліст перед написанням коду:
- [ ] Шукав схожий функціонал в codebase?
- [ ] Вивчив патерни з схожих файлів?
- [ ] Перевикористовую існуючі компоненти/утиліти?
- [ ] Дотримуюся conventions проекту?

## Правила оптимізації

### Зображення:
- WebP для всіх нових зображень
- Цільовий розмір og-image: 80-150 KB
- Використовувати `cwebp` або `sharp` для конвертації
- Оновити всі імпорти/посилання після конвертації

### Bundle:
- Перевіряти First Load JS через `npm run build` до і після змін
- Lazy-load тяжкі бібліотеки через `dynamic()` або `React.lazy()`
- Server Components за замовчуванням, `'use client'` тільки де потрібно

### API:
- `depth=1` для листингів, `depth=2` тільки для деталей
- `select` для запиту лише потрібних полів
- `limit` відповідно до потреб сторінки (не 500 для каталогів)

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
