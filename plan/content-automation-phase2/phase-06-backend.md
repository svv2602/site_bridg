# Phase 6: Backend Completion

## Status
- [ ] Not Started
- [ ] In Progress
- [ ] Completed

**Started:** -
**Completed:** -

## Goal

Complete backend automation: image generation, Telegram bot commands, cron scheduler.

## Prerequisites

- Phase 5 completed
- ANTHROPIC_API_KEY configured
- Telegram bot created via @BotFather (manual step)

---

## Tasks

### 6.1 Create Image Handler for DALL-E 3

- [ ] Install OpenAI SDK
- [ ] Create `src/processors/image-handler.ts`
- [ ] Implement article hero image generation
- [ ] Implement image upload to Strapi Media Library
- [ ] Add fallback to stock images (Unsplash)
- [ ] Integrate into article generation pipeline

**Files:**
- `backend/content-automation/src/processors/image-handler.ts` (new)
- `backend/content-automation/package.json` (update)

**Install dependency:**
```bash
cd backend/content-automation
npm install openai
```

**Image Handler:**
```typescript
// backend/content-automation/src/processors/image-handler.ts
import OpenAI from 'openai';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY
});

interface ImageGenerationOptions {
  articleType: 'review' | 'comparison' | 'guide' | 'test_summary';
  tireName?: string;
  season?: 'summer' | 'winter' | 'allseason';
}

const imagePrompts: Record<string, string> = {
  review: 'Professional product photography of a premium car tire on clean white background, studio lighting, high detail, commercial photography style, no text or logos, photorealistic',
  comparison: 'Split view showing multiple car tires side by side on white background, professional studio setup, comparison layout, clean background, commercial style, no text',
  guide: 'Infographic style illustration about car tire safety and maintenance, modern flat design, blue and gray color scheme, professional, minimalist, no text',
  test_summary: 'Professional automotive photography of car tires being tested on wet road surface, dynamic angle, motion blur on background, focus on tire tread, editorial style'
};

export async function generateArticleImage(
  options: ImageGenerationOptions
): Promise<string | null> {
  if (!env.OPENAI_API_KEY) {
    logger.warn('OPENAI_API_KEY not set, skipping image generation');
    return null;
  }

  try {
    const prompt = imagePrompts[options.articleType];

    logger.info(`Generating image for ${options.articleType}`);

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size: '1792x1024',
      quality: 'standard',
      n: 1
    });

    const imageUrl = response.data[0]?.url;

    if (!imageUrl) {
      logger.error('No image URL in response');
      return null;
    }

    logger.info(`Image generated: ${imageUrl.substring(0, 50)}...`);

    // Optionally upload to Strapi
    // const strapiUrl = await uploadToStrapi(imageUrl, options);
    // return strapiUrl;

    return imageUrl;

  } catch (error) {
    logger.error('Image generation failed', { error });
    return null;
  }
}

// Upload image to Strapi Media Library
export async function uploadToStrapi(
  imageUrl: string,
  filename: string
): Promise<string | null> {
  try {
    // 1. Download image
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // 2. Create form data
    const formData = new FormData();
    formData.append('files', blob, filename);

    // 3. Upload to Strapi
    const uploadResponse = await fetch(`${env.STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRAPI_API_TOKEN}`
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    const [uploadedFile] = await uploadResponse.json();
    return `${env.STRAPI_URL}${uploadedFile.url}`;

  } catch (error) {
    logger.error('Strapi upload failed', { error });
    return null;
  }
}

// Fallback: Get stock image from Unsplash
export async function getUnsplashImage(
  query: string = 'car tire'
): Promise<string> {
  // Free Unsplash source URL (no API key needed)
  return `https://source.unsplash.com/1600x900/?${encodeURIComponent(query)}`;
}
```

**Update env.ts:**
```typescript
// Add to backend/content-automation/src/config/env.ts
export const env = {
  // ... existing
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
};
```

**Update .env.example:**
```env
# Image Generation (optional)
OPENAI_API_KEY=sk-...
```

**Verification:**
- [ ] OpenAI SDK installed
- [ ] Image generation works with test prompt
- [ ] Upload to Strapi works
- [ ] Fallback to Unsplash works

---

### 6.2 Add Telegram Bot Commands

- [ ] Update `telegram-bot.ts` with command handlers
- [ ] Implement `/run` command - full automation
- [ ] Implement `/scrape` command - scrape only
- [ ] Implement `/status` command - last run status
- [ ] Implement `/stats` command - weekly statistics
- [ ] Add webhook or polling mode

**Files:**
- `backend/content-automation/src/publishers/telegram-bot.ts` (update)
- `backend/content-automation/src/telegram-commands.ts` (new)

**Telegram Commands Handler:**
```typescript
// backend/content-automation/src/telegram-commands.ts
import { env } from './config/env';
import { logger } from './utils/logger';
import { runWeeklyAutomation, runScrapeOnly } from './scheduler';
import { getMetricsSummary } from './utils/metrics';

const TELEGRAM_API = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
  };
}

// Command handlers
const commands: Record<string, () => Promise<string>> = {
  '/start': async () => {
    return `Привіт! Я бот автоматизації контенту Bridgestone.\n\nКоманди:\n/run - Запустити повний цикл\n/scrape - Тільки скрапінг\n/status - Статус останнього запуску\n/stats - Статистика за тиждень\n/help - Допомога`;
  },

  '/help': async () => {
    return `Команди бота:\n\n/run - Запустити повний цикл автоматизації\n/scrape - Тільки скрапінг без генерації\n/status - Показати статус останнього запуску\n/stats - Статистика за останній тиждень\n/help - Ця довідка`;
  },

  '/run': async () => {
    // Run in background, respond immediately
    runWeeklyAutomation().catch(err => {
      logger.error('Automation failed', { error: err });
    });
    return '🚀 Запускаю повний цикл автоматизації...\n\nВи отримаєте сповіщення коли буде завершено.';
  },

  '/scrape': async () => {
    runScrapeOnly().catch(err => {
      logger.error('Scrape failed', { error: err });
    });
    return '🔍 Запускаю скрапінг джерел...\n\nВи отримаєте сповіщення коли буде завершено.';
  },

  '/status': async () => {
    // Get last execution status from DB
    const status = await getLastExecutionStatus();
    if (!status) {
      return 'Немає даних про останній запуск';
    }
    return `📊 Останній запуск:\n\n📅 ${status.date}\n⏱ Тривалість: ${status.duration}\n✅ Успішно: ${status.success}\n❌ Помилок: ${status.errors}`;
  },

  '/stats': async () => {
    const stats = await getMetricsSummary(7); // last 7 days
    return `📊 Статистика за тиждень:\n\n📦 Шин оброблено: ${stats.tiresProcessed}\n📝 Статей створено: ${stats.articlesCreated}\n🏆 Badges додано: ${stats.badgesAssigned}\n💰 Витрачено: $${stats.cost.toFixed(2)}\n❌ Помилок: ${stats.errors}`;
  }
};

async function getLastExecutionStatus(): Promise<any> {
  // TODO: Implement DB query for last execution
  return null;
}

// Process incoming update
export async function processUpdate(update: TelegramUpdate): Promise<void> {
  const message = update.message;
  if (!message?.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();

  // Check if it's a command
  const command = text.split(' ')[0].toLowerCase();
  const handler = commands[command];

  if (handler) {
    try {
      const response = await handler();
      await sendMessage(chatId, response);
    } catch (error) {
      logger.error('Command handler error', { command, error });
      await sendMessage(chatId, '❌ Помилка виконання команди');
    }
  }
}

// Send message
async function sendMessage(chatId: number, text: string): Promise<void> {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    })
  });
}

// Start polling for updates
export async function startPolling(): Promise<void> {
  logger.info('Starting Telegram bot polling');

  let offset = 0;

  while (true) {
    try {
      const response = await fetch(
        `${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=30`
      );
      const data = await response.json();

      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          await processUpdate(update);
          offset = update.update_id + 1;
        }
      }
    } catch (error) {
      logger.error('Polling error', { error });
      await new Promise(r => setTimeout(r, 5000)); // Wait 5s on error
    }
  }
}
```

**Add to scheduler.ts:**
```typescript
// Export functions for Telegram commands
export async function runScrapeOnly(): Promise<void> {
  // Scrape without generation
}
```

**Verification:**
- [ ] Bot responds to /start
- [ ] /run triggers automation
- [ ] /status shows last run info
- [ ] /stats shows weekly summary

---

### 6.3 Setup Cron Scheduler

- [ ] Install node-cron
- [ ] Create `src/cron.ts` for scheduled jobs
- [ ] Configure weekly Sunday 03:00 job
- [ ] Add startup script for PM2/systemd
- [ ] Add health check endpoint

**Files:**
- `backend/content-automation/src/cron.ts` (new)
- `backend/content-automation/ecosystem.config.js` (PM2)
- `backend/content-automation/package.json` (update scripts)

**Install dependency:**
```bash
npm install node-cron
npm install -D @types/node-cron
```

**Cron Setup:**
```typescript
// backend/content-automation/src/cron.ts
import cron from 'node-cron';
import { runWeeklyAutomation } from './scheduler';
import { logger } from './utils/logger';
import { notify } from './publishers/telegram-bot';

// Weekly automation: Sunday at 03:00
const WEEKLY_SCHEDULE = '0 3 * * 0';

export function startCronJobs(): void {
  logger.info('Starting cron scheduler');

  // Weekly content automation
  cron.schedule(WEEKLY_SCHEDULE, async () => {
    logger.info('Starting scheduled weekly automation');

    try {
      await notify({
        type: 'info',
        message: '🕐 Починаю щотижневу автоматизацію контенту...'
      });

      await runWeeklyAutomation();

    } catch (error) {
      logger.error('Scheduled automation failed', { error });
      await notify({
        type: 'error',
        message: `❌ Помилка щотижневої автоматизації: ${error}`
      });
    }
  }, {
    timezone: 'Europe/Kyiv'
  });

  logger.info(`Cron scheduled: ${WEEKLY_SCHEDULE} (Europe/Kyiv)`);
}

// Health check for monitoring
export function getSchedulerStatus(): object {
  return {
    status: 'running',
    nextRun: getNextRunDate(),
    timezone: 'Europe/Kyiv'
  };
}

function getNextRunDate(): string {
  // Calculate next Sunday 03:00
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(3, 0, 0, 0);
  return nextSunday.toISOString();
}
```

**Update index.ts:**
```typescript
// backend/content-automation/src/index.ts
import { startCronJobs } from './cron';
import { startPolling } from './telegram-commands';
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

**PM2 Config:**
```javascript
// backend/content-automation/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'content-automation',
    script: 'npx',
    args: 'tsx src/index.ts',
    cwd: '/home/snisar/RubyProjects/site_Bridgestone/backend/content-automation',
    env: {
      NODE_ENV: 'production'
    },
    // Restart on crash
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000,
    // Logs
    log_file: 'logs/combined.log',
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
```

**Update package.json:**
```json
{
  "scripts": {
    "start": "tsx src/index.ts",
    "start:pm2": "pm2 start ecosystem.config.js",
    "stop:pm2": "pm2 stop content-automation",
    "logs": "pm2 logs content-automation"
  }
}
```

**Verification:**
- [ ] node-cron installed
- [ ] Cron job scheduled correctly
- [ ] PM2 config works
- [ ] Service restarts on crash

---

### 6.4 Create Telegram Bot via @BotFather (Manual)

This is a manual task - document steps for reference.

**Steps:**

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Enter bot name: `Bridgestone Content Bot`
4. Enter username: `bridgestone_content_bot` (must be unique)
5. Copy the API token provided
6. Add token to `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

**Get Chat ID:**

1. Add the bot to your channel/group
2. Send a message in the channel
3. Visit: `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. Find `chat.id` in the response
5. Add to `.env`:
   ```env
   TELEGRAM_CHAT_ID=-1001234567890
   ```

**Test bot:**
```bash
curl "https://api.telegram.org/bot<TOKEN>/getMe"
```

**Verification:**
- [ ] Bot created via @BotFather
- [ ] Token added to .env
- [ ] Chat ID obtained
- [ ] Test message works

---

## Completion Checklist

Before marking this phase complete:

1. [ ] All 4 tasks completed
2. [ ] Image handler generates images
3. [ ] Telegram commands work
4. [ ] Cron scheduler runs
5. [ ] Bot created and configured
6. [ ] Commit changes:
   ```bash
   git add .
   git commit -m "feat(backend): add image handler, telegram commands, cron scheduler

   - Add DALL-E 3 image generation
   - Add Telegram bot commands (/run, /status, /stats)
   - Setup node-cron for weekly automation
   - Add PM2 configuration"
   ```
7. [ ] Update PROGRESS.md
