# Content Automation Fixes

## Ціль
Усунути проблеми контентної автоматизації, виявлені аудитом: hardcoded credentials, дублювання коду в скрейпері, відсутність multi-brand SEO, кириличні slug-и, змішування browser-движків, неефективний cost tracker та logger.

## Критерії успіху
- [ ] Hardcoded `admin123` замінено на обов'язкову env-змінну з throw Error
- [ ] ANTHROPIC_API_KEY додано в .env.example, validation в env.ts оновлено
- [ ] ProKoleso scraper імпортує типи з types.ts та конфіг з config.ts (без дублювання)
- [ ] tire-seo.ts підтримує multi-brand (аналогічно tire-description.ts)
- [ ] Article generator створює латинські slug-и (транслітерація)
- [ ] Browser automation уніфіковано (оцінка міграції Puppeteer -> Playwright)
- [ ] Scheduler працює автоматично (cron/systemd/Payload scheduler)
- [ ] Cost tracker мігровано на SQLite
- [ ] Logger використовує асинхронний запис
- [ ] User-Agent актуальний, retry-логіка інтегрована

## Фази роботи
1. P1 -- Hardcoded Credentials і ANTHROPIC_API_KEY -- усунення security-ризиків
2. P1 -- Рефакторинг дублювання в ProKoleso Scraper -- деduplікація типів та конфігу
3. P2 -- Tire SEO Multi-brand і Slug транслітерація -- multi-brand та SEO-коректні URL
4. P2 -- Уніфікація Browser Automation і Scheduler -- один browser-движок, автоматичний scheduling
5. P3 -- Cost Tracker, Logger, User-Agent -- технічний борг, надійність, performance

## Джерело вимог
- `plan/prompt/AUDIT_AI_AGENT/report/CONTENT_AUTOMATION_AUDIT.md` -- основний аудит
- `plan/prompt/AUDIT_AI_AGENT/report/RELEASE_READINESS_REPORT.md` -- зведений звіт (P0-4, P1-22, P2-45..48, P3-63..65)

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** -- перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** -- вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** -- використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
backend-payload/content-automation/src/
├── config/               # env.ts, prompts.ts -- конфігурація
├── scrapers/             # prokoleso.ts, config.ts, types.ts -- скрейпери
├── processors/content/   # tire-seo.ts, tire-description.ts, article-generator.ts
├── publishers/           # payload-client.ts -- публікація в CMS
├── providers/            # cost-tracker.ts, providers.ts -- LLM провайдери
├── utils/                # logger.ts, retry.ts -- утиліти
├── db/                   # article-queue.ts -- SQLite БД
└── scheduler.ts          # CLI-оркестратор
```

### Чекліст перед написанням коду:
- [ ] Шукав схожий функціонал в codebase?
- [ ] Вивчив патерни з схожих файлів?
- [ ] Перевикористовую існуючі компоненти/утиліти?
- [ ] Дотримуюся conventions проекту?

## Правила інтеграції з CMS/API

### Поточний стан:
- Content automation використовує REST API Payload CMS через `payload-client.ts`
- Multi-provider LLM з автоматичним fallback через `providers.ts`
- SQLite для article queue в `content-automation.db`
- JSON файли для costs та scraped data

### Чекліст:
- [ ] Зміни не ламають існуючий pipeline (scrape -> generate -> publish)?
- [ ] Env-змінні додано в .env.example?
- [ ] Тести оновлено для нового функціоналу?

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
