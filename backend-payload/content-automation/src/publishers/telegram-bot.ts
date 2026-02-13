/**
 * Telegram Bot for Notifications
 *
 * Sends notifications about new content, errors, and weekly summaries.
 * Uses HTML parse_mode for maximum reliability (no escaping issues with *, _, [ etc.).
 */

import { ENV } from "../config/env.js";
import { dispatch, initNotificationService } from "./notification-service.js";

// Types (re-exported for all callsites)
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
 * Send notification to all configured channels (Telegram, Email, Payload DB).
 * Returns success:true if ANY channel succeeds (backward compatible).
 */
export async function notify(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  await initNotificationService();
  const result = await dispatch(payload);

  if (!result.success) {
    const errors = result.channels
      .filter((ch) => !ch.success)
      .map((ch) => `${ch.name}: ${ch.error}`)
      .join("; ");
    return { success: false, error: errors || "No channels available" };
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
      { text: "Payload Admin", url: `${ENV.PAYLOAD_PUBLIC_URL}/admin` },
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
    payloadUrl: `${ENV.PAYLOAD_PUBLIC_URL}/admin`,
  });

  if (result.success) {
    console.log("Notification sent successfully!");
  } else {
    console.error("Failed:", result.error);
  }
}

if (process.argv[1]?.includes("telegram-bot.ts")) main();
