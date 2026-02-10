# Фаза 5: P3 -- Cost Tracker, Logger, User-Agent

## Статус
- [ ] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-02-10
**Завершена:** 2026-02-10

## Ціль фази
Усунути технічний борг: мігрувати cost tracker з JSON на SQLite, замінити синхронний запис в logger на асинхронний, оновити User-Agent, додати retry-логіку в ProKoleso scraper, очистити legacy-експорти.

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити поточну структуру cost-tracker.ts (JSON файл, debounced write)
- [ ] Вивчити SQLite інтеграцію в article-queue.ts (як reference для міграції)
- [ ] Вивчити logger.ts -- де використовується appendFileSync
- [ ] Вивчити prokoleso.ts -- поточний User-Agent та відсутність retry
- [ ] Вивчити utils/retry.ts -- існуючу retry-утиліту
- [ ] Вивчити config.ts -- AdaptiveDelay та getRandomUserAgent()

**Команди для пошуку:**
```bash
# Cost tracker структура
grep -n "class\|interface\|JSON\|writeFile\|readFile" backend-payload/content-automation/src/providers/cost-tracker.ts
# SQLite reference
grep -n "better-sqlite3\|Database\|prepare\|run" backend-payload/content-automation/src/db/article-queue.ts
# Sync file writes в logger
grep -n "appendFileSync\|writeFileSync" backend-payload/content-automation/src/utils/logger.ts
# User-Agent в prokoleso
grep -n "User-Agent\|userAgent\|user-agent" backend-payload/content-automation/src/scrapers/prokoleso.ts
# Retry утиліта
cat backend-payload/content-automation/src/utils/retry.ts
# AdaptiveDelay
grep -n "AdaptiveDelay\|getRandomUserAgent" backend-payload/content-automation/src/scrapers/config.ts
# Legacy exports
grep -n "export " backend-payload/content-automation/src/scrapers/prokoleso.ts
```

#### B. Аналіз залежностей
- [ ] Чи є better-sqlite3 вже в залежностях?
- [ ] Які файли імпортують з cost-tracker.ts?
- [ ] Які файли імпортують з logger.ts?

**Залежності cost-tracker:** -
**Залежності logger:** -

#### C. Оцінка обсягу робіт
- [ ] Чи можна міграцію cost-tracker на SQLite зробити backward-compatible?
- [ ] Чи потрібен migration script для існуючих даних в costs.json?

**Ціль:** Зрозуміти обсяг змін та порядок їх виконання.

**Нотатки для перевикористання:** article-queue.ts -- хороший reference для SQLite patterns.

---

### 5.1 Мігрувати cost tracker з JSON на SQLite
- [ ] Створити таблицю `cost_records` в content-automation.db:
  ```sql
  CREATE TABLE IF NOT EXISTS cost_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT,
    task TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    cost REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  ```
- [ ] Оновити CostTracker клас для використання SQLite замість JSON
- [ ] Зберегти backward-compatibility (або мігрувати існуючі дані)
- [ ] Додати `process.on('exit')` для flush (як fallback)
- [ ] Оновити `cleanup()` метод для SQLite (DELETE WHERE date < ?)

**Файли:** `backend-payload/content-automation/src/providers/cost-tracker.ts`, `backend-payload/content-automation/src/db/`
**Нотатки:** Аудит: M-5. JSON файл не thread-safe, може втрачати дані при аварійному завершенні.

---

### 5.2 Замінити appendFileSync в logger на асинхронний запис
- [ ] Замінити `fs.appendFileSync(config.logFilePath, logLine)` на один із варіантів:
  - Варіант A: `fs.appendFile()` (async callback)
  - Варіант B: `fs.createWriteStream()` з буферизацією
  - Варіант C: Буферизувати лог-записи та flush періодично (кожні N мс або N записів)
- [ ] Додати `process.on('exit')` для flush буфера
- [ ] Перевірити що log rotation продовжує працювати

**Файли:** `backend-payload/content-automation/src/utils/logger.ts` (рядок ~228)
**Нотатки:** Аудит: M-8. appendFileSync блокує event loop при кожному лог-повідомленні.

---

### 5.3 Оновити User-Agent в ProKoleso scraper
- [ ] Замінити hardcoded `Chrome/120.0.0.0` на виклик `getRandomUserAgent()` з config.ts
- [ ] АБО: оновити User-Agent на актуальну версію Chrome (131+)
- [ ] Перевірити що User-Agent встановлюється при кожному запуску browser/page

**Файли:** `backend-payload/content-automation/src/scrapers/prokoleso.ts`
**Нотатки:** Аудит: L-7. config.ts має пул актуальних UA (Chrome 131) та функцію getRandomUserAgent().

---

### 5.4 Додати retry-логіку в ProKoleso scraper
- [ ] Імпортувати `withRetry` з `utils/retry.ts`
- [ ] Обгорнути навігацію до сторінок шин в withRetry (page.goto)
- [ ] Інтегрувати `AdaptiveDelay` з config.ts замість фіксованого delay 500ms
- [ ] Налаштувати backoff: 3 спроби, початковий delay 1000ms, множник 2x

**Файли:** `backend-payload/content-automation/src/scrapers/prokoleso.ts`
**Нотатки:** Аудит: M-6. Зараз при помилці навігації сторінка просто пропускається. config.ts має готовий AdaptiveDelay з backoff/cooldown.

---

### 5.5 Очистити legacy-експорти
- [ ] Видалити `findBridgestoneTireUrls`, `findFirestoneTireUrls` обгортки (якщо не використовуються зовні)
- [ ] Видалити `saveResults` (legacy, замінений на `mergeAndSaveResults`)
- [ ] Перевірити що жоден зовнішній файл не імпортує ці функції
- [ ] Видалити або помітити deprecated `cron.ts`

**Файли:** `backend-payload/content-automation/src/scrapers/prokoleso.ts`, `backend-payload/content-automation/src/cron.ts`
**Нотатки:** Аудит: L-1. Legacy обгортки та deprecated файл.

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(content-automation-fixes): phase-5 cost tracker logger user-agent completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: завершено
   - Додай запис в історію
6. Всі фази завершено! Онови README.md -- відміть критерії успіху.
