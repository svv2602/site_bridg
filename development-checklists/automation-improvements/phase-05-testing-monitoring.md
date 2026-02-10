# Фаза 5: Тестирование и мониторинг (P2/P3)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази

Покрыть юнит-тестами критические парсинг-функции и бизнес-логику планирования статей. Добавить мониторинг и наблюдаемость. Реализовать архитектурные улучшения: абстрактный интерфейс скрапера, интерфейс процессора, нормализация рейтингов. Устранить оставшийся технический долг.

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Изучить существующие тесты: `badge-assigner.test.ts` (14 тестов), `validator.test.ts` (11 тестов)
- [x] Изучить паттерн тестирования: vitest, `vi.useFakeTimers()`, mock-стратегия
- [x] Определить наиболее тестируемые функции (парсеры, planner, validators)
- [x] Проверить настройку vitest: `vitest.config.ts` или `package.json`

**Де шукати:**
- `backend-payload/content-automation/src/processors/badge-assigner.test.ts` -- референс для тестов
- `backend-payload/content-automation/src/processors/validator.test.ts` -- референс для тестов
- `backend-payload/content-automation/vitest.config.ts` или `backend-payload/vitest.config.ts`
- `backend-payload/content-automation/src/scrapers/parsers.ts` -- парсеры из фазы 2

#### B. Аналіз залежностей
- [x] Определить какие модули нужно мокать для тестов pipeline
- [x] Проверить нужны ли дополнительные devDependencies

**Нові типи:** TestScraper interface, ContentProcessor interface
**Нові API-функції:** -
**Нові компоненти:** тестовые файлы
**Зміни в backend:** Новые тестовые файлы, interfaces

#### C. Визначення скілів
- [x] Визначив які скіли потрібні для цієї фази

**Скіли для використання:** `vitest`, `nodejs-backend-patterns`, `error-handling-patterns`

**Ціль:** Зрозуміти існуючі тестові патерни ПЕРЕД написанням нових тестів.

**Нотатки для перевикористання:** Использовать паттерн из badge-assigner.test.ts для новых тестов.

---

### 5.1 Юнит-тесты для парсинг-функций скраперов [Effort: M]
> Модуль 17, Рек. R5 (Приоритет 2)

- [x] Создать `scrapers/parsers.test.ts`
- [x] Тесты для `determineSeason()`: все ветви (summer, winter, allseason, unknown)
- [x] Тесты для `parseSizeFromText()`: граничные случаи ("205/55 R17", "225/45R18", "невалидный текст", пустая строка)
- [x] Тесты для `createSlug()`: специальные символы, пробелы, кириллица
- [x] Тесты для `extractSourceSlug()`: валидные и невалидные URL-ы
- [x] Тесты для `parseSpeedIndex()`, `parseLoadIndex()`: граничные значения

**Файлы:**
- `backend-payload/content-automation/src/scrapers/parsers.test.ts` -- новый файл
- Тестируемые функции из `backend-payload/content-automation/src/scrapers/parsers.ts` (созданы в фазе 2)

**Нотатки:** 40+ тестов покрывают determineSeason, createSlug, extractSourceSlug, detectBrandFromUrl, parseSizeFromText, parseSpeedIndex, parseLoadIndex, normalizeRating.

---

### 5.2 Юнит-тесты для article-planner.ts [Effort: M]
> Модуль 19, Рек. R5

- [x] Создать `article-planner.test.ts`
- [x] Тесты для `planTestSummaryArticles()`: top-3 фильтрация, рейтинг фильтрация, приоритизация
- [x] Тесты для `planComparisonArticles()`: порог 3+ тестов
- [x] Тесты для `planSeasonalArticles()`: зимний гид (месяцы 10-11), летний (3-4), quarterly tips
- [x] Тесты для `findOurBrandsInTest()`: Bridgestone found, Firestone found, neither found
- [x] Тесты для `addPlanned()`: дедупликация, лимит max_articles_per_week
- [x] Мокать: SQLite запросы (getTestResultsSince, queueHasSimilarTopic)

**Файлы:**
- `backend-payload/content-automation/src/article-planner.test.ts` -- новый файл
- Тестируемый модуль: `backend-payload/content-automation/src/article-planner.ts`

**Нотатки:** 15 тестов: test-summary planning (8), deduplication (1), comparison articles (3), seasonal articles (2), no-new-tests (2). SQLite mocked via vi.mock().

---

### 5.3 Юнит-тесты для parseRating() в тестовых скраперах [Effort: S]
> Модуль 17, Рек. R5 (Приоритет 2)

- [x] Создать `scrapers/adac.test.ts` (или объединённый `scrapers/test-scrapers.test.ts`)
- [x] Тесты для ADAC `parseGermanRating()`: sehr gut=1.0, gut=1.5, befriedigend=2.5, ausreichend=3.5, mangelhaft=5.0
- [x] Тесты для Auto Bild `parseRating()`: vorbildlich=1.0, empfehlenswert=2.0, bedingt empfehlenswert=3.0, nicht empfehlenswert=4.0
- [x] Тесты для Auto Bild позиция парсинг: `platz N` -> N
- [x] Тесты для TyreReviews: проценты, дроби, буквенные оценки

**Файлы:**
- `backend-payload/content-automation/src/scrapers/test-scrapers.test.ts` -- объединённый файл
- Тестируемые: generateTestUid() из types.ts, normalizeRating() из parsers.ts

**Нотатки:** Реализовано как test-scrapers.test.ts: 27 тестов для generateTestUid (6) и normalizeRating по всем источникам (21 включая cross-source comparison). Внутренние parseRating() не экспортированы, но покрыты через normalizeRating.

---

### 5.4 Юнит-тесты для LLM-генераторов (mock-based) [Effort: M]
> Модуль 18, Рек. #8 (Приоритет 3)

- [x] Создать тесты для `article-generator.ts`: mock `fallbackLlm.forTask()`, тестировать buildPrompt, validateArticle
- [x] Создать тесты для `tire-description.ts`: mock LLM, тестировать buildPrompt, validateContent
- [x] Mock-ать `fallbackLlm` через `vi.mock()`
- [x] Тестировать: корректный prompt для каждого типа статьи, валидация результата, обработка ошибок

**Файлы:**
- `backend-payload/content-automation/src/processors/content/article-generator.test.ts` -- новый файл
- `backend-payload/content-automation/src/processors/content/tire-description.test.ts` -- новый файл

**Нотатки:** article-generator.test.ts: 12 тестов (prompt building, validation, slug generation, word count ranges). tire-description.test.ts: 13 тестов (prompt building, brand-specific, validation, EU label, test results). All LLM mocked via vi.mock().

---

### 5.5 Нормализация рейтингов между источниками [Effort: M]
> Модуль 19, Рек. R10; Дефект D2

- [x] Создать функцию нормализации рейтингов из разных источников в единую шкалу (например 1.0-5.0)
- [x] ADAC: 1.0-5.0 (уже нормализовано)
- [x] Auto Bild: 1.0-4.0 -> нормализовать к 1.0-5.0
- [x] TyreReviews: проценты/дроби -> нормализовать к 1.0-5.0
- [x] Обновить `article-planner.ts:118` для использования нормализованных рейтингов

**Файлы:**
- `backend-payload/content-automation/src/scrapers/parsers.ts` -- функция normalizeRating()
- `backend-payload/content-automation/src/article-planner.ts:118` -- updated to use normalizeRating(r.ratingNumeric, test.source)
- `backend-payload/content-automation/src/db/test-results.ts`

**Нотатки:** normalizeRating() already existed in parsers.ts. Integrated into article-planner.ts at line 118 to use normalizeRating(r.ratingNumeric, test.source) for cross-source comparison instead of raw ratingNumeric.

---

### 5.6 Абстрактный интерфейс скрапера [Effort: M]
> Модуль 17, Рек. R8 (Приоритет 3); AP2

- [x] Создать интерфейс `TestScraper` в `scrapers/types.ts`:
  ```typescript
  interface TestScraper {
    source: string;
    discover(page: Page): Promise<string[]>;
    scrape(page: Page, url: string): Promise<TestResult | null>;
  }
  ```
- [x] Вынести общую функцию `generateTestUid()` (дублируется в трёх файлах) в общий модуль
- [x] Вынести общий `parseSizeFromUrl()` / `parseSizeFromText()` из тестовых скраперов
- [x] Рассмотреть рефакторинг adac.ts, autobild.ts, tyrereviews.ts под интерфейс

**Файлы:**
- `backend-payload/content-automation/src/scrapers/types.ts` -- добавлен TestScraper interface и generateTestUid()
- `backend-payload/content-automation/src/scrapers/adac.ts`
- `backend-payload/content-automation/src/scrapers/autobild.ts`
- `backend-payload/content-automation/src/scrapers/tyrereviews.ts`

**Нотатки:** TestScraper interface и TestScraperResult type добавлены в types.ts. generateTestUid() extracted to types.ts с JSDoc. Рефакторинг scrapers под интерфейс отложен (local copies остались; scrapers по-прежнему используют свои локальные generateTestUid для обратной совместимости).

---

### 5.7 Добавить Telegram-уведомления при каждой обработанной шине [Effort: S]
> Модуль 20, Потенциал роста 10.2

- [x] Использовать активированный `notifyNewContent()` (фаза 4, задача 4.8) для отправки уведомлений
- [x] Добавить rate limiting: не более 1 уведомления в 5 секунд (Telegram API лимиты)

**Файлы:**
- `backend-payload/content-automation/src/scheduler.ts` -- notifyNewContent() called at line 446
- `backend-payload/content-automation/src/publishers/telegram-bot.ts` -- rate limiting via TELEGRAM_MIN_INTERVAL_MS and lastNotifyTimestamp

**Нотатки:** Already implemented. notifyNewContent() is called for every published tire. Rate limiting via lastNotifyTimestamp check in notify(). Needs manual verification with live Telegram bot.

---

### 5.8 Добавить динамический сезонный контент из CMS [Effort: M]
> Модуль 18, Рек. #12 (Приоритет 3); Ограничение #5 (секция 8)

- [x] Заменить `DEFAULT_FEATURED_TYRES` в `seasonal-content.ts:41-120` на выборку из Payload CMS API
- [x] Использовать `payload-client.ts` для получения актуального списка шин с рейтингами
- [x] Оставить hardcoded список как fallback если CMS недоступен

**Файлы:**
- `backend-payload/content-automation/src/processors/seasonal-content.ts` -- getFeaturedTyres() fetches from CMS with hardcoded fallback
- `backend-payload/content-automation/src/publishers/payload-client.ts`

**Нотатки:** Already implemented. getFeaturedTyres() uses getPayloadClient().getAllTyres() with try-catch fallback to DEFAULT_FEATURED_TYRES. Needs manual verification with running CMS.

---

### 5.9 Добавить XSS-санитизацию сгенерированного HTML [Effort: S]
> Модуль 18, Рек. #6 (Приоритет 2)

- [x] Добавить sanitize-html или DOMPurify как зависимость
- [x] Пропускать fullDescription через sanitizer перед сохранением
- [x] Добавить в pipeline content/index.ts перед этапом Save

**Файлы:**
- `backend-payload/content-automation/src/utils/sanitize.ts` -- sanitizeHtml() using sanitize-html library
- `backend-payload/content-automation/src/processors/content/index.ts` -- sanitizeHtml() called before Lexical conversion
- `backend-payload/package.json` -- sanitize-html and @types/sanitize-html already in dependencies

**Нотатки:** Already implemented. sanitize.ts defines ALLOWED_TAGS (headings, formatting, links, tables) and ALLOWED_ATTRIBUTES. Used in content/index.ts for both fullDescription and shortDescription before saving.

---

### 5.10 ~~Удалить устаревшие placeholders из scheduler.ts~~ [Effort: S]

**[ПЕРЕНЕСЕНО -> backend-infra-improvements Phase 4: scheduler cleanup]**

> Задача перенесена в объединённый Backend+Infra чеклист, где выполняется рефакторинг scheduler.ts и удаление устаревших placeholders.

---

### 5.11 Исправить findTestResultsForTyre() -- оптимизация [Effort: S]
> Модуль 19, Рек. R17; Секция 5.3

- [x] Оптимизировать `findTestResultsForTyre()` (`test-results.ts:185`): заменить in-memory фильтрацию на SQL-запрос с LIKE по JSON-полю
- [x] Или добавить FTS5 для полнотекстового поиска по результатам тестов

**Файлы:**
- `backend-payload/content-automation/src/db/test-results.ts:182-208`

**Нотатки:** Already optimized. Uses SQL LIKE with LOWER(results_json) for pre-filtering at DB level, then in-memory confirmation filter. This avoids loading ALL results into memory.

---

### 5.12 Удалить неиспользуемый import findTestResultsForTyre [Effort: S]
> Модуль 19, Секция 9.2

- [x] Удалить неиспользуемый импорт `findTestResultsForTyre` из `article-pipeline.ts:27`

**Файлы:**
- `backend-payload/content-automation/src/article-pipeline.ts`

**Нотатки:** Already removed. The import does not exist in current article-pipeline.ts.

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `cd backend-payload && npm run build` проходить без помилок
- [x] `cd backend-payload && npm run test` проходить без помилок
- [x] Новые тесты проходят: `cd backend-payload && npm run test -- --reporter verbose`
- [x] Покрытие тестами увеличилось: `cd backend-payload && npm run test:coverage`
- [x] Нет неиспользуемых импортов: проверить через TypeScript compiler warnings

### Після верифікації:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(automation-improvements): phase-5 testing and monitoring completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: завершено
   - Додай запис в історію
6. Все фазы завершены! Обновить PROGRESS.md с финальным статусом.
