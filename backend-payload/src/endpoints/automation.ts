import type { Endpoint } from 'payload';
import Database from 'better-sqlite3';
import path from 'path';
import { getSchedulerStatus, setSchedulerConfig } from '../automation/jobs/scheduler';

/**
 * Resolve the path to the content-automation SQLite database.
 * When Payload runs from backend-payload/, the DB is at
 * content-automation/data/content-automation.db.
 */
function getMetricsDbPath(): string {
  return process.env.SQLITE_PATH
    || path.join(process.cwd(), 'content-automation', 'data', 'content-automation.db');
}

/**
 * Query the last date when any scraping/generation activity occurred.
 */
function getLastRunDate(db: Database.Database): string | null {
  try {
    const row = db
      .prepare(
        `SELECT date FROM metrics
         WHERE tires_scraped > 0 OR tires_generated > 0
         ORDER BY date DESC LIMIT 1`
      )
      .get() as { date: string } | undefined;
    return row?.date ?? null;
  } catch {
    return null;
  }
}

/**
 * GET /api/automation/stats
 *
 * Returns real metrics from SQLite, mapped to the AutomationStats interface
 * expected by the Dashboard component.
 */
export const automationStatsEndpoint: Endpoint = {
  path: '/automation/stats',
  method: 'get',
  handler: async () => {
    let db: Database.Database | null = null;
    try {
      db = new Database(getMetricsDbPath());

      // Ensure table exists (DB may be empty/new)
      db.exec(`
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
        )
      `);

      // Weekly totals
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const startDate = weekAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      const row = db
        .prepare(
          `SELECT
             COALESCE(SUM(tires_scraped), 0) AS tires_scraped,
             COALESCE(SUM(tires_generated), 0) AS tires_generated,
             COALESCE(SUM(articles_generated), 0) AS articles_generated,
             COALESCE(SUM(cost_usd), 0) AS cost_usd,
             COALESCE(SUM(errors_count), 0) AS errors_count
           FROM metrics
           WHERE date >= ? AND date <= ?`
        )
        .get(startDate, endDate) as Record<string, number>;

      const lastRun = getLastRunDate(db);

      return Response.json({
        tiresProcessed: row.tires_scraped,
        articlesCreated: row.tires_generated,
        badgesAssigned: row.articles_generated,
        totalCost: Math.round(row.cost_usd * 100) / 100,
        errorCount: row.errors_count,
        lastRun,
      });
    } catch (error) {
      // If DB doesn't exist yet, return zeros gracefully
      return Response.json({
        tiresProcessed: 0,
        articlesCreated: 0,
        badgesAssigned: 0,
        totalCost: 0,
        errorCount: 0,
        lastRun: null,
      });
    } finally {
      db?.close();
    }
  },
};

/**
 * GET /api/automation/status
 *
 * Returns scheduler status as { tasks: TaskSchedule[] }.
 */
export const automationStatusEndpoint: Endpoint = {
  path: '/automation/status',
  method: 'get',
  handler: async () => {
    const tasks = getSchedulerStatus();
    return Response.json({ tasks });
  },
};

/**
 * POST /api/automation/scheduler
 *
 * Update scheduler config for a specific task.
 * Body: { taskId: string, enabled?: boolean, cronExpression?: string }
 */
export const automationSchedulerEndpoint: Endpoint = {
  path: '/automation/scheduler',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { taskId: string; enabled?: boolean; cronExpression?: string };
    try {
      body = await req.json!();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { taskId, enabled, cronExpression } = body;

    if (!taskId) {
      return Response.json({ error: 'taskId is required' }, { status: 400 });
    }

    if (enabled === undefined && cronExpression === undefined) {
      return Response.json({ error: 'Provide at least "enabled" or "cronExpression"' }, { status: 400 });
    }

    const result = setSchedulerConfig({ taskId, enabled, cronExpression });

    if (!result.success) {
      return Response.json({ error: result.error, tasks: result.tasks }, { status: 400 });
    }

    return Response.json({ tasks: result.tasks });
  },
};
