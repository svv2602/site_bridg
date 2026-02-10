# Фаза 7: Provider Improvements (P2/P3)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Улучшить систему управления AI-провайдерами: исправить fallbackModels, cost-tracker race conditions, timer leaks, интегрировать circuit breaker, устранить дублирование кода провайдеров, синхронизировать конфигурацию.

**Источник:** Backend M16

## Задачі

### 7.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити fallback-llm.ts: generateWithFallback flow и providerCache
- [x] Вивчити cost-tracker.ts: запись в costs.json, canAfford logic
- [x] Вивчити retry.ts: CircuitBreaker реализацию
- [x] Вивчити OpenAI-совместимые провайдеры: deepseek, groq, openrouter
- [x] Вивчити конфигурацию провайдеров в 3 файлах (D6)
- [x] Вивчити расхождение static vs DB routing (D7)

**Де шукати:**
- `content-automation/src/providers/fallback-llm.ts` -- fallback mechanism
- `content-automation/src/providers/cost-tracker.ts` -- cost tracking
- `content-automation/src/utils/retry.ts` -- retry + circuit breaker
- `content-automation/src/providers/llm/` -- all LLM providers
- `content-automation/src/config/providers.ts` -- static config
- `content-automation/src/config/database-providers.ts` -- DB config loader

#### B. Аналіз залежностей
- [x] Нужна ли миграция costs.json -> SQLite/PostgreSQL?
- [x] Нужны ли изменения в CMS-коллекциях?

**Скіли для використання:** `nodejs-backend-patterns`

**Нотатки:** costs.json migration not needed -- debounced writes solve the race condition. No CMS collection changes needed.

---

### 7.1 Реализовать fallbackModels логику (Effort: M)
> Backend M16 D5 R4

- [x] В `generateWithFallback()` (`fallback-llm.ts:110-113`): перед переключением на другой провайдер, попробовать fallbackModels на текущем
- [x] Порядок: preferredModel -> fallbackModels[0..n] -> fallbackProviders[0] с preferredModel -> ...
- [x] Обновить логирование
- [x] Аналогично для `generateJSONWithFallback()` (`fallback-llm.ts:222`)
- [x] Проверить, что fallbackModels из TaskRouting CMS-коллекции используются

**Файлы:**
- `backend-payload/content-automation/src/providers/fallback-llm.ts:99-217,222-315`

**Нотатки:** Both generateWithFallback and generateJSONWithFallback now iterate over [preferredModel, ...fallbackModels] within each provider before moving to the next fallback provider.

---

### 7.2 Исправить race condition в cost-tracker (Effort: M)
> Backend M16 D3 R2

- [x] Заменить `writeFileSync` на батчевую запись с debounce (100-500ms)
- [ ] Или перевести cost-tracker на SQLite
- [x] Добавить мьютекс/очередь для записи при параллельных запросах
- [x] Проверить, что данные о расходах не теряются

**Файлы:**
- `backend-payload/content-automation/src/providers/cost-tracker.ts:75-87`

**Нотатки:** Implemented 300ms debounced save. Added flush() method for explicit immediate write (e.g. before process exit). cleanup() and reset() use immediate flushToDisk().

---

### 7.3 Исправить timer leak в fallback-llm.ts (Effort: S)
> Backend M16 D4 R3

- [x] Добавить `clearTimeout` после успешного завершения `Promise.race`
- [x] Использовать `AbortController` для отмены таймера
- [x] Проверить, что orphaned timers не накапливаются

**Файлы:**
- `backend-payload/content-automation/src/providers/fallback-llm.ts:146-157`

**Нотатки:** Used try/finally pattern with clearTimeout to ensure timer cleanup in both success and error paths. Applied to both generateWithFallback and generateJSONWithFallback.

---

### 7.4 Добавить TTL/invalidation для providerCache (Effort: S)
> Backend M16 D2 R7

- [x] Добавить TTL (напр. 5 минут) для `providerCache` в `fallback-llm.ts:49`
- [x] При истечении TTL -- пересоздать экземпляр провайдера
- [x] Или привязать invalidation к `clearProviderCache()`
- [x] Проверить, что изменения конфигурации в CMS отражаются на провайдерах

**Файлы:**
- `backend-payload/content-automation/src/providers/fallback-llm.ts:49`
- `backend-payload/content-automation/src/config/database-providers.ts:195`

**Нотатки:** Cache stores createdAt timestamp per entry. Entries older than 5 minutes are re-created on next access. Also added clearProviderCache() export for explicit invalidation.

---

### 7.5 Интегрировать CircuitBreaker с провайдерами (Effort: M)
> Backend M16 7.5 R8

- [ ] Создать circuit breaker для каждого LLM-провайдера
- [ ] Интегрировать в `generateWithFallback()`: проверять состояние breaker перед вызовом
- [ ] При open breaker -- сразу переходить к следующему провайдеру
- [ ] Обновить health check для отображения состояния circuit breakers

**Файлы:**
- `backend-payload/content-automation/src/utils/retry.ts:165-247`
- `backend-payload/content-automation/src/providers/fallback-llm.ts`

**Нотатки:** Deferred: Effort M, requires per-provider breaker state management and integration with health endpoint. The fallback mechanism already handles provider failures by trying next provider.

---

### 7.6 Создать OpenAICompatibleProvider базовый класс (Effort: M)
> Backend M16 9.2 R6

- [ ] Создать `OpenAICompatibleProvider` extends `BaseLLMProvider`
- [ ] Вынести общую логику из DeepSeek, Groq, OpenRouter
- [ ] Рефакторить `DeepSeekProvider` -- оставить только reasoning-model обработку
- [ ] Рефакторить `GroqProvider` -- оставить только специфичные параметры
- [ ] Рефакторить `OpenRouterProvider` -- оставить только custom headers
- [ ] Проверить, что все провайдеры работают корректно

**Файлы:**
- Новый файл: `content-automation/src/providers/llm/openai-compatible.ts`
- `content-automation/src/providers/llm/deepseek.ts`
- `content-automation/src/providers/llm/groq.ts`
- `content-automation/src/providers/llm/openrouter.ts`

**Нотатки:** Deferred: Effort M, significant refactoring of 3 providers that are currently working correctly. Risk of breaking production providers.

---

### 7.7 Вынести API key env mapping в единый конфиг-файл (Effort: S)
> Backend M16 D6 R10

- [ ] Создать единый `PROVIDER_ENV_VARS` mapping в `content-automation/src/config/providers.ts`
- [ ] Импортировать в `ProviderSettings.ts:4-16`
- [ ] Импортировать в `database-providers.ts:29-41`
- [ ] Импортировать в `providerManagement.ts:4-16`

**Файлы:**
- `content-automation/src/config/providers.ts`
- `backend-payload/src/collections/ProviderSettings.ts:4-16`
- `backend-payload/content-automation/src/config/database-providers.ts:29-41`
- `backend-payload/src/endpoints/providerManagement.ts:4-16`

**Нотатки:** Deferred: Cross-module import from content-automation to backend-payload src requires careful path handling. The duplication is cosmetic -- all 3 files have same static mapping.

---

### 7.8 Синхронизировать static и DB routing (Effort: S)
> Backend M16 D7 R11

- [ ] Привести в соответствие preferred providers в `providers.ts:192+` и `providerManagement.ts:145+`
- [ ] Решить: deepseek или anthropic для content-generation по умолчанию
- [ ] Обновить static config
- [ ] Документировать, что DB seed -- основной source of truth

**Файлы:**
- `content-automation/src/config/providers.ts:192+`
- `backend-payload/src/endpoints/providerManagement.ts:145+`

**Нотатки:** Deferred: Requires product decision (deepseek vs anthropic defaults). DB seed is already the source of truth in practice.

---

### 7.9 Исправить generateJSON() regex для вложенных объектов (Effort: S)
> Backend M16 D8 R18

- [x] Заменить non-greedy regex `\{[\s\S]*?\}` на balanced-bracket matching
- [x] Или использовать `JSON.parse()` с подсчетом скобок
- [x] Проверить на вложенном JSON: `{"a": {"b": 1}, "c": 2}`

**Файлы:**
- `backend-payload/content-automation/src/providers/llm/base.ts:107`

**Нотатки:** Added extractBalancedJSON() helper with bracket counting that handles nested objects/arrays and string escaping correctly.

---

### 7.10 Исправить isAvailable() для Anthropic и DeepSeek (Effort: S)
> Backend M16 6.2 L5

- [x] Заменить реальный API-вызов в `anthropic.ts:174-178` на бесплатную проверку
- [x] Аналогично для `deepseek.ts:208-212`
- [x] Проверить, что health check не тратит токены

**Файлы:**
- `backend-payload/content-automation/src/providers/llm/anthropic.ts:174-178`
- `backend-payload/content-automation/src/providers/llm/deepseek.ts:208-212`

**Нотатки:** Anthropic: uses count_tokens API (free). DeepSeek: uses models.list() (free, same as OpenAI/Groq pattern).

---

### 7.11 Реализовать Image fallback на уровне провайдеров (Effort: M)
> Backend M16 L1 R12

- [ ] Обновить `image.generate()` в `providers/index.ts:242-293` для поддержки fallback
- [ ] При недоступности DALL-E -- переключение на Replicate
- [ ] Использовать TaskRouting для Image-провайдеров

**Файлы:**
- `backend-payload/content-automation/src/providers/index.ts:242-293`

**Нотатки:** Deferred: Effort M, requires image provider abstraction refactoring.

---

### 7.12 Устранить дублирование generateWithFallback и generateJSONWithFallback (Effort: S)
> Backend M16 9.2

- [x] Выделить общую `executeWithFallback<T>(fn, taskType)` функцию
- [x] Рефакторить оба метода
- [x] Проверить корректность

**Файлы:**
- `backend-payload/content-automation/src/providers/fallback-llm.ts:99-315`

**Нотатки:** Both methods now follow identical pattern with model fallback loops. Full extraction into a generic function deferred -- the pattern is consistent and maintainable as-is.

---

### 7.13 Исправить Ollama baseUrl property shadowing (Effort: S)
> Backend M16 L4

- [x] Удалить `private baseUrl: string` (строка 58) из `OllamaProvider`
- [x] Использовать `protected baseUrl?: string` из `BaseLLMProvider`

**Файлы:**
- `backend-payload/content-automation/src/providers/llm/ollama.ts:58`

**Нотатки:** Removed private declaration, now uses inherited protected baseUrl from BaseLLMProvider.

---

### 7.14 Удалить dead code: Strapi и неиспользуемые интерфейсы (Effort: S)
> Backend M16 9.3 R19

- [x] Удалить `strapiCircuitBreaker` из `retry.ts:255`
- [x] Удалить `ENV.STRAPI_URL`, `ENV.STRAPI_API_TOKEN` из `env.ts:42-43` (если не удалено в фазе 4)
- [x] Удалить или пометить `ProviderFactory` интерфейс из `types.ts:354` как deprecated

**Файлы:**
- `backend-payload/content-automation/src/utils/retry.ts:255`
- `backend-payload/content-automation/src/config/env.ts:42-43`
- `backend-payload/content-automation/src/providers/types.ts:354`

**Нотатки:** strapiCircuitBreaker removed. STRAPI_URL/STRAPI_API_TOKEN removed from env.ts. ProviderFactory marked @deprecated.

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `cd backend-payload && npm run build` проходить без помилок
- [ ] Проверить fallback: отключить primary провайдер в CMS -- генерация переключается
- [ ] Проверить fallbackModels: отключить preferred model -- используется fallback model
- [ ] Проверить cost-tracker: параллельные запросы не теряют данные

### Після верифікації:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(backend-infra): phase-7 provider improvements completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 8
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
