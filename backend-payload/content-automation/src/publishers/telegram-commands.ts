/**
 * Telegram Bot Commands Handler
 *
 * Implements bot commands: /start, /help, /run, /scrape, /status, /stats
 * Uses long-polling to receive updates with graceful shutdown support.
 */

import { ENV } from "../config/env.js";
import { notify, escapeHtml } from "./telegram-bot.js";
import { runWeeklyAutomation } from "../scheduler.js";
import { getMetricsSummary, formatSummaryForTelegram } from "../utils/metrics.js";
import { logger } from "../utils/logger.js";
import { withRetry } from "../utils/retry.js";

// Constants
const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

// Types
interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number };
    from?: { username?: string; first_name?: string };
    text?: string;
    date: number;
  };
}

interface TelegramResponse {
  ok: boolean;
  result: TelegramUpdate[];
}

// State tracking
interface RunStatus {
  isRunning: boolean;
  lastRunAt: string | null;
  lastRunDuration: number | null;
  lastRunStatus: "success" | "error" | null;
  lastRunError: string | null;
}

let runStatus: RunStatus = {
  isRunning: false,
  lastRunAt: null,
  lastRunDuration: null,
  lastRunStatus: null,
  lastRunError: null,
};

// Polling control
let shouldStop = false;

// Constants
const TELEGRAM_API = `https://api.telegram.org/bot${ENV.TELEGRAM_BOT_TOKEN}`;
const AUTHORIZED_CHAT_ID = ENV.TELEGRAM_CHAT_ID;

// Helper functions
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours} год ${minutes % 60} хв`;
  }
  if (minutes > 0) {
    return `${minutes} хв ${seconds % 60} сек`;
  }
  return `${seconds} сек`;
}

/**
 * Truncate message to fit Telegram API limit (4096 chars)
 */
function truncateMessage(text: string): string {
  if (text.length <= TELEGRAM_MAX_MESSAGE_LENGTH) return text;

  const truncationSuffix = "\n\n...[truncated]";
  return text.slice(0, TELEGRAM_MAX_MESSAGE_LENGTH - truncationSuffix.length) + truncationSuffix;
}

/**
 * Send a message to the chat with retry logic and HTML parse_mode
 */
async function sendMessage(chatId: number, text: string): Promise<boolean> {
  const truncated = truncateMessage(text);

  const result = await withRetry(
    async () => {
      const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: truncated,
          parse_mode: "HTML",
        }),
      });
      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }
      return true;
    },
    { maxRetries: 2, initialDelayMs: 1000, maxDelayMs: 5000 }
  );

  if (!result.success) {
    logger.error("Failed to send Telegram message", {
      error: result.error?.message || "Unknown error",
      stack: result.error?.stack,
    });
    return false;
  }

  return true;
}

/**
 * Check if user is authorized
 */
function isAuthorized(chatId: number): boolean {
  return String(chatId) === AUTHORIZED_CHAT_ID;
}

// Command handlers (using HTML formatting)
const commands: Record<string, (chatId: number) => Promise<string>> = {
  "/start": async () => {
    return `
<b>Bridgestone Content Automation Bot</b>

Доступні команди:
/run - Запустити повний цикл автоматизації
/scrape - Тільки скрапінг джерел
/status - Статус останнього запуску
/stats - Статистика за тиждень
/help - Показати цю довідку

<i>Бот працює тільки з авторизованого чату.</i>
    `.trim();
  },

  "/help": async () => {
    return `
<b>Довідка</b>

/run - Запускає повний цикл: скрапінг → генерація контенту → публікація
/scrape - Тільки збір даних з ProKoleso та тестових ресурсів
/status - Показує статус та результат останнього запуску
/stats - Статистика обробки за останній тиждень

<i>Автоматичний запуск: щонеділі о 03:00 за київським часом</i>
    `.trim();
  },

  "/run": async (chatId) => {
    if (runStatus.isRunning) {
      return "Автоматизація вже запущена. Зачекайте завершення.";
    }

    runStatus.isRunning = true;
    runStatus.lastRunAt = new Date().toISOString();

    await sendMessage(chatId, "Запускаю повний цикл автоматизації...");

    const startTime = Date.now();

    try {
      const result = await runWeeklyAutomation();

      runStatus.isRunning = false;
      runStatus.lastRunDuration = Date.now() - startTime;
      runStatus.lastRunStatus = result.errors.length === 0 ? "success" : "error";
      runStatus.lastRunError = result.errors.length > 0 ? result.errors.join("; ") : null;

      const statusEmoji = result.errors.length === 0 ? "✅" : "⚠️";
      return `
${statusEmoji} <b>Автоматизація завершена</b>

Час виконання: ${formatDuration(runStatus.lastRunDuration)}
Шин оброблено: ${result.tyresProcessed}
Нових моделей: ${result.tyresNew}
Статей: ${result.articlesGenerated}
Бейджів: ${result.badgesAssigned}
${result.errors.length > 0 ? `Помилок: ${result.errors.length}` : "Помилок немає"}
      `.trim();
    } catch (error) {
      runStatus.isRunning = false;
      runStatus.lastRunDuration = Date.now() - startTime;
      runStatus.lastRunStatus = "error";
      runStatus.lastRunError = error instanceof Error ? error.message : String(error);

      return `❌ Помилка автоматизації: ${escapeHtml(runStatus.lastRunError)}`;
    }
  },

  "/scrape": async (chatId) => {
    if (runStatus.isRunning) {
      return "Автоматизація вже запущена. Зачекайте завершення.";
    }

    await sendMessage(chatId, "Запускаю скрапінг джерел...");

    try {
      // Import dynamically to avoid circular dependency
      const { scrapeProkoleso, mergeAndSaveResults } = await import("../scrapers/prokoleso.js");
      const result = await scrapeProkoleso();

      // Merge and save with flag preservation
      if (result.tires.length > 0 || result.skippedSlugs.size > 0) {
        mergeAndSaveResults(result.tires, result.skippedSlugs, result.existingData);
      }

      return `
<b>Скрапінг завершено</b>

Знайдено шин: ${result.tires.length}
Пропущено (вже оброблені): ${result.skippedSlugs.size}
Джерело: ProKoleso.ua
      `.trim();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return `❌ Помилка скрапінгу: ${escapeHtml(errorMessage)}`;
    }
  },

  "/status": async () => {
    if (runStatus.isRunning) {
      return "⏳ Автоматизація зараз виконується...";
    }

    if (!runStatus.lastRunAt) {
      return "Ще не було жодного запуску.";
    }

    const statusEmoji = runStatus.lastRunStatus === "success" ? "✅" : "⚠️";
    const lastRunDate = new Date(runStatus.lastRunAt).toLocaleString("uk-UA", {
      timeZone: "Europe/Kyiv",
    });

    return `
${statusEmoji} <b>Статус останнього запуску</b>

Час: ${lastRunDate}
Тривалість: ${runStatus.lastRunDuration ? formatDuration(runStatus.lastRunDuration) : "N/A"}
Результат: ${runStatus.lastRunStatus === "success" ? "Успішно" : "З помилками"}
${runStatus.lastRunError ? `Помилка: ${escapeHtml(runStatus.lastRunError)}` : ""}
    `.trim();
  },

  "/stats": async () => {
    try {
      const summary = getMetricsSummary("week");
      return formatSummaryForTelegram(summary);
    } catch {
      return "Не вдалось отримати статистику. Можливо, база даних не ініціалізована.";
    }
  },
};

/**
 * Process a single update
 */
async function processUpdate(update: TelegramUpdate): Promise<void> {
  const message = update.message;
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();

  // Check authorization
  if (!isAuthorized(chatId)) {
    await sendMessage(chatId, "Ви не авторизовані для використання цього бота.");
    logger.warn(`Unauthorized access attempt from chat ${chatId}`);
    return;
  }

  // Find and execute command
  const commandKey = Object.keys(commands).find((cmd) => text.startsWith(cmd));

  if (commandKey) {
    logger.info(`Executing command: ${commandKey}`);
    const handler = commands[commandKey];
    const response = await handler(chatId);
    await sendMessage(chatId, response);
  } else if (text.startsWith("/")) {
    await sendMessage(chatId, "Невідома команда. Використовуйте /help для довідки.");
  }
}

/**
 * Stop the polling loop gracefully
 */
export function stopPolling(): void {
  shouldStop = true;
  logger.info("Telegram bot polling stop requested");
}

/**
 * Start long-polling for updates with graceful shutdown support
 */
export async function startPolling(): Promise<void> {
  if (!ENV.TELEGRAM_BOT_TOKEN || !ENV.TELEGRAM_CHAT_ID) {
    logger.warn("Telegram credentials not configured. Bot commands disabled.");
    return;
  }

  logger.info("Starting Telegram bot polling...");
  shouldStop = false;

  let offset = 0;
  let retryDelay = 1000;

  while (!shouldStop) {
    try {
      const response = await fetch(
        `${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=30&allowed_updates=["message"]`,
        { signal: AbortSignal.timeout(35000) }
      );

      if (shouldStop) break;

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

      const data: TelegramResponse = await response.json();

      for (const update of data.result) {
        if (shouldStop) break;
        await processUpdate(update);
        offset = update.update_id + 1;
      }

      // Reset retry delay on success
      retryDelay = 1000;
    } catch (error) {
      if (shouldStop) break;

      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error("Polling error", { error: errorMsg, stack: error instanceof Error ? error.stack : undefined });

      // Exponential backoff with max 60 seconds
      await sleep(retryDelay);
      retryDelay = Math.min(retryDelay * 2, 60000);
    }
  }

  logger.info("Telegram bot polling stopped");
}

/**
 * Update run status (for use by cron scheduler)
 */
export function setRunStatus(status: Partial<RunStatus>): void {
  runStatus = { ...runStatus, ...status };
}

/**
 * Get current run status
 */
export function getRunStatus(): RunStatus {
  return { ...runStatus };
}
