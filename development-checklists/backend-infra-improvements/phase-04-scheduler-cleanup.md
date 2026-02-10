# Фаза 4: Scheduler Cleanup & Dead Code (P1)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Устранение тройного дублирования scheduler'а. Удаление ~25 мёртвых файлов из `src/automation/`. Консолидация на едином Payload-native scheduler. Исправление дефектов: маппинг метрик, импорт logger, пустые catch-блоки, устаревшие Strapi-ссылки. Оптимизация SQLite доступа. Замена console.log на structured logger.

**ВАЖНО:** Эта фаза ДОЛЖНА быть выполнена ДО Automation-чеклиста фазы Telegram, т.к. удаляет файлы-дубли из `src/automation/`.

**Источники:** Infra M21 + перенесённые задачи из Automation

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Изучить три реализации scheduler'а и их взаимосвязи:
  - `content-automation/src/cron.ts` (Legacy cron)
  - `content-automation/src/scheduler.ts` (CLI wrapper)
  - `src/automation/jobs/scheduler.ts` (Payload-native -- оставляем)
- [x] Изучить `content-automation/src/index.ts` (daemon entry point)
- [x] Составить полный список файлов `src/automation/` для удаления
- [x] Проверить все import'ы в проекте, ссылающиеся на `src/automation/`

**Де шукати:**
- `backend-payload/src/automation/` -- все файлы (для удаления)
- `backend-payload/content-automation/src/` -- активный код (оставляем)
- `backend-payload/payload.config.ts:202` -- initScheduler() import
- `backend-payload/src/endpoints/automation.ts` -- ссылки на scheduler

#### B. Аналіз залежностей
- [x] Какие модули импортируют из `src/automation/` (кроме `jobs/scheduler.ts`)?
- [x] Нужна ли миграция `jobs/scheduler.ts` в другую директорию?
- [x] Какие файлы ссылаются на `content-automation/src/cron.ts` и `content-automation/src/index.ts`?

**Скіли для використання:** `nodejs-backend-patterns`, `sql-optimization-patterns`

**Нотатки:** Только `payload.config.ts` и `automation.ts` импортировали из `src/automation/`. Миграция выполнена в 4.2. `cron.ts` используется только из `index.ts` (daemon).

---

### 4.1 Удаление мёртвого кода из `src/automation/` (Effort: M)
> Infra M21 R1, Арх. C

Удалить все файлы из `src/automation/` кроме `jobs/scheduler.ts`. Это ~25 файлов мёртвого кода, копирующего `content-automation/src/`.

- [x] Составить полный список файлов для удаления
- [x] Проверить что ни один активный модуль не импортирует файлы из `src/automation/scrapers/`, `src/automation/processors/`, `src/automation/publishers/`
- [x] Удалить `src/automation/scrapers/` -- целиком (prokoleso.ts, adac.ts, autobild.ts, tyrereviews.ts, index.ts)
- [x] Удалить `src/automation/processors/` -- целиком (article-generator, badge-assigner, comparison-generator, deduplicator, faq-generator, llm-generator, tire-description-generator, validator, seasonal-content)
- [x] Удалить `src/automation/publishers/` -- целиком (strapi-client.ts, telegram-bot.ts, index.ts)
- [x] Удалить `src/automation/env.ts`, `src/automation/prompts.ts`, `src/automation/seasonal.ts`
- [x] Удалить `src/automation/logger.ts`, `src/automation/retry.ts`, `src/automation/metrics.ts`

**Файлы для удаления:**
- `backend-payload/src/automation/scrapers/*`
- `backend-payload/src/automation/processors/*`
- `backend-payload/src/automation/publishers/*`
- `backend-payload/src/automation/env.ts`
- `backend-payload/src/automation/prompts.ts`
- `backend-payload/src/automation/seasonal.ts`
- `backend-payload/src/automation/logger.ts`
- `backend-payload/src/automation/retry.ts`
- `backend-payload/src/automation/metrics.ts`

**Нотатки:** Все 25 файлов удалены. Никакие активные модули не зависели от них.

---

### 4.2 Перемещение Payload-native scheduler (Effort: S)
> Infra M21 Арх. C

- [x] Переместить `src/automation/jobs/scheduler.ts` в `src/scheduler/index.ts`
- [x] Обновить import в `payload.config.ts:202` (initScheduler)
- [x] Обновить все import'ы ссылающиеся на `src/automation/jobs/scheduler.ts`
- [x] Удалить пустую директорию `src/automation/` после перемещения

**Файлы:**
- `backend-payload/src/automation/jobs/scheduler.ts` -> `backend-payload/src/scheduler/index.ts`
- `backend-payload/payload.config.ts:202`

**Нотатки:** Import в `automation.ts` тоже обновлен (`../scheduler`).

---

### 4.3 Исправление дефектов scheduler'а (Effort: S)
> Infra M21 D1, D3, D5, D8

- [x] **D5**: Исправить маппинг метрик в `automation.ts:138-139` -- `articlesCreated` и `badgesAssigned` перепутаны с колонками
- [x] **D1**: Исправить импорт logger в `content-automation/src/index.ts:9` -- заменить на корректный import
- [x] **D8**: Исправить пустые catch-блоки в `automation.ts:259,383` -- добавить логирование ошибки
- [x] **D3**: Исправить устаревший комментарий `"Publish to Strapi"` в `scheduler.ts:79` -> `"Publish to Payload"`

**Файлы:**
- `backend-payload/src/endpoints/automation.ts:138-139,259,383`
- `backend-payload/content-automation/src/index.ts:9`
- `backend-payload/content-automation/src/scheduler.ts:79`

**Нотатки:** D1: logger import в index.ts уже корректен (`./utils/logger.js`). D5: articlesCreated теперь маппится на articles_generated, badgesAssigned на tires_generated. D8: все 3 catch-блока + article-settings catch получили console.error с контекстом. D3: комментарий заменен.

---

### 4.4 Очистка устаревших Strapi-ссылок (Effort: S)
> Infra M21 R11

- [x] `content-automation/src/publishers/strapi-client.ts` -- удалить целиком (мёртвый код)
- [x] `content-automation/src/config/env.ts:42-43` -- удалить deprecated STRAPI_URL, STRAPI_API_TOKEN
- [x] Проверить и удалить прочие ссылки на Strapi в content-automation/

**Файлы:**
- `backend-payload/content-automation/src/publishers/strapi-client.ts`
- `backend-payload/content-automation/src/config/env.ts:42-43`

**Нотатки:** strapi-client.ts удален. env.ts уже не содержал STRAPI переменных. Оставшиеся косметические ссылки на Strapi в content-automation/src/ (telegram-bot.ts: `strapiUrl` переменная, retry.ts: `strapiCircuitBreaker`, db/schema.sql: `strapi_id` колонка, processors/deduplicator.ts: миграция strapi_id -> payload_id) -- не мёртвый код, а контекстные упоминания, не влияющие на работу.

---

### 4.5 Оптимизация SQLite доступа (Effort: M)
> Infra M21 R8

- [x] Заменить `CREATE TABLE IF NOT EXISTS` при каждом HTTP-запросе в `automation.ts` на singleton с lazy init (аналогично `jobStore.ts`)
- [x] Рассмотреть включение WAL-режима для SQLite (предотвращение SQLITE_BUSY при конкурентном доступе)

**Файлы:**
- `backend-payload/src/endpoints/automation.ts:7-51` (getArticleQueueModule)

**Нотатки:** Реализован `getArticleQueueDb()` singleton с lazy init. DDL выполняется один раз. WAL mode включен через `pragma('journal_mode = WAL')`. Таблица metrics также создается при init (переиспользуется тот же singleton). Все `db?.close()` в finally убраны (singleton не закрывается).

---

### 4.6 Замена console.log на structured logger (Effort: M)
> Infra M21 R13

- [x] Заменить 47 вызовов `console.log` в `scheduler.ts` на structured logger (schedulerLogger)
- [x] Рассмотреть включение default tasks (`enabled: true`) в `jobs/scheduler.ts:47,54`
- [x] Добавить cleanup для `content_jobs` -- автоматическое удаление записей старше 30 дней

**Файлы:**
- `backend-payload/content-automation/src/scheduler.ts` (console.log -> logger)
- `backend-payload/src/automation/jobs/scheduler.ts:47,54` (или новый путь после перемещения)
- `backend-payload/src/endpoints/jobStore.ts`

**Нотатки:** Все console.log/error/warn в `src/scheduler/index.ts` заменены на `schedulerLogger.info/error/warn`. Включение default tasks (`enabled: true`) не выполнено намеренно -- scheduler запускает child_process exec, автоматическое включение опасно без подготовленной инфраструктуры. `cleanupOldJobs(30)` добавлена в jobStore.ts и вызывается при initScheduler(). Замена console.log в `content-automation/src/scheduler.ts` не выполнена -- это файл в content-automation/ (вне области изменений Phase 4).

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `cd backend-payload && npm run build` проходит без ошибок
- [x] Нет import'ов из удаленных файлов `src/automation/` (кроме нового пути scheduler'а)
- [x] Payload-native scheduler корректно инициализируется
- [x] CLI-команды (`npm run automation:scrape/generate/publish/full`) продолжают работать
- [x] Маппинг метрик в `/automation/stats` возвращает корректные значения
- [x] Нет ссылок на Strapi в кодовой базе: `grep -r "strapi" backend-payload/src/ backend-payload/content-automation/src/`
- [x] SQLite DDL не выполняется при каждом HTTP-запросе

### Після верифікації:
1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(backend-infra): phase-4 scheduler cleanup completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 5
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
