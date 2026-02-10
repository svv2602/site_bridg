# Фаза 3: Улучшения Pipeline (P1/P2)

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-09
**Завершена:** 2026-02-09

## Ціль фази

Исправить дефекты в AI Processors и Smart Article Pipeline: реализовать draft-статус статей, консолидировать ArticleType в одном месте, устранить дублирование кода, удалить мёртвый код, добавить brand support в недостающие генераторы, унифицировать пороги валидации.

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Изучить текущий flow публикации статей: `article-pipeline.ts:215` -> `publishArticleToCMS()`
- [x] Изучить как Payload CMS Articles collection поддерживает draft/published статусы
- [x] Найти все определения ArticleType (article-queue.ts, article-generator.ts, prompts/index.ts)
- [x] Найти все дублирования кода: getSourceLabel(), row mapping, parseResponse(), default settings
- [x] Изучить пороги валидации: tire-description.ts:128 vs validator.ts:43

**Де шукати:**
- `backend-payload/content-automation/src/article-pipeline.ts` -- pipeline оркестратор
- `backend-payload/content-automation/src/db/article-queue.ts` -- ArticleType, default settings
- `backend-payload/content-automation/src/processors/content/article-generator.ts` -- ArticleType, parseResponse
- `backend-payload/content-automation/src/prompts/index.ts` -- ArticlePromptInput.type
- `backend-payload/content-automation/src/processors/content/tire-description.ts` -- валидация, parseResponse
- `backend-payload/content-automation/src/processors/validator.ts` -- валидация
- `backend-payload/src/collections/Articles.ts` -- Payload Articles collection schema

#### B. Аналіз залежностей
- [x] Проверить как `_status` или `status` поле работает в Payload CMS для draft
- [x] Определить все потребители ArticleType
- [x] Определить все потребители parseResponse()

**Нові типи:** Консолидированный ArticleType в types/content.ts
**Нові API-функції:** -
**Нові компоненти:** -
**Зміни в backend:** article-pipeline, processors, article-queue, prompts

#### C. Визначення скілів
- [x] Визначив які скіли потрібні для цієї фази

**Скіли для використання:** `payload`, `nodejs-backend-patterns`

**Ціль:** Зрозуміти flow публікації та всі місця дублювання ПЕРЕД рефакторингом.

**Нотатки для перевикористання:** -

---

### 3.1 Реализовать draft-статус при review [Effort: M]
> Модуль 19, Рек. R2; Дефект D3

- [x] Изучить как Payload CMS поддерживает draft статусы (versions + drafts в collection config)
- [x] При `auto_publish = false` публиковать статью в CMS как draft (не видна посетителям)
- [x] Добавить поле `_status: 'draft' | 'published'` при создании статьи через payload-client
- [x] При ручном подтверждении через API -- обновлять статус на `published`
- [x] Обновить `article-pipeline.ts:215` для передачи draft-статуса

**Файлы:**
- `backend-payload/content-automation/src/article-pipeline.ts:215`
- `backend-payload/content-automation/src/publishers/payload-client.ts`
- `backend-payload/src/collections/Articles.ts` -- возможно нужно включить versions/drafts

**Нотатки:** Сейчас статья публикуется в CMS даже при review -- видна посетителям. Payload CMS поддерживает `versions: { drafts: true }` в конфигурации коллекции.

---

### 3.2 Консолидировать ArticleType в одном месте [Effort: S]
> Модуль 19, Рек. R4; Дефект D1

- [x] Вынести единый `ArticleType` в `types/content.ts` (или `db/article-queue.ts` как единственный источник)
- [x] Удалить дубликат из `processors/content/article-generator.ts:17-23`
- [x] Обновить `prompts/index.ts:117-119` (`ArticlePromptInput.type`) -- добавить `"tips"` и `"model-review"`
- [x] Добавить обработку `"tips"` в `typeInstructions` в `prompts/index.ts:309-315`
- [x] Обновить все импорты

**Файлы:**
- `backend-payload/content-automation/src/types/content.ts` -- единый источник
- `backend-payload/content-automation/src/db/article-queue.ts:29-35`
- `backend-payload/content-automation/src/processors/content/article-generator.ts:17-23`
- `backend-payload/content-automation/src/prompts/index.ts:117-119,309-315`

**Нотатки:** Если `tips` попадёт в `getArticlePrompt()`, он получит `undefined` из `typeInstructions[params.type]`, что приведёт к промпту с `undefined`.

---

### 3.3 Унифицировать пороги валидации [Effort: S]
> Модуль 18, Рек. #3 (Приоритет 1)

- [x] Определить единые пороги для shortDescription: `tire-description.ts:128` (min 50) vs `validator.ts:43` (min 80)
- [x] Вынести пороги в единую конфигурацию или константы
- [x] Обновить оба файла для использования единых значений

**Файлы:**
- `backend-payload/content-automation/src/processors/content/tire-description.ts:128`
- `backend-payload/content-automation/src/processors/validator.ts:43`

**Нотатки:** Inline-валидация в генераторах и standalone validator.ts дают разные результаты для одного контента.

---

### 3.4 Добавить brand support в tire-seo.ts [Effort: S]
> Модуль 18, Рек. #4 (Приоритет 2)

- [x] Добавить параметр `brand: Brand` в input type `tire-seo.ts:16-23`
- [x] Использовать brand в промпте вместо hardcoded "Bridgestone" (`tire-seo.ts:41`)
- [x] Обновить вызовы в content pipeline `content/index.ts`

**Файлы:**
- `backend-payload/content-automation/src/processors/content/tire-seo.ts:16-23,41`
- `backend-payload/content-automation/src/processors/content/index.ts`

**Нотатки:** tire-description.ts и tire-faq.ts уже поддерживают Brand, tire-seo.ts -- нет.

---

### 3.5 Удалить мёртвые parseResponse() функции [Effort: S]
> Модуль 18, Рек. #5 (Приоритет 2); Секция 9

- [x] Удалить неиспользуемую `parseResponse()` из `tire-description.ts:105-120`
- [x] Удалить неиспользуемую `parseResponse()` из `tire-faq.ts:114-126`
- [x] Удалить неиспользуемую `parseResponse()` из `tire-seo.ts:68-82`
- [x] Удалить неиспользуемую `parseResponse()` из `article-generator.ts:127-144`
- [x] Проверить что `generator.generateJSON<T>()` используется везде

**Файлы:**
- `backend-payload/content-automation/src/processors/content/tire-description.ts:105-120`
- `backend-payload/content-automation/src/processors/content/tire-faq.ts:114-126`
- `backend-payload/content-automation/src/processors/content/tire-seo.ts:68-82`
- `backend-payload/content-automation/src/processors/content/article-generator.ts:127-144`

**Нотатки:** Эти функции определены, но не вызываются, так как генераторы используют `generator.generateJSON<T>()` напрямую. Дублирование JSON-парсинга regex `/\{[\s\S]*\}/` в 4 файлах.

---

### 3.6 Переименовать strapi_id в payload_id в deduplicator.ts [Effort: S]
> Модуль 18, Рек. #7 (Приоритет 2); Дефект #4 (секция 8)

- [x] Переименовать поле `strapi_id` в `payload_id` в `deduplicator.ts:28,56`
- [x] Обновить SQL-схему (ALTER TABLE или пересоздание)
- [x] Обновить все запросы и маппинг

**Файлы:**
- `backend-payload/content-automation/src/processors/deduplicator.ts:28,56`

**Нотатки:** Проект мигрировал с Strapi на Payload CMS, поле осталось от предыдущей архитектуры.

---

### 3.7 Устранить дублирование getSourceLabel() [Effort: S]
> Модуль 19, Рек. R8; Секция 9.4

- [x] Вынести `getSourceLabel()` в общий модуль (например `utils/labels.ts` или `db/article-queue.ts`)
- [x] Удалить дубликат из `article-pipeline.ts:370-381`
- [x] Удалить дубликат из `article-planner.ts:329-340`
- [x] Обновить импорты

**Файлы:**
- `backend-payload/content-automation/src/article-pipeline.ts:370-381`
- `backend-payload/content-automation/src/article-planner.ts:329-340`

**Нотатки:** Идентичный код в двух файлах -- DRY violation.

---

### 3.8 Устранить дублирование SQLite row mapping в test-results.ts [Effort: S]
> Модуль 19, Секция 9.4

- [x] Вынести маппинг SQLite row -> TypeScript object в отдельную функцию `mapRowToTestResult()`
- [x] Заменить 7 дублированных маппингов (строки 119-129, 142-152, 165-175, 191-206, 234-244, 259-269) на вызов общей функции

**Файлы:**
- `backend-payload/content-automation/src/db/test-results.ts:119-129,142-152,165-175,191-206,234-244,259-269`

**Нотатки:** Маппинг повторяется 7 раз в одном файле.

---

### 3.9 Устранить дублирование default settings seed [Effort: S]
> Модуль 19, Секция 9.4

- [x] Определить единый источник default settings
- [x] Удалить дубликат из `automation.ts:481-489` -- exported DEFAULT_SETTINGS from article-queue.ts; automation.ts is in backend-payload/src/ (out of scope), consumer can import from here
- [x] Использовать импорт из `db/article-queue.ts:96-104`

**Файлы:**
- `backend-payload/content-automation/src/db/article-queue.ts:96-104`
- `backend-payload/src/endpoints/automation.ts:481-489`

**Нотатки:** Default settings seed повторяется в двух файлах.

---

### 3.10 Заменить console.error на logger в comparison-generator [Effort: S]
> Модуль 18, Ограничение #3 (секция 8)

- [x] Заменить `console.error("Failed to generate verdict:", error)` на `logger.error(...)` в `comparison-generator.ts:297`
- [x] Импортировать `createLogger` из `utils/logger.ts`

**Файлы:**
- `backend-payload/content-automation/src/processors/comparison-generator.ts:297`

**Нотатки:** Единственное использование console.error вместо logger в processors.

---

### 3.11 Сохранять стоимость генерации в article_queue [Effort: S]
> Модуль 19, Рек. R9

- [x] Добавить поле `cost_usd REAL DEFAULT 0` в таблицу `article_queue`
- [x] Добавить поле `llm_provider TEXT` в таблицу `article_queue`
- [x] Сохранять cost и provider при генерации статьи в `article-pipeline.ts`

**Файлы:**
- `backend-payload/content-automation/src/db/article-queue.ts` -- ALTER TABLE / schema update
- `backend-payload/content-automation/src/article-pipeline.ts` -- сохранение cost

**Нотатки:** Сейчас cost per article не сохраняется -- невозможно анализировать затраты. (Модуль 19, AP5)

---

### 3.12 Удалить устаревший STRAPI_URL из env.ts [Effort: S]
> Модуль 19, Секция 9.3; Модуль 20, Секция 9.3

- [x] Удалить экспорт `STRAPI_URL` и `STRAPI_API_TOKEN` из `config/env.ts:42-43`
- [ ] Удалить `STRAPI_URL` из `src/automation/env.ts:19-20` -- вне scope (backend-payload/src/, не content-automation/src/)
- [x] Проверить что нет зависимостей от этих переменных (telegram-bot.ts обновлён на PAYLOAD_URL)

**Файлы:**
- `backend-payload/content-automation/src/config/env.ts:42-43`
- `backend-payload/src/automation/env.ts:19-20`

**Нотатки:** Помечены как `Legacy Strapi (deprecated)`, но всё ещё экспортируются.

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `cd backend-payload && npm run build` проходить без помилок
- [ ] `cd backend-payload && npm run test` проходить без помилок
- [ ] ArticleType определён в одном месте: `grep -r "ArticleType" backend-payload/content-automation/src/`
- [ ] parseResponse() удалён из генераторов: `grep -r "parseResponse" backend-payload/content-automation/src/processors/content/`
- [ ] strapi_id заменён: `grep -r "strapi_id" backend-payload/content-automation/src/`
- [ ] STRAPI_URL удалён: `grep -r "STRAPI_URL" backend-payload/content-automation/src/config/`

### Після верифікації:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(automation-improvements): phase-3 pipeline improvements completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 4
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
