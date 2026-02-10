# Backend & Infrastructure Improvements (Модули 13-16, 21-24)

## Цель

Объединённое исправление всех найденных проблем бэкенда, Payload CMS и инфраструктуры проекта Bridgestone Ukraine. Приведение системы к production-ready состоянию с устранением критических уязвимостей, оптимизацией Docker-развертывания, стабилизацией API, очисткой технического долга scheduler'а, подготовкой i18n-системы и настройкой мониторинга.

Источники:
- Модуль 13: Payload CMS Collections & Data Model
- Модуль 14: Content Generation API & Endpoints
- Модуль 15: Media Management & Image Processing
- Модуль 16: Provider Management & LLM Routing
- Модуль 21: Scheduler & Daemon
- Модуль 22: Docker & Deployment
- Модуль 23: i18n & Localization
- Модуль 24: Security & Access Control

## Критерии успеха

- [ ] Безопасность: устранены все критические уязвимости (command injection, PII exposure, privilege escalation, API key leak, XSS в email, hardcoded credentials)
- [ ] Access control: role-based доступ на Users, ContactSubmissions, ProviderSettings; isPublished фильтрация
- [ ] Все 14 незащищённых GET-эндпоинтов получили аутентификацию (кроме health checks)
- [ ] Rate limiting добавлен на критические эндпоинты
- [ ] Docker-контейнеры работают от non-root пользователя
- [ ] Secrets вынесены из docker-compose.yml в .env файл
- [ ] Restart policies и resource limits настроены для всех сервисов
- [ ] Data model: vehicleTypes mismatch исправлен, slug-генерация поддерживает кириллицу, publishedAt добавлен
- [ ] Тройное дублирование scheduler'а устранено; единый Payload-native scheduler
- [ ] ~25 мёртвых файлов из `src/automation/` удалены
- [ ] API: унифицированный job store, стандартный формат ответов, error handling
- [ ] Media: image optimization включена в production, shell injection исправлен
- [ ] Providers: fallbackModels работает, cost-tracker без race conditions, Google API key в заголовке
- [ ] CI/CD pipeline настроен через GitHub Actions (build + test + scan)
- [ ] Хардкодированные строки консолидированы (сезоны/типы авто)
- [ ] Мониторинг и health checks покрывают все сервисы
- [ ] Тесты: минимум unit-тесты для hooks, access control, jobStore, fallback-llm, cost-tracker; security tests
- [ ] Build: `npm run build` проходит без ошибок для backend и frontend

## Фазы работы

1. **Critical Security (P0)** -- устранение P0 уязвимостей: command injection, PII exposure, auth, credentials, XSS, rate limiting
2. **Docker & Deployment (P0/P1)** -- non-root контейнеры, secrets management, healthchecks, restart policies, resource limits, сетевая изоляция
3. **Data Model & Collections (P1)** -- vehicleTypes, Cyrillic slug, publishedAt, SeasonalContent, indexes, versions
4. **Scheduler Cleanup & Dead Code (P1)** -- удаление ~25 мёртвых файлов, единый Payload-native scheduler, фикс дефектов, SQLite оптимизация
5. **API Stabilization (P1/P2)** -- unified job store, rate limiting, concurrency, response format, error handling
6. **Media Optimization (P2)** -- image optimization, WebP/AVIF, mobile sizes, prompt templates
7. **Provider Improvements (P2/P3)** -- fallbackModels, cost-tracker, CircuitBreaker, OpenAICompatible base class
8. **CI/CD Pipeline (P2)** -- docker-compose split, security headers, GitHub Actions, image scanning
9. **i18n Migration (P2)** -- консолидация строк, типизация t(), плюрализация, slug кириллица
10. **Monitoring & Observability (P2/P3)** -- distributed lock, structured logging, audit log, Sentry, retry cron
11. **Testing & Documentation (P3)** -- unit-тесты hooks, access control, jobStore, fallback-llm, cost-tracker; security tests; integration tests

## Источники требований

| Отчёт | Файл |
|-------|------|
| Модуль 13: Payload CMS Collections | `plan/prompt/prompts_analysis/report/13_payload_collections_analysis_2026-02-09.md` |
| Модуль 14: Content Generation API | `plan/prompt/prompts_analysis/report/14_content_generation_api_analysis_2026-02-09.md` |
| Модуль 15: Media Management | `plan/prompt/prompts_analysis/report/15_media_management_analysis_2026-02-09.md` |
| Модуль 16: Provider Management | `plan/prompt/prompts_analysis/report/16_provider_management_analysis_2026-02-09.md` |
| Модуль 21: Scheduler & Daemon | `plan/prompt/prompts_analysis/report/21_scheduler_daemon_analysis_2026-02-09.md` |
| Модуль 22: Docker & Deployment | `plan/prompt/prompts_analysis/report/22_docker_deployment_analysis_2026-02-09.md` |
| Модуль 23: i18n & Localization | `plan/prompt/prompts_analysis/report/23_i18n_localization_analysis_2026-02-09.md` |
| Модуль 24: Security & Access Control | `plan/prompt/prompts_analysis/report/24_security_access_control_analysis_2026-02-09.md` |

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** -- перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** -- вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** -- використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
backend-payload/
├── src/
│   ├── collections/         # Payload collections (Tyres, Articles, Media, Users...)
│   ├── endpoints/           # REST API endpoints (auth patterns)
│   ├── hooks/               # Payload hooks
│   ├── fields/              # Custom field definitions
│   ├── components/          # Admin UI components
│   ├── automation/          # Legacy automation (для удаления)
│   │   └── jobs/scheduler.ts # Payload-native scheduler (оставить)
│   └── scheduler/           # (после перемещения из automation/jobs/)
├── content-automation/      # Active automation pipeline
│   └── src/
│       ├── providers/       # AI provider implementations
│       ├── processors/      # Content generation
│       ├── scrapers/        # Data scrapers
│       ├── publishers/      # CMS publishing
│       ├── config/          # Configuration files
│       └── utils/           # Logger, metrics, retry
├── scripts/
│   └── seed.ts              # Database seeding
├── Dockerfile               # Backend Docker build
└── payload.config.ts        # Main Payload configuration

frontend/
├── src/
│   ├── app/                 # App Router pages
│   ├── components/          # UI components
│   ├── middleware.ts         # Basic Auth middleware
│   └── lib/
│       ├── i18n/            # i18n system (uk.ts, index.ts)
│       ├── api/             # API layer
│       └── utils/           # Utility functions
├── Dockerfile               # Frontend Docker build
└── next.config.ts           # Security headers, i18n config

docker-compose.yml           # Orchestration (root level)
```

### Чекліст перед написанням коду:
- [ ] Шукав схожий функціонал в codebase?
- [ ] Вивчив патерни з схожих файлів?
- [ ] Перевикористовую існуючі компоненти/утиліти?
- [ ] Дотримуюся conventions проекту?

## Доступні скіли для підвищення якості

### Backend / CMS
| Задача | Скіл | Коли використовувати |
|--------|-------|---------------------|
| Payload collections, hooks, access | `payload` | При роботі з колекціями та хуками |
| REST/GraphQL API дизайн | `api-design-principles` | При роботі з ендпоінтами |
| Node.js сервіс | `nodejs-backend-patterns` | При рефакторингу бекенд-логіки |
| SQL оптимізація | `sql-optimization-patterns` | При додаванні індексів, SQLite |

### Infrastructure / DevOps
| Задача | Скіл |
|--------|-------|
| CI/CD GitHub Actions | `github-actions-templates` |
| Управление секретами | `secrets-management` |
| Дизайн deployment pipeline | `deployment-pipeline-design` |
| Обработка данных GDPR | `gdpr-data-handling` |

### Якість
| Задача | Скіл |
|--------|-------|
| Unit тести | `vitest` |
| E2E тести (Playwright) | `e2e-testing-patterns` |
| Складний дебагінг | `deep-debug` |
| Аудит залежностей | `dependency-audit` |

## Правила інтеграції з CMS/API

### Payload CMS (backend-payload/)
- Collections: `src/collections/` -- Tyres, Dealers, Articles, Technologies, Media, Reviews, SeasonalContent, ProviderSettings, TaskRouting, ContactSubmissions, Users
- Endpoints: `src/endpoints/` -- кастомні REST endpoints (34 endpoints)
- Config: `payload.config.ts` -- реєстрація collections, plugins, endpoints, CORS, CSRF
- При роботі з CMS використовуй скіл `payload`

### При зміні collection (backend):
1. Онови файл в `backend-payload/src/collections/`
2. Перевір реєстрацію в `payload.config.ts`
3. Перевір access control (roles: admin/editor)
4. Перевір hooks (beforeChange, afterChange)
5. Онови seed.ts якщо потрібно

### При зміні endpoints:
1. Онови файл в `backend-payload/src/endpoints/`
2. Перевір аутентифікацію (`req.user` check)
3. Перевір валідацію вхідних даних
4. Перевір формат відповіді

### Чекліст:
- [ ] Access control налаштовано на collection level?
- [ ] Всі endpoints мають auth перевірку?
- [ ] Input validation реалізована (zod або manual)?
- [ ] PII не потрапляє в логи?
- [ ] exec() замінений на execFile() або programmatic API?

## Зависимости между фазами

**ВАЖНО:** Фаза 4 (Scheduler Cleanup) ДОЛЖНА быть выполнена ДО Automation-чеклиста фазы Telegram, т.к. удаляет файлы-дубли из `src/automation/`.

```
Phase 1 (Security) ──────────────────────────────────┐
Phase 2 (Docker) ────────────────────────────────────>├──> Phase 5 (API)
Phase 3 (Data Model) ───────────────────────────────>│
Phase 4 (Scheduler) ── блокирует Automation Ph.4 ──>│
                                                      │
Phase 5 (API) ───────────────────────────────────────>├──> Phase 8 (CI/CD)
Phase 6 (Media) ─────────────────────────────────────>│    Phase 9 (i18n)
Phase 7 (Providers) ─────────────────────────────────>│    Phase 10 (Monitoring)
                                                      │
Phase 8-10 ──────────────────────────────────────────>└──> Phase 11 (Testing)
```

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
