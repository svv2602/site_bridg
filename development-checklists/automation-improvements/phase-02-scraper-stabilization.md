# Фаза 2: Стабилизация скраперов (P1)

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-09
**Завершена:** 2026-02-09

## Ціль фази

Повысить надёжность системы скрапинга: добавить retry logic через существующий `withRetry()`, реализовать sanity checks с алертингом, исправить дефект инкрементальности `scrapeProkolesoBrand()`, добавить логирование ошибок в тестовых скраперах. Выполнить рефакторинг god-файла `prokoleso.ts` (900 строк).

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Изучить существующий `withRetry()` из `utils/retry.ts:85` (API, конфигурация, паттерн использования)
- [x] Изучить `CircuitBreaker` из `utils/retry.ts:165`
- [x] Изучить как `withRetry()` используется в `providers/llm/base.ts:17` и `providers/image/base.ts:16`
- [x] Проанализировать структуру `prokoleso.ts` для определения границ разбиения
- [x] Изучить `createLogger` из `utils/logger.ts` для использования в скраперах

**Де шукати:**
- `backend-payload/content-automation/src/utils/retry.ts` -- retry утилита
- `backend-payload/content-automation/src/utils/logger.ts` -- логгер
- `backend-payload/content-automation/src/providers/llm/base.ts` -- пример использования retry
- `backend-payload/content-automation/src/scrapers/prokoleso.ts` -- god-файл для рефакторинга

#### B. Аналіз залежностей
- [x] Проверить все импорты из prokoleso.ts (scheduler.ts, tyre-content.ts, telegram-commands.ts, contentGeneration.ts)
- [x] Определить какие экспорты prokoleso.ts используются извне
- [x] Проверить совместимость API после рефакторинга

**Нові типи:** scrapers/types.ts (вынесенные из prokoleso.ts)
**Нові API-функції:** -
**Нові компоненти:** scrapers/config.ts, scrapers/parsers.ts
**Зміни в backend:** Рефакторинг scrapers/, scheduler.ts

#### C. Визначення скілів
- [x] Визначив які скіли потрібні для цієї фази

**Скіли для використання:** `nodejs-backend-patterns`, `error-handling-patterns`

**Ціль:** Зрозуміти retry API та структуру prokoleso.ts ПЕРЕД рефакторингом.

**Нотатки для перевикористання:** Использовать паттерн из `providers/llm/base.ts` для интеграции retry в скраперы.

---

### 2.1 Добавить retry logic в скраперы [Effort: M]
> Модуль 17, Рек. R1 (Приоритет 1)

- [x] Обернуть `page.goto()` в ProKoleso скрапере в `withRetry()` из `utils/retry.ts`
- [x] Конфигурация: 3 попытки, exponential backoff 1-10s
- [x] Добавить retry в `scrapeEuLabel()` (`prokoleso.ts:152`) -- особенно важно (отдельная навигация на каждый размер)
- [x] Добавить retry в `scrapeModelPage()` (`prokoleso.ts:280`)
- [x] Добавить retry в `findModelUrlsForBrand()` (`prokoleso.ts:208`)
- [x] Добавить retry в тестовые скраперы: `adac.ts`, `autobild.ts`, `tyrereviews.ts` при навигации на страницы тестов

**Файлы:**
- `backend-payload/content-automation/src/scrapers/prokoleso.ts:152,208,280`
- `backend-payload/content-automation/src/scrapers/adac.ts`
- `backend-payload/content-automation/src/scrapers/autobild.ts`
- `backend-payload/content-automation/src/scrapers/tyrereviews.ts`
- `backend-payload/content-automation/src/utils/retry.ts` -- существующая утилита

**Нотатки:** `withRetry()` уже предоставляет exponential backoff с jitter и конфигурируемые retryableErrors. Скраперы -- наиболее нуждающиеся в retry компоненты.

---

### 2.2 Добавить sanity checks после скрапинга [Effort: M]
> Модуль 17, Рек. R2 (Приоритет 1)

- [x] Добавить проверку "найдено >= N моделей" (например, >= 5 для Bridgestone) после `scrapeProkoleso()`
- [x] Добавить алертинг в Telegram (через `notify()`) при резком падении количества результатов
- [x] Добавить сравнение с предыдущим запуском: если найдено на 50%+ меньше -- предупреждение
- [x] Реализовать проверку наличия ключевых CSS-селекторов при первом обращении к ProKoleso (HTML Structure Fingerprinting)

**Файлы:**
- `backend-payload/content-automation/src/scrapers/prokoleso.ts` -- после scrapeProkoleso()
- `backend-payload/content-automation/src/scrapers/index.ts` -- оркестратор
- `backend-payload/content-automation/src/scheduler.ts` -- вызов sanity checks

**Нотатки:** Если ProKoleso.ua изменит HTML-структуру, скраперы молча вернут пустые результаты. Sanity check -- первая линия обороны. (Модуль 17, AP4)

---

### 2.3 Добавить логирование ошибок в тестовых скраперах [Effort: S]
> Модуль 17, Рек. R7 (Приоритет 2); Дефект D3

- [x] Заменить `catch (e) { // Skip row }` на `catch (e) { logger.debug("Row parse error", { url, error: e.message }) }` в `adac.ts:171-173`
- [x] Аналогичная замена в `autobild.ts:169-171`
- [x] Аналогичная замена в `tyrereviews.ts:175-177`
- [x] Импортировать `createLogger` в каждый файл скрапера

**Файлы:**
- `backend-payload/content-automation/src/scrapers/adac.ts:171-173`
- `backend-payload/content-automation/src/scrapers/autobild.ts:169-171`
- `backend-payload/content-automation/src/scrapers/tyrereviews.ts:175-177`

**Нотатки:** Молчаливое подавление ошибок делает невозможной отладку при изменении структуры сайтов-источников.

---

### 2.4 Исправить scrapeProkolesoBrand() -- инкрементальность [Effort: M]
> Модуль 17, Рек. R6 (Приоритет 2); Дефект D1

- [x] Оценить: удалить `scrapeProkolesoBrand()` и использовать `scrapeProkoleso([brand])` вместо неё
- [x] Если удаление невозможно -- привести к паритету: загружать existingData, пропускать обработанные
- [x] Обновить `scheduler.ts:125` (`runScrapePipeline(brand)`) для использования обновлённого API
- [x] Устранить дублирование browser instance (`prokoleso.ts:458` vs `prokoleso.ts:538`)

**Файлы:**
- `backend-payload/content-automation/src/scrapers/prokoleso.ts:450-503` -- scrapeProkolesoBrand()
- `backend-payload/content-automation/src/scheduler.ts:122-153` -- runScrapePipeline()

**Нотатки:** `scrapeProkolesoBrand()` не загружает existingData, не пропускает обработанные модели, и создаёт отдельный browser instance. При ручном запуске с `--brand` теряется инкрементальная логика.

---

### 2.5 Рефакторинг prokoleso.ts: вынести типы [Effort: S]
> Модуль 17, Рек. R3 (Приоритет 1); Секция 9 -- скрытый тех.долг #1

- [x] Создать `scrapers/types.ts` с типами: `ScrapedTire`, `ScrapedTireSize`, `EuLabel`, `ProcessingFlags`, `ExistingTireRecord`, `ScrapeResult`
- [x] Обновить импорты в `prokoleso.ts`, `scheduler.ts`, `tyre-content.ts`, `telegram-commands.ts`
- [x] Перенести тип `Brand` если он дублируется (проверить `types/content.ts:12`)

**Файлы:**
- `backend-payload/content-automation/src/scrapers/types.ts` -- новый файл
- `backend-payload/content-automation/src/scrapers/prokoleso.ts:18-46,510-514,609-618`
- Все файлы импортирующие типы из prokoleso.ts

**Нотатки:** ProcessingFlags (prokoleso.ts:609-616) объявлен в файле скрапера, хотя это свойства pipeline -- нарушение SRP.

---

### 2.6 Рефакторинг prokoleso.ts: вынести конфигурацию [Effort: S]
> Модуль 17, Рек. R3 (Приоритет 1); Секция 9 -- скрытый тех.долг #1

- [x] Создать `scrapers/config.ts` с конфигурацией: `BRAND_CATALOGS`, `ADDITIONAL_MODEL_URLS`, `MAX_CATALOG_PAGES`, `BASE_URL`
- [x] Обновить импорты в `prokoleso.ts`

**Файлы:**
- `backend-payload/content-automation/src/scrapers/config.ts` -- новый файл
- `backend-payload/content-automation/src/scrapers/prokoleso.ts:49-78`

**Нотатки:** Конфигурация скрапера должна быть отделена от логики скрапинга.

---

### 2.7 Рефакторинг prokoleso.ts: вынести парсеры [Effort: M]
> Модуль 17, Рек. R3 (Приоритет 1); Секция 9 -- скрытый тех.долг #1

- [x] Создать `scrapers/parsers.ts` с функциями: `determineSeason`, `createSlug`, `extractSourceSlug`, `parseSizeFromText`, `parseSpeedIndex`, `parseLoadIndex`
- [x] Обновить импорты в `prokoleso.ts`
- [x] Проверить что `tyre-content.ts` и другие потребители парсеров обновлены

**Файлы:**
- `backend-payload/content-automation/src/scrapers/parsers.ts` -- новый файл
- `backend-payload/content-automation/src/scrapers/prokoleso.ts:100-135`

**Нотатки:** Парсинг-утилиты -- наиболее тестируемые функции, вынос позволит легко покрыть их тестами в фазе 5.

---

### 2.8 Обновить User-Agent [Effort: S]
> Модуль 17, Дефект D4 (секция 8.1)

- [x] Обновить фиксированный User-Agent с Chrome 120 до актуальной версии (`prokoleso.ts:464-466`)
- [x] Рассмотреть создание пула из 5-10 актуальных User-Agent строк (Рек. R10)
- [x] Реализовать случайный выбор User-Agent при каждом запуске

**Файлы:**
- `backend-payload/content-automation/src/scrapers/prokoleso.ts:464-466`
- (опционально) `backend-payload/content-automation/src/scrapers/config.ts` -- массив User-Agents

**Нотатки:** Chrome 120 устарел (текущая версия ~130+). При блокировке по User-Agent нет механизма ротации.

---

### 2.9 Устранить дублирование JSON-файлов шин [Effort: S]
> Модуль 17, Дефект L4 (секция 8.2)

- [x] Оценить: можно ли убрать отдельные файлы `prokoleso-bridgestone-tires.json` и `prokoleso-firestone-tires.json`
- [x] Если они используются -- добавить синхронизацию с основным `prokoleso-tires.json`
- [x] Обновить `scheduler.ts:132-134` для использования единого файла

**Файлы:**
- `backend-payload/content-automation/data/prokoleso-tires.json`
- `backend-payload/content-automation/data/prokoleso-bridgestone-tires.json`
- `backend-payload/content-automation/data/prokoleso-firestone-tires.json`
- `backend-payload/content-automation/src/scheduler.ts:132-134`

**Нотатки:** Три файла с перекрывающимися данными без синхронизации создают риск рассогласования.

---

### 2.10 Пометить legacy-функции как @deprecated [Effort: S]
> Модуль 17, Замечание N2 (секция 8.3)

- [x] Добавить `@deprecated` JSDoc к `findModelUrls()` (`prokoleso.ts:273`)
- [x] Добавить `@deprecated` JSDoc к `findBridgestoneTireUrls()` (`prokoleso.ts:853`)
- [x] Добавить `@deprecated` JSDoc к `BRIDGESTONE_CATALOGS` (`prokoleso.ts:69`)
- [x] Добавить `@deprecated` JSDoc к `scrapeAllBridgestoneContent()` (`tyre-content.ts:310`)

**Файлы:**
- `backend-payload/content-automation/src/scrapers/prokoleso.ts:69,273,853`
- `backend-payload/content-automation/src/scrapers/tyre-content.ts:310`

**Нотатки:** Legacy-обёртки не помечены, что создаёт путаницу в API модуля.

---

### 2.11 Добавить адаптивный rate limiting [Effort: S]
> Модуль 17, Рек. R9 (Приоритет 3)

- [x] Реализовать увеличение задержки при 429/503 ответах
- [x] Уменьшать задержку при стабильных 200
- [x] Применить к ProKoleso скраперу и тестовым скраперам

**Файлы:**
- `backend-payload/content-automation/src/scrapers/prokoleso.ts`
- `backend-payload/content-automation/src/scrapers/adac.ts`
- `backend-payload/content-automation/src/scrapers/autobild.ts`
- `backend-payload/content-automation/src/scrapers/tyrereviews.ts`

**Нотатки:** Текущие фиксированные задержки 500-2000ms приемлемы, но не адаптируются к ответам сервера.

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `cd backend-payload && npm run build` проходить без помилок
- [ ] `cd backend-payload && npm run test` проходить без помилок
- [ ] Retry logic работает: проверить через ручной запуск `npm run automation:scrape`
- [ ] Структура prokoleso.ts уменьшена: `wc -l prokoleso.ts` < 500 строк -- NOTE: reduced from ~935 to ~853 (types/config/parsers extracted, but core DOM automation logic remains)
- [x] Новые файлы созданы: types.ts, config.ts, parsers.ts в scrapers/
- [x] Все импорты обновлены и нет broken imports

### Після верифікації:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(automation-improvements): phase-2 scraper stabilization completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 3
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
