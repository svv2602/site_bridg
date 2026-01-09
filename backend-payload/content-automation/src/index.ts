/**
 * Content Automation System - Daemon Entry Point
 *
 * Starts:
 * - Cron scheduler for weekly automation
 * - Telegram bot for interactive commands
 */

import { logger } from "./utils/logger.js";
import { startCronJobs, getNextRunTime } from "./cron.js";
import { startPolling } from "./publishers/telegram-commands.js";
import { ENV } from "./config/env.js";

async function main(): Promise<void> {
  logger.info("=".repeat(50));
  logger.info("Content Automation System starting...");
  logger.info("=".repeat(50));

  // Log configuration status
  logger.info("\nConfiguration:");
  logger.info(`  Payload CMS: ${ENV.PAYLOAD_URL}`);
  logger.info(`  Anthropic API: ${ENV.ANTHROPIC_API_KEY ? "Configured" : "NOT CONFIGURED"}`);
  logger.info(`  Telegram Bot: ${ENV.TELEGRAM_BOT_TOKEN ? "Configured" : "NOT CONFIGURED"}`);
  logger.info(`  Telegram Chat: ${ENV.TELEGRAM_CHAT_ID || "NOT CONFIGURED"}`);

  // Start cron scheduler
  logger.info("\nStarting cron scheduler...");
  startCronJobs();

  const nextRun = getNextRunTime();
  logger.info(`Next scheduled run: ${nextRun.toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" })}`);

  // Start Telegram bot polling (non-blocking)
  if (ENV.TELEGRAM_BOT_TOKEN && ENV.TELEGRAM_CHAT_ID) {
    logger.info("\nStarting Telegram bot...");
    // Start polling in background (don't await)
    startPolling().catch((error) => {
      logger.error("Telegram polling error:", error);
    });
    logger.info("Telegram bot ready. Commands: /run, /status, /stats, /help");
  } else {
    logger.warn("\nTelegram bot not configured. Interactive commands disabled.");
    logger.warn("Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env to enable.");
  }

  logger.info("\n" + "=".repeat(50));
  logger.info("System ready. Press Ctrl+C to stop.");
  logger.info("=".repeat(50));

  // Keep process running
  process.on("SIGINT", () => {
    logger.info("\nShutting down...");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    logger.info("\nShutting down...");
    process.exit(0);
  });
}

main().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});
