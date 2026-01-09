/**
 * Cron Scheduler
 *
 * Schedules automated content generation tasks:
 * - Weekly full automation on Sunday 03:00 Kyiv time
 */

import cron from "node-cron";
import { logger } from "./utils/logger.js";
import { notify } from "./publishers/telegram-bot.js";
import { runWeeklyAutomation } from "./scheduler.js";
import { setRunStatus } from "./publishers/telegram-commands.js";

// Weekly automation: Sunday at 03:00 Kyiv time
const WEEKLY_SCHEDULE = "0 3 * * 0";

/**
 * Run the weekly automation job
 */
async function runWeeklyJob(): Promise<void> {
  const startTime = Date.now();

  logger.info("Starting scheduled weekly automation...");

  // Update status
  setRunStatus({
    isRunning: true,
    lastRunAt: new Date().toISOString(),
  });

  // Notify start
  await notify({
    type: "info",
    title: "Щотижнева автоматизація",
    body: "Починаю запланований цикл автоматизації контенту...",
  });

  try {
    const result = await runWeeklyAutomation();

    const duration = Date.now() - startTime;
    const hasErrors = result.errors.length > 0;

    // Update status
    setRunStatus({
      isRunning: false,
      lastRunDuration: duration,
      lastRunStatus: hasErrors ? "error" : "success",
      lastRunError: hasErrors ? result.errors.join("; ") : null,
    });

    // Notify completion
    await notify({
      type: hasErrors ? "error" : "info",
      title: hasErrors ? "Автоматизація завершена з помилками" : "Автоматизація завершена",
      body: `
Час виконання: ${Math.round(duration / 1000)} сек
Шин оброблено: ${result.tyresProcessed}
Нових: ${result.tyresNew}
Статей: ${result.articlesGenerated}
Бейджів: ${result.badgesAssigned}
${hasErrors ? `Помилок: ${result.errors.length}` : "Без помилок"}
      `.trim(),
    });

    logger.info(`Weekly automation completed in ${Math.round(duration / 1000)}s`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Update status
    setRunStatus({
      isRunning: false,
      lastRunDuration: Date.now() - startTime,
      lastRunStatus: "error",
      lastRunError: errorMessage,
    });

    // Notify error
    await notify({
      type: "error",
      title: "Критична помилка автоматизації",
      body: `Помилка: ${errorMessage}`,
    });

    logger.error("Weekly automation failed:", errorMessage);
  }
}

/**
 * Start all cron jobs
 */
export function startCronJobs(): void {
  logger.info("Initializing cron scheduler...");

  // Validate cron expression
  if (!cron.validate(WEEKLY_SCHEDULE)) {
    logger.error(`Invalid cron expression: ${WEEKLY_SCHEDULE}`);
    return;
  }

  // Schedule weekly job
  const job = cron.schedule(
    WEEKLY_SCHEDULE,
    () => {
      runWeeklyJob().catch((error) => {
        logger.error("Unhandled error in cron job:", error);
      });
    },
    {
      timezone: "Europe/Kyiv",
      scheduled: true,
    }
  );

  logger.info(`Weekly automation scheduled: ${WEEKLY_SCHEDULE} (Europe/Kyiv)`);
  logger.info("Next run: Sunday at 03:00 Kyiv time");

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    logger.info("Stopping cron jobs...");
    job.stop();
  });

  process.on("SIGTERM", () => {
    logger.info("Stopping cron jobs...");
    job.stop();
  });
}

/**
 * Get next scheduled run time (for status display)
 */
export function getNextRunTime(): Date {
  const now = new Date();
  const kyivNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Kyiv" }));

  // Find next Sunday at 03:00
  const nextRun = new Date(kyivNow);
  nextRun.setHours(3, 0, 0, 0);

  // If it's past Sunday 03:00 this week, go to next week
  const dayOfWeek = kyivNow.getDay();
  const daysUntilSunday = dayOfWeek === 0 && kyivNow.getHours() < 3
    ? 0
    : 7 - dayOfWeek;

  nextRun.setDate(nextRun.getDate() + daysUntilSunday);

  return nextRun;
}
