/**
 * Metrics Collector
 *
 * Collects and stores metrics about automation operations.
 */

import Database from "better-sqlite3";
import { ENV } from "../config/env.js";
import path from "path";

// Types
export interface DailyMetrics {
  date: string;
  tiresScraped: number;
  tiresGenerated: number;
  articlesGenerated: number;
  tokensUsed: number;
  costUsd: number;
  errorsCount: number;
  executionTimeMs: number;
}

export interface MetricsSummary {
  period: "day" | "week" | "month";
  startDate: string;
  endDate: string;
  totals: {
    tiresScraped: number;
    tiresGenerated: number;
    articlesGenerated: number;
    tokensUsed: number;
    costUsd: number;
    errorsCount: number;
    executionTimeMs: number;
  };
  averages: {
    tiresPerDay: number;
    costPerDay: number;
    errorsPerDay: number;
  };
}

// Database instance
let db: Database.Database | null = null;

/**
 * Get database instance
 */
function getDatabase(): Database.Database {
  if (db) return db;

  const dbPath = ENV.SQLITE_PATH || path.join(process.cwd(), "data", "content-automation.db");
  db = new Database(dbPath);

  // Initialize schema
  initSchema(db);

  return db;
}

/**
 * Initialize database schema
 */
function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      tires_scraped INTEGER DEFAULT 0,
      tires_generated INTEGER DEFAULT 0,
      articles_generated INTEGER DEFAULT 0,
      tokens_used INTEGER DEFAULT 0,
      cost_usd REAL DEFAULT 0,
      errors_count INTEGER DEFAULT 0,
      execution_time_ms INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date)
    );

    CREATE INDEX IF NOT EXISTS idx_metrics_date ON metrics(date);
  `);
}

/**
 * Get today's date string
 */
function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get or create today's metrics
 */
function getOrCreateTodayMetrics(): DailyMetrics {
  const database = getDatabase();
  const today = getTodayString();

  let row = database
    .prepare("SELECT * FROM metrics WHERE date = ?")
    .get(today) as Record<string, unknown> | undefined;

  if (!row) {
    database
      .prepare(
        "INSERT INTO metrics (date) VALUES (?)"
      )
      .run(today);

    row = database
      .prepare("SELECT * FROM metrics WHERE date = ?")
      .get(today) as Record<string, unknown>;
  }

  return {
    date: row.date as string,
    tiresScraped: row.tires_scraped as number,
    tiresGenerated: row.tires_generated as number,
    articlesGenerated: row.articles_generated as number,
    tokensUsed: row.tokens_used as number,
    costUsd: row.cost_usd as number,
    errorsCount: row.errors_count as number,
    executionTimeMs: row.execution_time_ms as number,
  };
}

/**
 * Increment a metric counter
 */
export function incrementMetric(
  metric: keyof Omit<DailyMetrics, "date">,
  value: number = 1
) {
  const database = getDatabase();
  const today = getTodayString();

  // Ensure row exists
  getOrCreateTodayMetrics();

  const columnMap: Record<string, string> = {
    tiresScraped: "tires_scraped",
    tiresGenerated: "tires_generated",
    articlesGenerated: "articles_generated",
    tokensUsed: "tokens_used",
    costUsd: "cost_usd",
    errorsCount: "errors_count",
    executionTimeMs: "execution_time_ms",
  };

  const column = columnMap[metric];
  if (!column) return;

  database
    .prepare(`UPDATE metrics SET ${column} = ${column} + ? WHERE date = ?`)
    .run(value, today);
}

/**
 * Record scraping metrics
 */
export function recordScraping(tiresFound: number, executionTimeMs: number) {
  incrementMetric("tiresScraped", tiresFound);
  incrementMetric("executionTimeMs", executionTimeMs);
}

/**
 * Record generation metrics
 */
export function recordGeneration(params: {
  tires?: number;
  articles?: number;
  tokensUsed: number;
  costUsd: number;
  executionTimeMs: number;
}) {
  if (params.tires) incrementMetric("tiresGenerated", params.tires);
  if (params.articles) incrementMetric("articlesGenerated", params.articles);
  incrementMetric("tokensUsed", params.tokensUsed);
  incrementMetric("costUsd", params.costUsd);
  incrementMetric("executionTimeMs", params.executionTimeMs);
}

/**
 * Record error
 */
export function recordError() {
  incrementMetric("errorsCount", 1);
}

/**
 * Get metrics for a specific date range
 */
export function getMetricsRange(startDate: string, endDate: string): DailyMetrics[] {
  const database = getDatabase();

  const rows = database
    .prepare(
      "SELECT * FROM metrics WHERE date >= ? AND date <= ? ORDER BY date"
    )
    .all(startDate, endDate) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    date: row.date as string,
    tiresScraped: row.tires_scraped as number,
    tiresGenerated: row.tires_generated as number,
    articlesGenerated: row.articles_generated as number,
    tokensUsed: row.tokens_used as number,
    costUsd: row.cost_usd as number,
    errorsCount: row.errors_count as number,
    executionTimeMs: row.execution_time_ms as number,
  }));
}

/**
 * Get summary for a period
 */
export function getMetricsSummary(period: "day" | "week" | "month"): MetricsSummary {
  const today = new Date();
  let startDate: Date;

  switch (period) {
    case "day":
      startDate = today;
      break;
    case "week":
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "month":
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 1);
      break;
  }

  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = today.toISOString().split("T")[0];

  const metrics = getMetricsRange(startDateStr, endDateStr);
  const days = metrics.length || 1;

  const totals = metrics.reduce(
    (acc, m) => ({
      tiresScraped: acc.tiresScraped + m.tiresScraped,
      tiresGenerated: acc.tiresGenerated + m.tiresGenerated,
      articlesGenerated: acc.articlesGenerated + m.articlesGenerated,
      tokensUsed: acc.tokensUsed + m.tokensUsed,
      costUsd: acc.costUsd + m.costUsd,
      errorsCount: acc.errorsCount + m.errorsCount,
      executionTimeMs: acc.executionTimeMs + m.executionTimeMs,
    }),
    {
      tiresScraped: 0,
      tiresGenerated: 0,
      articlesGenerated: 0,
      tokensUsed: 0,
      costUsd: 0,
      errorsCount: 0,
      executionTimeMs: 0,
    }
  );

  return {
    period,
    startDate: startDateStr,
    endDate: endDateStr,
    totals,
    averages: {
      tiresPerDay: Math.round((totals.tiresGenerated / days) * 10) / 10,
      costPerDay: Math.round((totals.costUsd / days) * 100) / 100,
      errorsPerDay: Math.round((totals.errorsCount / days) * 10) / 10,
    },
  };
}

/**
 * Format summary for Telegram
 */
export function formatSummaryForTelegram(summary: MetricsSummary): string {
  const periodLabel = {
    day: "Сьогодні",
    week: "Цей тиждень",
    month: "Цей місяць",
  }[summary.period];

  const formatMinutes = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes} хв ${seconds} сек`;
  };

  return `
📊 *${periodLabel}*
📅 ${summary.startDate} — ${summary.endDate}

📦 Шин оброблено: ${summary.totals.tiresScraped}
✨ Контенту згенеровано: ${summary.totals.tiresGenerated}
📰 Статей: ${summary.totals.articlesGenerated}

💰 Витрати: $${summary.totals.costUsd.toFixed(2)}
⏱ Час роботи: ${formatMinutes(summary.totals.executionTimeMs)}
${summary.totals.errorsCount > 0 ? `❌ Помилок: ${summary.totals.errorsCount}` : "✅ Помилок не виявлено"}
  `.trim();
}

/**
 * Close database connection
 */
export function closeMetricsDb() {
  if (db) {
    db.close();
    db = null;
  }
}

// Test
async function main() {
  console.log("Testing Metrics Collector...\n");

  // Record some test metrics
  console.log("Recording metrics...");
  recordScraping(10, 5000);
  recordGeneration({
    tires: 3,
    articles: 1,
    tokensUsed: 5000,
    costUsd: 0.15,
    executionTimeMs: 3000,
  });
  recordError();

  // Get today's metrics
  const today = getOrCreateTodayMetrics();
  console.log("\nToday's metrics:");
  console.log(today);

  // Get weekly summary
  const weeklySummary = getMetricsSummary("week");
  console.log("\nWeekly summary:");
  console.log(weeklySummary);

  // Format for Telegram
  console.log("\nTelegram format:");
  console.log(formatSummaryForTelegram(weeklySummary));

  closeMetricsDb();
  console.log("\n✅ Metrics test complete");
}

main();
