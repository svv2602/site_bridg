# Content Automation: Исправление проблем (Модули 17-20)

## Цель

Исправление всех найденных проблем системы автоматизации контента Bridgestone Ukraine, выявленных в архитектурном анализе модулей 17 (Scraping System), 18 (AI Processors), 19 (Smart Article Pipeline) и 20 (Telegram Bot & Notifications). Повышение надёжности, безопасности, тестируемости и поддерживаемости системы.

## Критерии успеха

- [ ] Все P0 (критические) дефекты исправлены: hardcoded credentials удалены, безусловные main() защищены guard-условиями, operator precedence bug исправлен
- [ ] Скраперы используют retry logic через существующий `withRetry()` из `utils/retry.ts`
- [ ] God-файл `prokoleso.ts` (900 строк) разбит на модули: types, config, parsers, scraper
- [ ] MarkdownV2 баги в Telegram-боте исправлены, parse_mode унифицирован
- [ ] Strapi-ссылки заменены на Payload CMS
- [ ] Legacy-дубликаты файлов удалены из `src/automation/`
- [ ] Юнит-тесты написаны для парсинг-функций скраперов и article-planner
- [ ] Sanity checks с алертингом в Telegram при резком падении количества результатов скрапинга
- [ ] Draft-статус реализован для article pipeline при `auto_publish = false`
- [ ] GET-эндпоинты automation API защищены аутентификацией
- [ ] `npm run build` и `npm run test` проходят без ошибок после каждой фазы

## Фазы работы

1. **Критические исправления** -- P0: hardcoded credentials, безусловные main(), operator precedence, аутентификация GET endpoints
2. **Стабилизация скраперов** -- P1: retry logic, error handling, рефакторинг prokoleso.ts (900 строк), sanity checks
3. **Улучшения pipeline** -- P1/P2: draft-статус статей, AI processors fixes, консолидация ArticleType, дедупликация кода
4. **Исправление Telegram-бота** -- P1/P2: MarkdownV2 баги, Strapi ссылки, дубликаты Telegram API, graceful shutdown
5. **Тестирование и мониторинг** -- P2/P3: юнит-тесты, мониторинг, документация, архитектурные улучшения

## Джерело вимог

- `plan/prompt/prompts_analysis/report/17_scraping_system_analysis_2026-02-09.md`
- `plan/prompt/prompts_analysis/report/18_ai_processors_analysis_2026-02-09.md`
- `plan/prompt/prompts_analysis/report/19_article_pipeline_analysis_2026-02-09.md`
- `plan/prompt/prompts_analysis/report/20_telegram_bot_analysis_2026-02-09.md`

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалiзацiєю:
1. **Пошук існуючого функціоналу** -- перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** -- вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** -- використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
backend-payload/content-automation/src/
├── scrapers/            # Скраперы (prokoleso, adac, autobild, tyrereviews)
├── processors/          # AI-процессоры (generators, validators, badge-assigner)
├── publishers/          # Публикация (payload-client, telegram-bot, telegram-commands)
├── db/                  # SQLite хранилище (article-queue, test-results)
├── config/              # Конфигурация (env, seasonal, database-providers)
├── providers/           # LLM и image провайдеры (fallback-llm, cost-tracker)
├── utils/               # Утилиты (retry, logger, markdown-to-lexical, storage, metrics)
├── prompts/             # Промпт-шаблоны
├── types/               # Типы данных
├── article-pipeline.ts  # Smart Article Pipeline оркестратор
├── article-planner.ts   # Алгоритм планирования статей
├── scheduler.ts         # Основной scheduler
├── cron.ts              # Cron-планировщик
└── index.ts             # Daemon entry point

backend-payload/src/
├── endpoints/           # REST API endpoints (contentGeneration, automation)
├── automation/          # Legacy-дубликаты (удалить!)
└── collections/         # Payload CMS collections
```

### Чекліст перед написанням коду:
- [ ] Шукав схожий функціонал в codebase?
- [ ] Вивчив патерни з схожих файлів?
- [ ] Перевикористовую існуючі компоненти/утиліти?
- [ ] Дотримуюся conventions проекту?

## Доступні скіли для підвищення якості

При виконанні задач ВИКОРИСТОВУЙ відповідні скіли:

| Задача | Скіл | Коли використовувати |
|--------|-------|---------------------|
| Node.js сервіс, патерни | `nodejs-backend-patterns` | Рефакторинг скраперов, pipeline, Telegram service |
| Error handling, retry | `error-handling-patterns` | Retry logic, graceful shutdown, error recovery |
| Складний дебагінг | `debugging-strategies` | MarkdownV2 баги, operator precedence, race conditions |
| Unit тести (Vitest) | `vitest` | Тесты для парсеров, planner, validators |
| Payload CMS | `payload` | Работа с collections, endpoints, access control |
| API дизайн | `api-design-principles` | Аутентификация endpoints, input validation |

## Правила інтеграції з CMS/API

### Payload CMS (backend-payload/)
- Collections: `src/collections/` -- Tyres, Dealers, Articles, Technologies, Media
- Endpoints: `src/endpoints/` -- кастомні REST endpoints
- Config: `payload.config.ts` -- реєстрація collections, plugins

### Content Automation (backend-payload/content-automation/)
- Scrapers -> Processors -> Publishers -- основной pipeline
- SQLite DB: `data/content-automation.db` -- article_queue, content_sources, test_results, article_settings
- JSON Storage: `data/prokoleso-tires.json` -- каталог шин
- Config: `config/env.ts` -- все переменные окружения

## Зависимости от других чеклистов

### backend-infra-improvements (выполнять ПЕРЕД или ПАРАЛЛЕЛЬНО):
- **Phase 1 (Security)**: Hardcoded credentials cleanup -- задачи 1.1 и 1.6 из этого чеклиста перенесены туда
- **Phase 4 (Scheduler Cleanup)**: Удаление ~25 мёртвых файлов из src/automation/ и рефакторинг scheduler.ts -- задачи 1.4, 4.3, 5.10 перенесены туда

### Порядок выполнения:
- Фазы 1-3 этого чеклиста можно выполнять ПАРАЛЛЕЛЬНО с backend-infra (разные директории)
- Фаза 4 (Telegram bot) -- после backend-infra Phase 4 (чтобы мёртвые файлы уже были удалены)
- Фаза 5 -- после backend-infra Phase 4

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
