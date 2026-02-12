/**
 * Telegram Notification Channel
 *
 * Sends to Telegram with optional forum topic routing.
 * Extracted from telegram-bot.ts sending logic.
 */

import { ENV } from "../../config/env.js";
import { withRetry } from "../../utils/retry.js";
import type { NotificationPayload, NotificationType } from "../telegram-bot.js";
import type { NotificationChannel } from "../notification-service.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("TelegramChannel");

const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;
const TELEGRAM_MIN_INTERVAL_MS = 5000;

let lastSendTimestamp = 0;

/**
 * Map notification type to forum topic thread ID
 */
function getTopicId(type: NotificationType): string | undefined {
  const mapping: Record<string, string> = {};

  if (ENV.TELEGRAM_TOPIC_CONTENT) mapping["new_content"] = ENV.TELEGRAM_TOPIC_CONTENT;
  if (ENV.TELEGRAM_TOPIC_ERRORS) mapping["error"] = ENV.TELEGRAM_TOPIC_ERRORS;
  if (ENV.TELEGRAM_TOPIC_REPORTS) {
    mapping["weekly_summary"] = ENV.TELEGRAM_TOPIC_REPORTS;
    mapping["info"] = ENV.TELEGRAM_TOPIC_REPORTS;
  }

  return mapping[type];
}

const TYPE_EMOJI: Record<NotificationType, string> = {
  new_content: "\u{1F195}",
  error: "\u274C",
  weekly_summary: "\u{1F4CA}",
  info: "\u2139\uFE0F",
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatMessage(payload: NotificationPayload): string {
  const emoji = TYPE_EMOJI[payload.type];
  let message = `${emoji} <b>${escapeHtml(payload.title)}</b>\n\n`;
  message += payload.body;
  return message;
}

function truncateMessage(message: string): string {
  if (message.length <= TELEGRAM_MAX_MESSAGE_LENGTH) return message;
  const suffix = "\n\n...[truncated]";
  return message.slice(0, TELEGRAM_MAX_MESSAGE_LENGTH - suffix.length) + suffix;
}

function createInlineKeyboard(buttons?: Array<{ text: string; url: string }>): object | undefined {
  if (!buttons || buttons.length === 0) return undefined;
  return {
    inline_keyboard: [buttons.map((btn) => ({ text: btn.text, url: btn.url }))],
  };
}

async function sendTelegram(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = ENV;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return { success: false, error: "Telegram credentials not configured" };
  }

  // Rate limiting
  const now = Date.now();
  const elapsed = now - lastSendTimestamp;
  if (elapsed < TELEGRAM_MIN_INTERVAL_MS && lastSendTimestamp > 0) {
    await new Promise((resolve) => setTimeout(resolve, TELEGRAM_MIN_INTERVAL_MS - elapsed));
  }
  lastSendTimestamp = Date.now();

  const message = truncateMessage(formatMessage(payload));
  const replyMarkup = createInlineKeyboard(payload.buttons);
  const topicId = getTopicId(payload.type);

  const body: Record<string, unknown> = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "HTML",
    reply_markup: replyMarkup,
  };

  if (topicId) {
    body.message_thread_id = parseInt(topicId, 10);
  }

  const result = await withRetry(
    async () => {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
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
    logger.error("Telegram send failed after retries", { error: errorMessage });
    return { success: false, error: errorMessage };
  }

  return { success: true };
}

export function createTelegramChannel(): NotificationChannel {
  return {
    name: "telegram",
    isEnabled() {
      return !!(ENV.TELEGRAM_BOT_TOKEN && ENV.TELEGRAM_CHAT_ID);
    },
    send: sendTelegram,
  };
}
