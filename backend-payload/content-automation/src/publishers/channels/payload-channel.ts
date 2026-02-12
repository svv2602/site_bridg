/**
 * Payload DB Notification Channel
 *
 * Stores notifications in the Payload CMS Notifications collection via REST API.
 */

import { ENV } from "../../config/env.js";
import type { NotificationPayload } from "../telegram-bot.js";
import type { NotificationChannel } from "../notification-service.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("PayloadChannel");

/**
 * Strip HTML tags for plain text body
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

async function sendToPayload(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  const url = `${ENV.PAYLOAD_URL}/api/notifications`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (ENV.PAYLOAD_API_KEY) {
    headers["Authorization"] = `users API-Key ${ENV.PAYLOAD_API_KEY}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: payload.type,
        title: payload.title,
        body: stripHtml(payload.body),
        bodyHtml: payload.body,
        data: payload.data || {},
        buttons: payload.buttons || [],
        read: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Payload API error: ${response.status} ${errorText}`);
    }

    logger.info("Notification stored in Payload DB", { type: payload.type, title: payload.title });
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error("Payload DB send failed", { error });
    return { success: false, error };
  }
}

export function createPayloadChannel(): NotificationChannel {
  return {
    name: "payload",
    isEnabled() {
      return ENV.NOTIFY_PAYLOAD_ENABLED !== false;
    },
    send: sendToPayload,
  };
}
