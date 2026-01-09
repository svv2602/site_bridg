# Фаза 3: Backend - Telegram Commands + Cron Scheduler

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

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
- [ ] Переглянути поточний telegram-bot.ts
- [ ] Переглянути scheduler.ts
- [ ] Перевірити env.ts для конфігурації

**Команди для пошуку:**
```bash
# Telegram bot
cat backend-payload/content-automation/src/publishers/telegram-bot.ts

# Scheduler
cat backend-payload/content-automation/src/scheduler.ts

# Environment config
cat backend-payload/content-automation/src/config/env.ts
```

#### B. Аналіз залежностей
- [ ] Чи встановлено node-cron?
- [ ] Чи є metrics.ts для /stats команди?
- [ ] Як зберігати статус останнього запуску?

**Нові залежності:** node-cron, @types/node-cron
**Нові файли:** telegram-commands.ts, cron.ts

#### C. Архітектурні рішення
- [ ] Polling vs Webhook для Telegram (polling простіший)
- [ ] Зберігання статусу: файл vs SQLite vs Payload collection

**Нотатки:**
- Використати polling mode для простоти
- Зберігати статус в JSON файлі або SQLite

---

### 3.1 Встановити node-cron

- [ ] Встановити `node-cron` та типи
- [ ] Перевірити що package.json оновлено

**Команди:**
```bash
cd backend-payload/content-automation
npm install node-cron
npm install -D @types/node-cron
```

**Файли:** `backend-payload/content-automation/package.json`

---

### 3.2 Створити Telegram Commands Handler

- [ ] Створити `telegram-commands.ts` в publishers/
- [ ] Реалізувати /start команду (help message)
- [ ] Реалізувати /run команду (trigger full automation)
- [ ] Реалізувати /scrape команду (scrape only)
- [ ] Реалізувати /status команду (last run status)
- [ ] Реалізувати /stats команду (weekly statistics)

**Файли:** `backend-payload/content-automation/src/publishers/telegram-commands.ts`

**Команди бота:**
```
/start - Привітання та список команд
/help - Допомога
/run - Запустити повний цикл автоматизації
/scrape - Тільки скрапінг джерел
/status - Статус останнього запуску
/stats - Статистика за тиждень
```

**Структура:**
```typescript
interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
  };
}

const commands: Record<string, () => Promise<string>> = {
  '/start': async () => '...',
  '/help': async () => '...',
  '/run': async () => '...',
  // ...
};
```

---

### 3.3 Реалізувати Polling Mode

- [ ] Додати функцію startPolling() в telegram-commands.ts
- [ ] Реалізувати getUpdates loop
- [ ] Додати error handling та reconnection

**Файли:** `backend-payload/content-automation/src/publishers/telegram-commands.ts`

**Polling logic:**
```typescript
export async function startPolling(): Promise<void> {
  let offset = 0;

  while (true) {
    try {
      const response = await fetch(
        `${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=30`
      );
      const data = await response.json();

      for (const update of data.result) {
        await processUpdate(update);
        offset = update.update_id + 1;
      }
    } catch (error) {
      await sleep(5000); // Wait on error
    }
  }
}
```

---

### 3.4 Створити Cron Scheduler

- [ ] Створити `cron.ts` для scheduled jobs
- [ ] Налаштувати weekly job (неділя 03:00 Kyiv time)
- [ ] Додати Telegram notification при старті/завершенні
- [ ] Експортувати startCronJobs() функцію

**Файли:** `backend-payload/content-automation/src/cron.ts`

**Cron schedule:**
```typescript
import cron from 'node-cron';

// Weekly automation: Sunday at 03:00 Kyiv time
const WEEKLY_SCHEDULE = '0 3 * * 0';

export function startCronJobs(): void {
  cron.schedule(WEEKLY_SCHEDULE, async () => {
    await notify({ type: 'info', message: '🕐 Починаю щотижневу автоматизацію...' });

    try {
      await runWeeklyAutomation();
    } catch (error) {
      await notify({ type: 'error', message: `❌ Помилка: ${error}` });
    }
  }, {
    timezone: 'Europe/Kyiv'
  });
}
```

---

### 3.5 Оновити Entry Point

- [ ] Оновити `index.ts` для запуску cron та polling
- [ ] Додати graceful shutdown
- [ ] Оновити package.json scripts

**Файли:**
- `backend-payload/content-automation/src/index.ts`
- `backend-payload/content-automation/package.json`

**index.ts:**
```typescript
import { startCronJobs } from './cron';
import { startPolling } from './publishers/telegram-commands';
import { logger } from './utils/logger';

async function main() {
  logger.info('Content Automation System starting...');

  // Start cron scheduler
  startCronJobs();

  // Start Telegram bot (if configured)
  if (process.env.TELEGRAM_BOT_TOKEN) {
    startPolling();
  }

  logger.info('System ready');
}

main().catch(console.error);
```

**package.json scripts:**
```json
{
  "scripts": {
    "start": "tsx src/index.ts",
    "daemon": "tsx src/index.ts",
    "automation": "tsx src/scheduler.ts"
  }
}
```

---

## Верифікація

- [ ] node-cron встановлено
- [ ] Bot відповідає на /start
- [ ] /run запускає автоматизацію
- [ ] /status показує інформацію
- [ ] /stats показує статистику
- [ ] Cron job запланований на неділю 03:00
- [ ] Немає memory leaks в polling

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
