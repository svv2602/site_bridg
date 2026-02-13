/**
 * Telegram Bot Commands Handler
 *
 * Implements bot commands with interactive features:
 * - Basic: /start, /help, /run, /scrape, /status, /stats
 * - Extended: /sources, /queue, /articles, /costs, /retry
 * - Interactive: callback buttons for approve/reject/retry
 * - Reply keyboard: persistent button grid
 * - Rich notifications: article review, errors with retry, published with image
 *
 * Uses long-polling to receive updates with graceful shutdown support.
 */

import { ENV } from "../config/env.js";
import { notify, escapeHtml } from "./telegram-bot.js";
import { runWeeklyAutomation } from "../scheduler.js";
import { getMetricsSummary, formatSummaryForTelegram } from "../utils/metrics.js";
import { createLogger } from "../utils/logger.js";
import {
  getAllSources,
  getSource,
  getQueueStats,
  getRecentQueue,
  getQueueItem,
  updateQueueItem,
  type ScraperKey,
} from "../db/article-queue.js";

const logger = createLogger("TelegramBot");
import { withRetry } from "../utils/retry.js";

// Constants
const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;
const PHOTO_CAPTION_MAX_LENGTH = 1024;

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
  callback_query?: {
    id: string;
    from: { id: number };
    message?: { message_id: number; chat: { id: number } };
    data?: string;
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

// ============ REPLY KEYBOARD ============

const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: "📊 Статус" }, { text: "🔄 Запустити" }],
    [{ text: "📋 Черга" }, { text: "📰 Джерела" }],
    [{ text: "💰 Витрати" }, { text: "❓ Допомога" }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

const BUTTON_ALIASES: Record<string, string> = {
  "📊 Статус": "/status",
  "🔄 Запустити": "/run",
  "📋 Черга": "/queue",
  "📰 Джерела": "/sources",
  "💰 Витрати": "/costs",
  "❓ Допомога": "/help",
};

// ============ HELPER FUNCTIONS ============

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

function truncateMessage(text: string, maxLen = TELEGRAM_MAX_MESSAGE_LENGTH): string {
  if (text.length <= maxLen) return text;
  const truncationSuffix = "\n\n...[truncated]";
  return text.slice(0, maxLen - truncationSuffix.length) + truncationSuffix;
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} дн тому`;
  if (hours > 0) return `${hours} год тому`;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes > 0) return `${minutes} хв тому`;
  return "щойно";
}

function formatKyivDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString("uk-UA", {
    timeZone: "Europe/Kyiv",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============ TOPIC HELPERS ============

function getTopicId(type: "reports" | "errors" | "content"): number | undefined {
  const envMap = {
    reports: ENV.TELEGRAM_TOPIC_REPORTS,
    errors: ENV.TELEGRAM_TOPIC_ERRORS,
    content: ENV.TELEGRAM_TOPIC_CONTENT,
  };
  const raw = envMap[type];
  if (!raw) return undefined;
  const id = parseInt(raw, 10);
  return isNaN(id) ? undefined : id;
}

// ============ TELEGRAM API HELPERS ============

/**
 * Send a message to the chat with retry logic and HTML parse_mode
 */
async function sendMessage(
  chatId: number,
  text: string,
  options?: { reply_markup?: object; message_thread_id?: number }
): Promise<boolean> {
  const truncated = truncateMessage(text);

  const result = await withRetry(
    async () => {
      const body: Record<string, unknown> = {
        chat_id: chatId,
        text: truncated,
        parse_mode: "HTML",
      };
      if (options?.reply_markup) {
        body.reply_markup = options.reply_markup;
      }
      if (options?.message_thread_id) {
        body.message_thread_id = options.message_thread_id;
      }

      const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
 * Answer a callback query (acknowledge button press)
 */
async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  try {
    await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || "",
      }),
    });
  } catch (error) {
    logger.error("Failed to answer callback query", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Edit a previously sent message
 */
async function editMessageText(
  chatId: number,
  messageId: number,
  text: string,
  replyMarkup?: object
): Promise<void> {
  try {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      message_id: messageId,
      text: truncateMessage(text),
      parse_mode: "HTML",
    };
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }

    await fetch(`${TELEGRAM_API}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    logger.error("Failed to edit message", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Send a photo with caption
 */
async function sendPhoto(
  chatId: number,
  photoUrl: string,
  caption: string,
  options?: { reply_markup?: object; message_thread_id?: number }
): Promise<boolean> {
  try {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      photo: photoUrl,
      caption: truncateMessage(caption, PHOTO_CAPTION_MAX_LENGTH),
      parse_mode: "HTML",
    };
    if (options?.reply_markup) {
      body.reply_markup = options.reply_markup;
    }
    if (options?.message_thread_id) {
      body.message_thread_id = options.message_thread_id;
    }

    const response = await fetch(`${TELEGRAM_API}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.ok;
  } catch (error) {
    logger.error("Failed to send photo", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

// ============ AUTHORIZATION ============

function isAuthorized(chatId: number): boolean {
  return String(chatId) === AUTHORIZED_CHAT_ID;
}

// ============ COMMAND HANDLERS ============

type CommandHandler = (chatId: number, args: string, threadId?: number) => Promise<string>;

const commands: Record<string, CommandHandler> = {
  "/start": async (chatId, _args, threadId) => {
    // Send with keyboard
    const text = `
<b>Bridgestone Content Automation Bot</b>

Доступні команди:
/run - Запустити повний цикл автоматизації
/scrape - Скрапінг (або /scrape &lt;source&gt;)
/articles - Запустити генерацію статей
/status - Статус останнього запуску
/stats - Статистика за тиждень
/sources - Джерела контенту
/queue - Черга статей
/costs - Витрати API
/retry &lt;id&gt; - Повторити невдалу статтю
/help - Показати цю довідку

<i>Бот працює тільки з авторизованого чату.</i>
    `.trim();

    await sendMessage(chatId, text, { reply_markup: MAIN_KEYBOARD, message_thread_id: threadId });
    return ""; // Already sent with keyboard
  },

  "/help": async (chatId, _args, threadId) => {
    const text = `
<b>Довідка</b>

<b>Основні команди:</b>
/run - Повний цикл: скрапінг → генерація → публікація
/scrape - Скрапінг ProKoleso
/scrape &lt;source&gt; - Скрапінг конкретного джерела (adac, autobild, oeamtc, tcs, gtue, bridgestone-news, tyrereviews)
/articles - Генерація статей (smart pipeline)
/status - Статус останнього запуску
/stats - Статистика за тиждень

<b>Розширені:</b>
/sources - Список джерел контенту та їх статус
/queue - Черга статей з підсумками
/costs - Витрати на API (сьогодні/тиждень/місяць)
/retry &lt;id&gt; - Повторити невдалу генерацію статті

<i>Автоматичний запуск: щонеділі о 03:00, статті — щосереди о 05:00</i>
    `.trim();

    await sendMessage(chatId, text, { reply_markup: MAIN_KEYBOARD, message_thread_id: threadId });
    return "";
  },

  "/run": async (chatId, _args, threadId) => {
    if (runStatus.isRunning) {
      return "Автоматизація вже запущена. Зачекайте завершення.";
    }

    runStatus.isRunning = true;
    runStatus.lastRunAt = new Date().toISOString();

    await sendMessage(chatId, "Запускаю повний цикл автоматизації...", { message_thread_id: threadId });

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

  "/scrape": async (chatId, args, threadId) => {
    if (runStatus.isRunning) {
      return "Автоматизація вже запущена. Зачекайте завершення.";
    }

    // If args provided, try to scrape a specific source
    if (args) {
      const sourceId = args.toLowerCase().trim();
      const source = getSource(sourceId);

      if (!source) {
        const allSources = getAllSources();
        const validIds = allSources.map((s) => s.id).join(", ");
        return `Невідоме джерело: <code>${escapeHtml(sourceId)}</code>\n\nДоступні: ${validIds}`;
      }

      await sendMessage(chatId, `Запускаю скрапінг: ${escapeHtml(source.name)}...`, { message_thread_id: threadId });

      try {
        const { runSmartArticlePipeline } = await import("../article-pipeline.js");
        // We can't easily run a single source scan, so notify and explain
        // Instead, use the dynamic import pattern for individual scrapers
        const scraperModule = await import(`../scrapers/${source.scraper}.js`);

        let newResults = 0;
        if (source.scraper === "bridgestone-news") {
          const result = await scraperModule.scrapeBridgestoneNews();
          newResults = result.newsNew;
        } else {
          // Browser-based scrapers need Playwright
          const { chromium } = await import("playwright");
          const browser = await chromium.launch({ headless: true });
          try {
            const page = await browser.newPage();
            const scraperFnMap: Record<string, string> = {
              adac: "scrapeADAC",
              autobild: "scrapeAutoBild",
              tyrereviews: "scrapeTyreReviews",
              oeamtc: "scrapeOEAMTC",
              tcs: "scrapeTCS",
              gtue: "scrapeGTUE",
            };
            const fnName = scraperFnMap[source.scraper];
            if (fnName && scraperModule[fnName]) {
              const result = await scraperModule[fnName](page);
              newResults = result.testsNew;
            }
          } finally {
            await browser.close();
          }
        }

        // Update source last checked time
        const { updateSource } = await import("../db/article-queue.js");
        updateSource(source.id, {
          lastCheckedAt: new Date().toISOString(),
          lastFoundNew: newResults,
        });

        return `
<b>Скрапінг завершено</b>

Джерело: ${escapeHtml(source.name)}
Нових результатів: ${newResults}
        `.trim();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `❌ Помилка скрапінгу ${escapeHtml(source.name)}: ${escapeHtml(errorMessage)}`;
      }
    }

    // Default: ProKoleso scrape
    await sendMessage(chatId, "Запускаю скрапінг ProKoleso...", { message_thread_id: threadId });

    try {
      const { scrapeProkoleso, mergeAndSaveResults } = await import("../scrapers/prokoleso.js");
      const result = await scrapeProkoleso();

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

  "/sources": async () => {
    try {
      const sources = getAllSources();

      let text = "<b>📰 Джерела контенту</b>\n\n";

      for (const source of sources) {
        const enabledIcon = source.enabled ? "✅" : "⏸";
        const lastChecked = source.lastCheckedAt
          ? formatTimeAgo(source.lastCheckedAt)
          : "ніколи";

        // Check if source is overdue
        let overdueIcon = "";
        if (source.enabled && source.lastCheckedAt) {
          const hoursSince =
            (Date.now() - new Date(source.lastCheckedAt).getTime()) / (1000 * 60 * 60);
          if (hoursSince >= source.checkIntervalHours) {
            overdueIcon = " ⏰";
          }
        } else if (source.enabled && !source.lastCheckedAt) {
          overdueIcon = " ⏰";
        }

        text += `${enabledIcon} <b>${escapeHtml(source.name)}</b>${overdueIcon}\n`;
        text += `   Остання перевірка: ${lastChecked}`;
        if (source.lastFoundNew > 0) {
          text += ` (${source.lastFoundNew} нових)`;
        }
        text += `\n   Інтервал: ${source.checkIntervalHours} год | ID: <code>${source.id}</code>\n\n`;
      }

      return text.trim();
    } catch {
      return "Не вдалось отримати джерела. Можливо, база даних не ініціалізована.";
    }
  },

  "/queue": async () => {
    try {
      const stats = getQueueStats();
      const recent = getRecentQueue(5);

      let text = "<b>📋 Черга статей</b>\n\n";

      // Stats summary
      text += "<b>За статусом:</b>\n";
      const statusLabels: Record<string, string> = {
        pending: "⏳ Очікують",
        generating: "⚙️ Генерація",
        review: "👀 На перевірку",
        published: "✅ Опубліковано",
        failed: "❌ Невдалі",
        rejected: "🚫 Відхилено",
      };

      for (const [status, label] of Object.entries(statusLabels)) {
        const count = stats[status as keyof typeof stats] || 0;
        if (count > 0) {
          text += `  ${label}: ${count}\n`;
        }
      }

      const total = Object.values(stats).reduce((a, b) => a + b, 0);
      text += `  Всього: ${total}\n`;

      // Recent items
      if (recent.length > 0) {
        text += `\n<b>Останні:</b>\n`;
        for (const item of recent) {
          const statusIcon =
            item.status === "published" ? "✅" :
            item.status === "review" ? "👀" :
            item.status === "failed" ? "❌" :
            item.status === "pending" ? "⏳" :
            item.status === "generating" ? "⚙️" : "🚫";
          const date = formatKyivDate(item.createdAt);
          text += `${statusIcon} #${item.id} ${escapeHtml(item.topic.slice(0, 40))} (${date})\n`;
        }
      }

      return text.trim();
    } catch {
      return "Не вдалось отримати чергу. Можливо, база даних не ініціалізована.";
    }
  },

  "/articles": async (chatId, _args, threadId) => {
    if (runStatus.isRunning) {
      return "Автоматизація вже запущена. Зачекайте завершення.";
    }

    await sendMessage(chatId, "Запускаю генерацію статей (smart pipeline)...", { message_thread_id: threadId });

    try {
      const { runSmartArticlePipeline } = await import("../article-pipeline.js");
      const result = await runSmartArticlePipeline();

      const hasErrors = result.errors.length > 0;
      const statusEmoji = hasErrors ? "⚠️" : "✅";

      return `
${statusEmoji} <b>Smart Article Pipeline завершено</b>

📰 Джерел переглянуто: ${result.sourcesScanned}
🆕 Нових тестів: ${result.newTestResults}
📝 Заплановано: ${result.articlesPlanned}
✅ Згенеровано: ${result.articlesGenerated}
📤 Опубліковано: ${result.articlesPublished}
👀 На перевірку: ${result.articlesForReview}
${hasErrors ? `⚠️ Помилок: ${result.errors.length}` : ""}
      `.trim();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return `❌ Помилка pipeline: ${escapeHtml(errorMessage)}`;
    }
  },

  "/costs": async () => {
    try {
      const today = getMetricsSummary("day");
      const week = getMetricsSummary("week");
      const month = getMetricsSummary("month");

      return `
<b>💰 Витрати API</b>

<b>Сьогодні:</b>
  Витрати: $${today.totals.costUsd.toFixed(2)}
  Токенів: ${today.totals.tokensUsed.toLocaleString()}
  Статей: ${today.totals.articlesGenerated}

<b>Тиждень:</b>
  Витрати: $${week.totals.costUsd.toFixed(2)}
  Токенів: ${week.totals.tokensUsed.toLocaleString()}
  Статей: ${week.totals.articlesGenerated}

<b>Місяць:</b>
  Витрати: $${month.totals.costUsd.toFixed(2)}
  Токенів: ${month.totals.tokensUsed.toLocaleString()}
  Статей: ${month.totals.articlesGenerated}
      `.trim();
    } catch {
      return "Не вдалось отримати витрати. Можливо, база даних не ініціалізована.";
    }
  },

  "/retry": async (chatId, args, threadId) => {
    if (!args) {
      return "Вкажіть ID статті: /retry &lt;id&gt;";
    }

    const itemId = parseInt(args, 10);
    if (isNaN(itemId)) {
      return "Невалідний ID. Використовуйте: /retry &lt;id&gt;";
    }

    const item = getQueueItem(itemId);
    if (!item) {
      return `Статтю #${itemId} не знайдено в черзі.`;
    }

    if (item.status !== "failed") {
      return `Статтю #${itemId} не можна повторити — статус: "${item.status}" (потрібен "failed").`;
    }

    await sendMessage(chatId, `Повторюю генерацію #${itemId}: "${escapeHtml(item.topic)}"...`, { message_thread_id: threadId });

    try {
      updateQueueItem(item.id, { status: "pending" });
      const { processSingleQueueItem } = await import("../article-pipeline.js");
      const result = await processSingleQueueItem(item.id);

      if (result.success) {
        return `✅ Статтю #${itemId} успішно згенеровано: "${escapeHtml(result.articleTitle || "")}"`;
      } else {
        return `❌ Повторна генерація #${itemId} не вдалась: ${escapeHtml(result.error || "Unknown")}`;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return `❌ Помилка retry: ${escapeHtml(errorMessage)}`;
    }
  },
};

// ============ CALLBACK QUERY HANDLERS ============

async function processCallbackQuery(update: TelegramUpdate): Promise<void> {
  const callback = update.callback_query;
  if (!callback || !callback.data) return;

  const chatId = callback.message?.chat.id;
  const messageId = callback.message?.message_id;
  if (!chatId || !messageId) return;

  // Check authorization
  if (!isAuthorized(chatId)) {
    await answerCallbackQuery(callback.id, "Не авторизовано");
    return;
  }

  const [action, idStr] = callback.data.split(":");
  const queueId = parseInt(idStr, 10);

  if (isNaN(queueId)) {
    await answerCallbackQuery(callback.id, "Невалідний ID");
    return;
  }

  switch (action) {
    case "approve":
      await handleApprove(callback.id, chatId, messageId, queueId);
      break;
    case "reject":
      await handleReject(callback.id, chatId, messageId, queueId);
      break;
    case "retry":
      await handleRetryCallback(callback.id, chatId, messageId, queueId);
      break;
    default:
      await answerCallbackQuery(callback.id, "Невідома дія");
  }
}

async function handleApprove(
  callbackId: string,
  chatId: number,
  messageId: number,
  queueId: number
): Promise<void> {
  await answerCallbackQuery(callbackId, "Публікую...");

  const item = getQueueItem(queueId);
  if (!item) {
    await editMessageText(chatId, messageId, `❌ Статтю #${queueId} не знайдено.`);
    return;
  }

  if (item.status !== "review") {
    await editMessageText(
      chatId,
      messageId,
      `Статтю #${queueId} не можна опублікувати — статус: "${item.status}".`
    );
    return;
  }

  if (!item.generatedPayloadId) {
    await editMessageText(chatId, messageId, `❌ Статтю #${queueId} не має Payload ID.`);
    return;
  }

  try {
    // Publish in CMS (change status from draft to published)
    const { getPayloadClient } = await import("./payload-client.js");
    const client = getPayloadClient();
    await client.updateArticle(item.generatedPayloadId, { _status: "published" });

    updateQueueItem(queueId, {
      status: "published",
      processedAt: new Date().toISOString(),
    });

    await editMessageText(
      chatId,
      messageId,
      `✅ Статтю #${queueId} опубліковано!\n\n"${escapeHtml(item.topic)}"`
    );

    // Send published notification with image
    await sendArticlePublished({
      title: item.topic,
      slug: "",
      payloadId: item.generatedPayloadId,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await editMessageText(
      chatId,
      messageId,
      `❌ Помилка публікації #${queueId}: ${escapeHtml(msg)}\n\nСтаття залишається на перевірці.`
    );
  }
}

async function handleReject(
  callbackId: string,
  chatId: number,
  messageId: number,
  queueId: number
): Promise<void> {
  await answerCallbackQuery(callbackId, "Відхилено");

  const item = getQueueItem(queueId);
  if (!item) {
    await editMessageText(chatId, messageId, `❌ Статтю #${queueId} не знайдено.`);
    return;
  }

  if (item.status !== "review") {
    await editMessageText(
      chatId,
      messageId,
      `Статтю #${queueId} не можна відхилити — статус: "${item.status}".`
    );
    return;
  }

  updateQueueItem(queueId, {
    status: "rejected",
    processedAt: new Date().toISOString(),
  });

  await editMessageText(
    chatId,
    messageId,
    `🚫 Статтю #${queueId} відхилено.\n\n"${escapeHtml(item.topic)}"`
  );
}

async function handleRetryCallback(
  callbackId: string,
  chatId: number,
  messageId: number,
  queueId: number
): Promise<void> {
  await answerCallbackQuery(callbackId, "Повторюю...");

  const item = getQueueItem(queueId);
  if (!item) {
    await editMessageText(chatId, messageId, `❌ Статтю #${queueId} не знайдено.`);
    return;
  }

  if (item.status !== "failed") {
    await editMessageText(
      chatId,
      messageId,
      `Статтю #${queueId} не можна повторити — статус: "${item.status}".`
    );
    return;
  }

  await editMessageText(
    chatId,
    messageId,
    `⏳ Повторюю генерацію #${queueId}: "${escapeHtml(item.topic)}"...`
  );

  try {
    updateQueueItem(queueId, { status: "pending" });
    const { processSingleQueueItem } = await import("../article-pipeline.js");
    const result = await processSingleQueueItem(queueId);

    if (result.success) {
      await editMessageText(
        chatId,
        messageId,
        `✅ Статтю #${queueId} успішно згенеровано!\n\n"${escapeHtml(result.articleTitle || "")}"`
      );
    } else {
      // Show retry button again
      await editMessageText(
        chatId,
        messageId,
        `❌ Повторна генерація #${queueId} не вдалась:\n${escapeHtml(result.error || "Unknown")}\n\n"${escapeHtml(item.topic)}"`,
        {
          inline_keyboard: [
            [{ text: "🔄 Повторити", callback_data: `retry:${queueId}` }],
          ],
        }
      );
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await editMessageText(
      chatId,
      messageId,
      `❌ Помилка retry #${queueId}: ${escapeHtml(msg)}`,
      {
        inline_keyboard: [
          [{ text: "🔄 Повторити", callback_data: `retry:${queueId}` }],
        ],
      }
    );
  }
}

// ============ EXPORTED NOTIFICATION FUNCTIONS ============

/**
 * Send article for review with approve/reject inline buttons.
 * Called from article-pipeline.ts when an article is set to "review" status.
 */
export async function sendArticleForReview(
  queueId: number,
  title: string,
  excerpt: string
): Promise<void> {
  if (!ENV.TELEGRAM_BOT_TOKEN || !ENV.TELEGRAM_CHAT_ID) return;

  const chatId = parseInt(ENV.TELEGRAM_CHAT_ID, 10);
  if (isNaN(chatId)) return;

  const text = `
👀 <b>Стаття на перевірку</b> #${queueId}

<b>${escapeHtml(title)}</b>

${escapeHtml(excerpt.slice(0, 300))}${excerpt.length > 300 ? "..." : ""}
  `.trim();

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Опублікувати", callback_data: `approve:${queueId}` },
          { text: "❌ Відхилити", callback_data: `reject:${queueId}` },
        ],
      ],
    },
    message_thread_id: getTopicId("content"),
  });
}

/**
 * Send error notification with retry button.
 * Called from article-pipeline.ts when generation fails.
 */
export async function sendArticleError(
  queueId: number,
  topic: string,
  error: string
): Promise<void> {
  if (!ENV.TELEGRAM_BOT_TOKEN || !ENV.TELEGRAM_CHAT_ID) return;

  const chatId = parseInt(ENV.TELEGRAM_CHAT_ID, 10);
  if (isNaN(chatId)) return;

  const text = `
❌ <b>Помилка генерації</b> #${queueId}

<b>Тема:</b> ${escapeHtml(topic)}
<b>Помилка:</b> ${escapeHtml(error.slice(0, 500))}
  `.trim();

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔄 Повторити", callback_data: `retry:${queueId}` }],
      ],
    },
    message_thread_id: getTopicId("errors"),
  });
}

/**
 * Send notification about a published article, optionally with cover image.
 * Called from article-pipeline.ts after successful publish.
 */
export async function sendArticlePublished(params: {
  title: string;
  slug: string;
  payloadId: string;
  imageMediaId?: number;
}): Promise<void> {
  if (!ENV.TELEGRAM_BOT_TOKEN || !ENV.TELEGRAM_CHAT_ID) return;

  const chatId = parseInt(ENV.TELEGRAM_CHAT_ID, 10);
  if (isNaN(chatId)) return;

  const payloadUrl = `${ENV.PAYLOAD_URL}/admin/collections/articles/${params.payloadId}`;
  const viewButton = {
    inline_keyboard: [
      [{ text: "📝 Переглянути в Payload", url: payloadUrl }],
    ],
  };

  const messageOptions = {
    reply_markup: viewButton,
    message_thread_id: getTopicId("content"),
  };

  // Try sending with cover image
  if (params.imageMediaId) {
    try {
      const imageUrl = `${ENV.PAYLOAD_URL}/api/media/${params.imageMediaId}/file`;
      const caption = `📤 <b>Статтю опубліковано</b>\n\n${escapeHtml(params.title)}`;

      const sent = await sendPhoto(chatId, imageUrl, caption, messageOptions);
      if (sent) return; // Success with photo
    } catch {
      // Fall through to text notification
    }
  }

  // Fallback: text notification
  const text = `
📤 <b>Статтю опубліковано</b>

${escapeHtml(params.title)}
  `.trim();

  await sendMessage(chatId, text, messageOptions);
}

/**
 * Send daily digest summary.
 * Called from cron job every morning.
 */
export async function sendDailyDigest(): Promise<void> {
  if (!ENV.TELEGRAM_BOT_TOKEN || !ENV.TELEGRAM_CHAT_ID) return;

  const chatId = parseInt(ENV.TELEGRAM_CHAT_ID, 10);
  if (isNaN(chatId)) return;

  try {
    // Gather data
    const sources = getAllSources();
    const stats = getQueueStats();
    const todayMetrics = getMetricsSummary("day");
    const weekMetrics = getMetricsSummary("week");

    let text = "☀️ <b>Ранковий дайджест</b>\n\n";

    // Sources status
    text += "<b>📰 Джерела:</b>\n";
    for (const source of sources) {
      if (!source.enabled) continue;

      let icon = "✅";
      let timeInfo = "ніколи";

      if (source.lastCheckedAt) {
        timeInfo = formatTimeAgo(source.lastCheckedAt);
        const hoursSince =
          (Date.now() - new Date(source.lastCheckedAt).getTime()) / (1000 * 60 * 60);
        if (hoursSince >= source.checkIntervalHours) {
          icon = "⏰";
        }
      } else {
        icon = "⏰";
      }

      text += `  ${icon} ${source.name} — ${timeInfo}\n`;
    }

    // Queue stats
    text += `\n<b>📋 Черга:</b>\n`;
    if (stats.pending > 0) text += `  ⏳ Очікують: ${stats.pending}\n`;
    if (stats.review > 0) text += `  👀 На перевірку: ${stats.review}\n`;
    if (stats.generating > 0) text += `  ⚙️ Генерація: ${stats.generating}\n`;
    text += `  ✅ Опубліковано: ${stats.published}\n`;
    if (stats.failed > 0) text += `  ❌ Невдалі: ${stats.failed}\n`;

    // Costs
    text += `\n<b>💰 Витрати:</b>\n`;
    text += `  Сьогодні: $${todayMetrics.totals.costUsd.toFixed(2)}\n`;
    text += `  Тиждень: $${weekMetrics.totals.costUsd.toFixed(2)}\n`;

    await sendMessage(chatId, text.trim(), {
      message_thread_id: getTopicId("reports"),
    });

    logger.info("Daily digest sent");
  } catch (error) {
    logger.error("Failed to send daily digest", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ============ UPDATE PROCESSING ============

/**
 * Process a single update
 */
async function processUpdate(update: TelegramUpdate): Promise<void> {
  // Handle callback queries (button presses)
  if (update.callback_query) {
    await processCallbackQuery(update);
    return;
  }

  const message = update.message;
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  let text = message.text.trim();

  // Check authorization
  if (!isAuthorized(chatId)) {
    await sendMessage(chatId, "Ви не авторизовані для використання цього бота.");
    logger.warn(`Unauthorized access attempt from chat ${chatId}`);
    return;
  }

  // Resolve reply keyboard button text to command
  if (BUTTON_ALIASES[text]) {
    text = BUTTON_ALIASES[text];
  }

  // Find and execute command
  const commandKey = Object.keys(commands).find((cmd) => text.startsWith(cmd));
  const reportsThreadId = getTopicId("reports");

  if (commandKey) {
    logger.info(`Executing command: ${commandKey}`);
    const handler = commands[commandKey];
    const args = text.slice(commandKey.length).trim();
    const response = await handler(chatId, args, reportsThreadId);
    // Some commands send their own messages (return empty string)
    if (response) {
      await sendMessage(chatId, response, { message_thread_id: reportsThreadId });
    }
  } else if (text.startsWith("/")) {
    await sendMessage(chatId, "Невідома команда. Використовуйте /help для довідки.", { message_thread_id: reportsThreadId });
  }
}

// ============ POLLING ============

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
        `${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=30&allowed_updates=${encodeURIComponent('["message","callback_query"]')}`,
        { signal: AbortSignal.timeout(35000) }
      );

      if (shouldStop) break;

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

      const data = (await response.json()) as TelegramResponse;

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

// ============ STATUS MANAGEMENT ============

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
