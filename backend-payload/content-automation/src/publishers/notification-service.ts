/**
 * Notification Dispatcher
 *
 * Fan-out notifications to all enabled channels (Telegram, Email, Payload DB).
 * Each channel is isolated — one failing doesn't block others.
 */

import type { NotificationPayload } from "./telegram-bot.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("NotificationService");

// Channel interface
export interface NotificationChannel {
  name: string;
  isEnabled(): boolean;
  send(payload: NotificationPayload): Promise<{ success: boolean; error?: string }>;
}

export interface DispatchResult {
  success: boolean;
  channels: Array<{
    name: string;
    success: boolean;
    error?: string;
  }>;
}

// Registry
const channels: NotificationChannel[] = [];
let initialized = false;

/**
 * Register a notification channel
 */
export function registerChannel(channel: NotificationChannel): void {
  channels.push(channel);
  logger.info(`Registered channel: ${channel.name}`);
}

/**
 * Initialize all notification channels (lazy, called on first dispatch)
 */
export async function initNotificationService(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const { createTelegramChannel } = await import("./channels/telegram-channel.js");
    registerChannel(createTelegramChannel());
  } catch (err) {
    logger.warn("Failed to load Telegram channel", { error: String(err) });
  }

  try {
    const { createEmailChannel } = await import("./channels/email-channel.js");
    registerChannel(createEmailChannel());
  } catch (err) {
    logger.warn("Failed to load Email channel", { error: String(err) });
  }

  try {
    const { createPayloadChannel } = await import("./channels/payload-channel.js");
    registerChannel(createPayloadChannel());
  } catch (err) {
    logger.warn("Failed to load Payload channel", { error: String(err) });
  }

  logger.info(`Notification service initialized with ${channels.length} channels`);
}

/**
 * Dispatch notification to all enabled channels.
 * Returns success:true if ANY channel succeeds.
 */
export async function dispatch(payload: NotificationPayload): Promise<DispatchResult> {
  await initNotificationService();

  const enabledChannels = channels.filter((ch) => ch.isEnabled());

  if (enabledChannels.length === 0) {
    logger.warn("No enabled notification channels");
    return { success: false, channels: [] };
  }

  const results = await Promise.allSettled(
    enabledChannels.map(async (ch) => {
      try {
        const result = await ch.send(payload);
        return { name: ch.name, ...result };
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        logger.error(`Channel ${ch.name} threw unexpectedly`, { error });
        return { name: ch.name, success: false, error };
      }
    })
  );

  const channelResults = results.map((r) => {
    if (r.status === "fulfilled") return r.value;
    return { name: "unknown", success: false, error: String(r.reason) };
  });

  const anySuccess = channelResults.some((r) => r.success);

  if (!anySuccess) {
    logger.error("All notification channels failed", {
      results: channelResults.map((r) => `${r.name}: ${r.error}`),
    });
  }

  return { success: anySuccess, channels: channelResults };
}
