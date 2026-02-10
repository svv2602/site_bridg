# Фаза 1: Критические исправления (P0)

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-09
**Завершена:** 2026-02-09

## Ціль фази

Исправить все критические дефекты безопасности и баги, которые влияют на корректность работы системы: hardcoded credentials, безусловные вызовы main() при импорте модулей, operator precedence bug, неаутентифицированные GET endpoints.

## Задачі

### 1.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Найти все файлы с hardcoded credentials (payload-client.ts, env.ts)
- [x] Найти все файлы с безусловным вызовом main() (badge-assigner.ts, adac.ts, autobild.ts, tyrereviews.ts, test-results.ts, telegram-bot дубликат)
- [x] Найти operator precedence bug в content/index.ts
- [x] Проверить аутентификацию всех GET endpoints в automation.ts

**Де шукати:**
- `backend-payload/content-automation/src/publishers/payload-client.ts` -- hardcoded credentials
- `backend-payload/content-automation/src/processors/badge-assigner.ts` -- безусловный main()
- `backend-payload/content-automation/src/scrapers/adac.ts`, `autobild.ts`, `tyrereviews.ts` -- безусловный main()
- `backend-payload/content-automation/src/db/test-results.ts` -- безусловный main()
- `backend-payload/src/automation/publishers/telegram-bot.ts` -- дубликат с безусловным main()
- `backend-payload/content-automation/src/processors/content/index.ts` -- operator precedence
- `backend-payload/src/endpoints/automation.ts` -- GET endpoints без auth

#### B. Аналіз залежностей
- [x] Проверить как credentials используются в pipeline (scheduler.ts, contentGeneration.ts)
- [x] Проверить какие модули импортируют badge-assigner.ts и тестовые скраперы

**Нові типи:** -
**Нові API-функції:** -
**Нові компоненти:** -
**Зміни в backend:** Да -- endpoints, processors, scrapers

#### C. Визначення скілів
- [x] Визначив які скіли потрібні для цієї фази

**Скіли для використання:** `error-handling-patterns`, `api-design-principles`, `debugging-strategies`

**Ціль:** Зрозуміти масштаб критичних проблем ПЕРЕД виправленням.

**Нотатки для перевикористання:** -

---

### 1.1 ~~Убрать hardcoded credentials из payload-client.ts~~ [Effort: S]

**[ПЕРЕНЕСЕНО → backend-infra-improvements Phase 1: credentials cleanup]**

> Задача перенесена в объединённый Backend+Infra чеклист, где выполняется очистка credentials для всего backend-payload/ (включая payload-client.ts, import-tyres.ts).

---

### 1.2 Защитить безусловный main() в badge-assigner.ts [Effort: S]
> Модуль 18, Рек. #1; Дефект D3 (секция 8)

- [x] Добавить guard `if (process.argv[1]?.includes('badge-assigner'))` перед вызовом `main()` в `badge-assigner.ts:336`
- [x] Проверить что импорт `assignBadges` из других модулей больше не вызывает тестовый код

**Файлы:**
- `backend-payload/content-automation/src/processors/badge-assigner.ts:336`

**Нотатки:** Каждый import badge-assigner.ts сейчас выполняет тестовый код с console output.

---

### 1.3 Защитить безусловный main() в тестовых скраперах [Effort: S]
> Модуль 17, Дефект L5 (секция 8.2)

- [x] Добавить guard-условие перед `main()` в `adac.ts:310`
- [x] Добавить guard-условие перед `main()` в `autobild.ts:297`
- [x] Добавить guard-условие перед `main()` в `tyrereviews.ts:347`
- [x] Добавить guard-условие перед `main()` в `test-results.ts:343`
- [x] Использовать паттерн из `prokoleso.ts:895-898` как референс (isMainModule проверка)

**Файлы:**
- `backend-payload/content-automation/src/scrapers/adac.ts:310`
- `backend-payload/content-automation/src/scrapers/autobild.ts:297`
- `backend-payload/content-automation/src/scrapers/tyrereviews.ts:347`
- `backend-payload/content-automation/src/db/test-results.ts:343`

**Нотатки:** Хотя main() в этих файлах лишь выводит help-текст, это плохая практика, которая может вызвать побочные эффекты.

---

### 1.4 ~~Удалить дубликат telegram-bot.ts с безусловным main()~~ [Effort: S]

**[ПЕРЕНЕСЕНО → backend-infra-improvements Phase 4: dead file cleanup]**

> Задача перенесена в объединённый Backend+Infra чеклист, где выполняется удаление ~25 мёртвых файлов из src/automation/ (включая telegram-bot.ts legacy-дубликат).

---

### 1.5 Исправить operator precedence bug в content/index.ts [Effort: S]
> Модуль 18, Рек. #2; Дефект D2 (секция 8)

- [x] Исправить строку 206 в `content/index.ts`: заменить `|| 0` на `?? 0` или вынести в отдельное вычисление с null-check
- [x] Проверить аналогичные строки 207-209 на ту же проблему (completionTokens, totalTokens)

**Файлы:**
- `backend-payload/content-automation/src/processors/content/index.ts:206-209`

**Нотатки:** Оператор `||` имеет меньший приоритет чем `+`. Если `promptTokens` равен `undefined`, результат `+` станет `NaN`, а `NaN || 0` вернет `0`, потеряв данные.

---

### 1.6 ~~Добавить аутентификацию к GET-эндпоинтам automation API~~ [Effort: S]

**[ПЕРЕНЕСЕНО → backend-infra-improvements Phase 1: endpoint auth]**

> Задача перенесена в объединённый Backend+Infra чеклист, где выполняется добавление аутентификации ко всем незащищённым endpoints.

---

### 1.7 Добавить валидацию input в endpoints automation API [Effort: S]
> Модуль 19, Секция 6.3

- [x] Добавить валидацию допустимых значений `status` в queue update endpoint (`automation.ts:434-442`)
- [x] Добавить валидацию ключей/значений в settings endpoint (`automation.ts:549`)

**Файлы:**
- `backend-payload/src/endpoints/automation.ts:434-442,549`

**Нотатки:** Сейчас можно установить произвольный статус и добавить произвольные настройки через API.

---

## При завершенні фази

### Верифікація (ПЕРЕД комітом):
- [x] `cd backend-payload && npm run build` проходить без помилок
- [x] `cd backend-payload && npm run test` проходить без помилок
- [ ] Hardcoded credentials отсутствуют: `grep -r "admin123" backend-payload/src/` — [ПЕРЕНЕСЕНО]
- [x] Безусловные main() отсутствуют: проверить все файлы с guard-условиями
- [ ] GET endpoints возвращают 401 без аутентификации — [ПЕРЕНЕСЕНО]

### Після верифікації:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(automation-improvements): phase-1 critical fixes completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 2
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
