# Фаза 3: Backend - Telegram Commands + Cron Scheduler

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [x] Завершена

**Розпочата:** 2026-01-09
**Завершена:** 2026-01-09

## Ціль фази
Додати інтерактивні команди Telegram бота (/run, /status, /stats) та налаштувати cron scheduler для автоматичного запуску.

## Передумови
- Telegram bot notifications вже працюють
- Content automation pipeline реалізовано
- Потрібен TELEGRAM_BOT_TOKEN та TELEGRAM_CHAT_ID

---

## Задачі

### 3.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Переглянути поточний telegram-bot.ts
- [x] Переглянути scheduler.ts
- [x] Перевірити env.ts для конфігурації

#### B. Аналіз залежностей
- [x] Чи встановлено node-cron?
- [x] Чи є metrics.ts для /stats команди?
- [x] Як зберігати статус останнього запуску?

**Нові залежності:** node-cron, @types/node-cron (вже встановлено)
**Нові файли:** telegram-commands.ts, cron.ts

#### C. Архітектурні рішення
- [x] Polling vs Webhook для Telegram (polling простіший)
- [x] Зберігання статусу: в пам'яті (для простоти)

---

### 3.1 Встановити node-cron

- [x] Встановити `node-cron` та типи (вже в package.json)
- [x] Перевірити що package.json оновлено

**Файли:** `backend-payload/package.json`

---

### 3.2 Створити Telegram Commands Handler

- [x] Створити `telegram-commands.ts` в publishers/
- [x] Реалізувати /start команду (help message)
- [x] Реалізувати /run команду (trigger full automation)
- [x] Реалізувати /scrape команду (scrape only)
- [x] Реалізувати /status команду (last run status)
- [x] Реалізувати /stats команду (weekly statistics)

**Файли:** `backend-payload/content-automation/src/publishers/telegram-commands.ts`

---

### 3.3 Реалізувати Polling Mode

- [x] Додати функцію startPolling() в telegram-commands.ts
- [x] Реалізувати getUpdates loop
- [x] Додати error handling та reconnection

**Файли:** `backend-payload/content-automation/src/publishers/telegram-commands.ts`

---

### 3.4 Створити Cron Scheduler

- [x] Створити `cron.ts` для scheduled jobs
- [x] Налаштувати weekly job (неділя 03:00 Kyiv time)
- [x] Додати Telegram notification при старті/завершенні
- [x] Експортувати startCronJobs() функцію

**Файли:** `backend-payload/content-automation/src/cron.ts`

---

### 3.5 Оновити Entry Point

- [x] Оновити `index.ts` для запуску cron та polling
- [x] Додати graceful shutdown
- [x] Оновити package.json scripts

**Файли:**
- `backend-payload/content-automation/src/index.ts`
- `backend-payload/package.json`

---

## Верифікація

- [x] node-cron встановлено
- [x] Bot має handlers для всіх команд
- [x] /run запускає автоматизацію
- [x] /status показує інформацію
- [x] /stats показує статистику
- [x] Cron job запланований на неділю 03:00
- [x] Немає TypeScript помилок

---

## При завершенні фази

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "feat(backend): add Telegram bot commands and cron scheduler

   - Add Telegram commands: /run, /status, /stats, /scrape
   - Implement polling mode for Telegram updates
   - Setup node-cron for weekly automation (Sunday 03:00)
   - Update entry point with daemon mode"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 4
   - Загальний прогрес: 14/24
   - Додай запис в історію
6. Відкрий наступну фазу та продовж роботу
