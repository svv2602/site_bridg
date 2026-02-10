/**
 * Telegram Bot for Notifications
 *
 * Sends notifications about new content, errors, and weekly summaries.
 * Uses HTML parse_mode for maximum reliability (no escaping issues with *, _, [ etc.).
 */

import { ENV } from "../config/env.js";
import { withRetry } from "../utils/retry.js";

// Constants
const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;
const TELEGRAM_MIN_INTERVAL_MS = 5000; // 5 seconds between messages (Telegram API rate limit protection)

// Rate limiter state
let lastNotifyTimestamp = 0;

// Types
export type NotificationType = "new_content" | "error" | "weekly_summary" | "info";

export interface NotificationButton {
  text: string;
  url: string;
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  buttons?: NotificationButton[];
  data?: Record<string, unknown>;
}

// Emoji mapping
const TYPE_EMOJI: Record<NotificationType, string> = {
  new_content: "🆕",
  error: "❌",
  weekly_summary: "📊",
  info: "ℹ️",
};

/**
 * Escape special HTML characters to prevent parse errors in Telegram
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Format message with HTML for Telegram
 */
function formatMessage(payload: NotificationPayload): string {
  const emoji = TYPE_EMOJI[payload.type];
  let message = `${emoji} <b>${escapeHtml(payload.title)}</b>\n\n`;
  message += payload.body;

  return message;
}

/**
 * Truncate message to fit Telegram API limit (4096 chars)
 */
function truncateMessage(message: string): string {
  if (message.length <= TELEGRAM_MAX_MESSAGE_LENGTH) return message;

  const truncationSuffix = "\n\n...[truncated]";
  return message.slice(0, TELEGRAM_MAX_MESSAGE_LENGTH - truncationSuffix.length) + truncationSuffix;
}

/**
 * Create inline keyboard from buttons
 */
function createInlineKeyboard(buttons?: NotificationButton[]): object | undefined {
  if (!buttons || buttons.length === 0) return undefined;

  return {
    inline_keyboard: [
      buttons.map((btn) => ({
        text: btn.text,
        url: btn.url,
      })),
    ],
  };
}

/**
 * Send notification to Telegram with retry logic
 */
export async function notify(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = ENV;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram credentials not set. Skipping notification.");
    return { success: false, error: "Telegram credentials not configured" };
  }

  // Rate limiting: ensure minimum interval between messages
  const now = Date.now();
  const elapsed = now - lastNotifyTimestamp;
  if (elapsed < TELEGRAM_MIN_INTERVAL_MS && lastNotifyTimestamp > 0) {
    await new Promise((resolve) =>
      setTimeout(resolve, TELEGRAM_MIN_INTERVAL_MS - elapsed)
    );
  }
  lastNotifyTimestamp = Date.now();

  const message = truncateMessage(formatMessage(payload));
  const replyMarkup = createInlineKeyboard(payload.buttons);

  const result = await withRetry(
    async () => {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "HTML",
            reply_markup: replyMarkup,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Telegram API error: ${response.status} ${errorText}`);
      }

      return true;
    },
    { maxRetries: 2, initialDelayMs: 1000, maxDelayMs: 5000 }
  );

  if (!result.success) {
    const errorMessage = result.error?.message || "Unknown error";
    console.error("Telegram notification failed after retries:", errorMessage);
    return { success: false, error: errorMessage };
  }

  return { success: true };
}

// Convenience functions

/**
 * Notify about new content
 */
export async function notifyNewContent(params: {
  tireName: string;
  descriptionLength: number;
  badges?: string[];
  payloadUrl?: string;
}) {
  const { tireName, descriptionLength, badges = [], payloadUrl } = params;

  let body = `📦 <b>Шина:</b> ${escapeHtml(tireName)}\n`;
  body += `📝 <b>Опис:</b> ${descriptionLength} слів\n`;

  if (badges.length > 0) {
    body += `🏆 <b>Badges:</b> ${escapeHtml(badges.join(", "))}\n`;
  }

  return notify({
    type: "new_content",
    title: "Новий контент згенеровано",
    body,
    buttons: payloadUrl
      ? [{ text: "Переглянути в Payload", url: payloadUrl }]
      : undefined,
  });
}

/**
 * Notify about error
 */
export async function notifyError(params: {
  operation: string;
  error: string;
  details?: string;
}) {
  const { operation, error, details } = params;

  let body = `⚠️ <b>Операція:</b> ${escapeHtml(operation)}\n`;
  body += `❌ <b>Помилка:</b> ${escapeHtml(error)}\n`;

  if (details) {
    body += `\n📋 <b>Деталі:</b>\n<pre>${escapeHtml(details.slice(0, 500))}</pre>`;
  }

  return notify({
    type: "error",
    title: "Помилка автоматизації",
    body,
  });
}

/**
 * Send weekly summary
 */
export async function notifyWeeklySummary(params: {
  tyresProcessed: number;
  tyresNew: number;
  articlesGenerated: number;
  badgesAssigned: number;
  errors: number;
}) {
  const { tyresProcessed, tyresNew, articlesGenerated, badgesAssigned, errors } = params;

  let body = `📅 <b>Тижневий звіт</b>\n\n`;
  body += `📦 Оброблено шин: ${tyresProcessed}\n`;
  body += `✨ Нових моделей: ${tyresNew}\n`;
  body += `📰 Згенеровано статей: ${articlesGenerated}\n`;
  body += `🏆 Присвоєно бейджів: ${badgesAssigned}\n`;

  if (errors > 0) {
    body += `\n⚠️ Помилок: ${errors}`;
  } else {
    body += `\n✅ Помилок не виявлено`;
  }

  return notify({
    type: "weekly_summary",
    title: "Тижневий звіт автоматизації",
    body,
    buttons: [
      { text: "Payload Admin", url: `${ENV.PAYLOAD_URL}/admin` },
    ],
  });
}

// Test
async function main() {
  console.log("Testing Telegram Bot...\n");

  if (!ENV.TELEGRAM_BOT_TOKEN || !ENV.TELEGRAM_CHAT_ID) {
    console.log("Telegram credentials not set. Skipping test.");
    console.log("\nTo test, add to .env:");
    console.log("TELEGRAM_BOT_TOKEN=your-bot-token");
    console.log("TELEGRAM_CHAT_ID=your-chat-id");
    return;
  }

  // Test new content notification
  console.log("Sending test notification...");
  const result = await notifyNewContent({
    tireName: "Bridgestone Turanza 6",
    descriptionLength: 487,
    badges: ["Winner ADAC 2025"],
    payloadUrl: `${ENV.PAYLOAD_URL}/admin`,
  });

  if (result.success) {
    console.log("Notification sent successfully!");
  } else {
    console.error("Failed:", result.error);
  }
}

if (process.argv[1]?.includes("telegram-bot.ts")) main();
