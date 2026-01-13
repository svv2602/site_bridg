/**
 * Telegram Bot for Notifications
 *
 * Sends notifications about new content, errors, and weekly summaries.
 */

import { ENV } from "../config/env.js";

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
 * Format message with markdown
 */
function formatMessage(payload: NotificationPayload): string {
  const emoji = TYPE_EMOJI[payload.type];
  let message = `${emoji} *${escapeMarkdown(payload.title)}*\n\n`;
  message += payload.body;

  return message;
}

/**
 * Escape special characters for Telegram Markdown
 */
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
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
 * Send notification to Telegram
 */
export async function notify(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = ENV;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram credentials not set. Skipping notification.");
    return { success: false, error: "Telegram credentials not configured" };
  }

  const message = formatMessage(payload);
  const replyMarkup = createInlineKeyboard(payload.buttons);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "MarkdownV2",
          reply_markup: replyMarkup,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Telegram API error:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Telegram notification failed:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Convenience functions

/**
 * Notify about new content
 */
export async function notifyNewContent(params: {
  tireName: string;
  descriptionLength: number;
  badges?: string[];
  strapiUrl?: string;
}) {
  const { tireName, descriptionLength, badges = [], strapiUrl } = params;

  let body = `📦 *Шина:* ${escapeMarkdown(tireName)}\n`;
  body += `📝 *Опис:* ${descriptionLength} слів\n`;

  if (badges.length > 0) {
    body += `🏆 *Badges:* ${escapeMarkdown(badges.join(", "))}\n`;
  }

  return notify({
    type: "new_content",
    title: "Новий контент згенеровано",
    body,
    buttons: strapiUrl
      ? [{ text: "Переглянути в Strapi", url: strapiUrl }]
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

  let body = `⚠️ *Операція:* ${escapeMarkdown(operation)}\n`;
  body += `❌ *Помилка:* ${escapeMarkdown(error)}\n`;

  if (details) {
    body += `\n📋 *Деталі:*\n\`\`\`\n${escapeMarkdown(details.slice(0, 500))}\n\`\`\``;
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

  let body = `📅 *Тижневий звіт*\n\n`;
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
      { text: "Strapi Admin", url: `${ENV.STRAPI_URL}/admin` },
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
    strapiUrl: `${ENV.STRAPI_URL}/admin`,
  });

  if (result.success) {
    console.log("✅ Notification sent successfully!");
  } else {
    console.error("❌ Failed:", result.error);
  }
}

if (process.argv[1]?.includes("telegram-bot.ts")) main();
