# Analytics & Monitoring Fixes

## Ціль
Усунути всі проблеми аналітики та моніторингу, виявлені в ANALYTICS_MONITORING_AUDIT.md та RELEASE_READINESS_REPORT.md. Підключити аналітичні події до UI, налаштувати GA4/Meta Pixel/Sentry, додати SPA navigation tracking, Web Vitals та frontend health endpoint.

## Критерії успіху
- [ ] TrackTyreView рендериться на /shyny/[slug] і відправляє tyre_view подію
- [ ] trackTyreSearch викликається при пошуку шин в QuickSearchForm
- [ ] trackFormSubmit викликається при успішній відправці контактної форми
- [ ] TrackDealerSearch рендериться на /dealers
- [ ] trackDealerClick та trackPhoneClick інтегровані в картки дилерів
- [ ] TrackComparisonView рендериться на /porivnyaty
- [ ] SPA page views трекаються при client-side навігації (GA4 + Meta Pixel)
- [ ] GA4 та Meta Pixel env-змінні задокументовані в .env.example
- [ ] @sentry/node встановлений на backend
- [ ] Frontend /api/health endpoint працює

## Фази роботи
1. [P0 Blocker -- Інтеграція аналітичних подій в UI](phase-01-analytics-events-integration.md) - підключити tracking компоненти та функції до сторінок
2. [P1 -- Налаштування GA4, Meta Pixel, Sentry](phase-02-ga4-pixel-sentry-setup.md) - env-змінні, залежності, документація
3. [P1 -- SPA Navigation Tracking](phase-03-spa-navigation-tracking.md) - page views при client-side навігації
4. [P2 -- Web Vitals, Structured Logging, Frontend Health](phase-04-webvitals-logging-health.md) - Core Web Vitals, структуроване логування, health endpoint
5. [P3 -- Meta Pixel noscript, Consent Polling](phase-05-pixel-noscript-consent.md) - noscript fallback, оптимізація consent polling

## Джерело вимог
- `plan/prompt/AUDIT_AI_AGENT/report/ANALYTICS_MONITORING_AUDIT.md`
- `plan/prompt/AUDIT_AI_AGENT/report/RELEASE_READINESS_REPORT.md` (P0-5, P1-10..12, P2-42..44)

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** - перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** - вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** - використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
frontend/src/
├── components/
│   ├── Analytics.tsx           # GA4 + Meta Pixel ініціалізація
│   ├── AnalyticsEvents.tsx     # Tracking компоненти (TrackTyreView, etc.)
│   └── CookiesBanner.tsx       # Cookie consent
├── lib/
│   └── analytics.ts            # Tracking функції (trackTyreSearch, trackFormSubmit, etc.)
├── app/
│   ├── shyny/[slug]/page.tsx   # Сторінка шини
│   ├── dealers/page.tsx        # Сторінка дилерів
│   ├── contacts/ContactForm.tsx # Контактна форма
│   ├── porivnyaty/page.tsx     # Сторінка порівнянь
│   └── layout.tsx              # Root layout
└── sentry.client.config.ts     # Sentry frontend конфіг

backend-payload/
├── src/lib/sentry.ts           # Sentry backend wrapper
├── package.json                # Залежності (відсутній @sentry/node)
└── .env                        # Env-змінні backend
```

### Чекліст перед написанням коду:
- [ ] Шукав схожий функціонал в codebase?
- [ ] Вивчив патерни з схожих файлів?
- [ ] Перевикористовую існуючі компоненти/утиліти?
- [ ] Дотримуюся conventions проекту?

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
