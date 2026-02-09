import type { Endpoint } from 'payload';
import Database from 'better-sqlite3';
import path from 'path';
import { getSchedulerStatus, setSchedulerConfig } from '../automation/jobs/scheduler';

// Dynamic imports for article-queue module (lives in content-automation)
function getArticleQueueModule() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const dbPath = path.join(process.cwd(), 'content-automation', 'src', 'db', 'article-queue.ts');
  // We use the compiled version at runtime — the DB module accesses SQLite directly
  // Since content-automation uses .js imports, we access SQLite via the same DB path
  const dbFilePath = process.env.SQLITE_PATH
    || path.join(process.cwd(), 'content-automation', 'data', 'content-automation.db');

  const db = new Database(dbFilePath);

  // Ensure tables exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      source_type TEXT NOT NULL DEFAULT 'test-results',
      scraper TEXT NOT NULL,
      base_url TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      check_interval_hours INTEGER NOT NULL DEFAULT 168,
      last_checked_at TEXT,
      last_found_new INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS article_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trigger_type TEXT NOT NULL,
      trigger_data TEXT,
      article_type TEXT NOT NULL,
      topic TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT 5,
      status TEXT NOT NULL DEFAULT 'pending',
      related_tyres TEXT,
      generated_payload_id TEXT,
      created_at TEXT NOT NULL,
      processed_at TEXT,
      error TEXT
    );
    CREATE TABLE IF NOT EXISTS article_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  return db;
}

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

// ============ CONTENT SOURCES ============

/**
 * GET /api/automation/sources
 *
 * List all content sources with their status.
 */
export const automationSourcesEndpoint: Endpoint = {
  path: '/automation/sources',
  method: 'get',
  handler: async () => {
    let db: Database.Database | null = null;
    try {
      db = getArticleQueueModule();

      // Seed defaults if empty
      const defaultSources = [
        { id: 'adac', name: 'ADAC Reifentests', source_type: 'test-results', scraper: 'adac', base_url: 'https://www.adac.de/rund-ums-fahrzeug/tests/reifen', enabled: 1, check_interval_hours: 168 },
        { id: 'autobild', name: 'Auto Bild Reifentests', source_type: 'test-results', scraper: 'autobild', base_url: 'https://www.autobild.de/tests/reifen', enabled: 1, check_interval_hours: 168 },
        { id: 'tyrereviews', name: 'TyreReviews Aggregator', source_type: 'test-results', scraper: 'tyrereviews', base_url: 'https://www.tyrereviews.com', enabled: 0, check_interval_hours: 336 },
      ];
      const insertStmt = db.prepare(
        `INSERT OR IGNORE INTO content_sources (id, name, source_type, scraper, base_url, enabled, check_interval_hours, last_found_new)
         VALUES (@id, @name, @source_type, @scraper, @base_url, @enabled, @check_interval_hours, 0)`
      );
      for (const s of defaultSources) {
        insertStmt.run(s);
      }

      const rows = db
        .prepare('SELECT * FROM content_sources ORDER BY id')
        .all() as Array<Record<string, unknown>>;

      const sources = rows.map((r) => ({
        id: r.id,
        name: r.name,
        sourceType: r.source_type,
        scraper: r.scraper,
        baseUrl: r.base_url,
        enabled: (r.enabled as number) === 1,
        checkIntervalHours: r.check_interval_hours,
        lastCheckedAt: r.last_checked_at || null,
        lastFoundNew: r.last_found_new || 0,
      }));

      return Response.json({ sources });
    } catch {
      return Response.json({ sources: [] });
    } finally {
      db?.close();
    }
  },
};

/**
 * POST /api/automation/sources
 *
 * Update a content source.
 * Body: { id: string, enabled?: boolean, checkIntervalHours?: number }
 */
export const automationSourcesUpdateEndpoint: Endpoint = {
  path: '/automation/sources',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { id: string; enabled?: boolean; checkIntervalHours?: number };
    try {
      body = await req.json!();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.id) {
      return Response.json({ error: 'id is required' }, { status: 400 });
    }

    let db: Database.Database | null = null;
    try {
      db = getArticleQueueModule();

      const fields: string[] = [];
      const values: unknown[] = [];

      if (body.enabled !== undefined) {
        fields.push('enabled = ?');
        values.push(body.enabled ? 1 : 0);
      }
      if (body.checkIntervalHours !== undefined) {
        fields.push('check_interval_hours = ?');
        values.push(body.checkIntervalHours);
      }

      if (fields.length === 0) {
        return Response.json({ error: 'Nothing to update' }, { status: 400 });
      }

      values.push(body.id);
      db.prepare(`UPDATE content_sources SET ${fields.join(', ')} WHERE id = ?`).run(...values);

      return Response.json({ success: true });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return Response.json({ error: msg }, { status: 500 });
    } finally {
      db?.close();
    }
  },
};

// ============ ARTICLE QUEUE ============

/**
 * GET /api/automation/queue
 *
 * List article queue items.
 * Query: ?status=pending&limit=20
 */
export const automationQueueEndpoint: Endpoint = {
  path: '/automation/queue',
  method: 'get',
  handler: async (req) => {
    let db: Database.Database | null = null;
    try {
      db = getArticleQueueModule();

      const url = new URL(req.url || '', 'http://localhost');
      const status = url.searchParams.get('status');
      const limit = parseInt(url.searchParams.get('limit') || '20');

      let query = 'SELECT * FROM article_queue';
      const params: unknown[] = [];

      if (status) {
        query += ' WHERE status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(limit);

      const rows = db.prepare(query).all(...params) as Array<Record<string, unknown>>;

      const items = rows.map((r) => ({
        id: r.id,
        triggerType: r.trigger_type,
        triggerData: r.trigger_data ? JSON.parse(r.trigger_data as string) : null,
        articleType: r.article_type,
        topic: r.topic,
        priority: r.priority,
        status: r.status,
        relatedTyres: r.related_tyres ? JSON.parse(r.related_tyres as string) : null,
        generatedPayloadId: r.generated_payload_id || null,
        createdAt: r.created_at,
        processedAt: r.processed_at || null,
        error: r.error || null,
      }));

      // Queue stats
      const statsRows = db
        .prepare('SELECT status, COUNT(*) as count FROM article_queue GROUP BY status')
        .all() as Array<{ status: string; count: number }>;
      const stats: Record<string, number> = {};
      for (const s of statsRows) {
        stats[s.status] = s.count;
      }

      return Response.json({ items, stats });
    } catch {
      return Response.json({ items: [], stats: {} });
    } finally {
      db?.close();
    }
  },
};

/**
 * POST /api/automation/queue
 *
 * Add manual article to queue or update queue item status.
 * Body for add: { action: 'add', topic: string, articleType: string, priority?: number }
 * Body for update: { action: 'update', id: number, status: string }
 * Body for delete: { action: 'delete', id: number }
 */
export const automationQueueUpdateEndpoint: Endpoint = {
  path: '/automation/queue',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json!();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    let db: Database.Database | null = null;
    try {
      db = getArticleQueueModule();
      const action = body.action as string;

      if (action === 'add') {
        const topic = body.topic as string;
        const articleType = body.articleType as string;
        if (!topic || !articleType) {
          return Response.json({ error: 'topic and articleType are required' }, { status: 400 });
        }

        const result = db.prepare(
          `INSERT INTO article_queue (trigger_type, article_type, topic, priority, status, created_at)
           VALUES ('manual', ?, ?, ?, 'pending', ?)`
        ).run(articleType, topic, (body.priority as number) || 5, new Date().toISOString());

        return Response.json({ success: true, id: result.lastInsertRowid });
      }

      if (action === 'update') {
        const id = body.id as number;
        const status = body.status as string;
        if (!id || !status) {
          return Response.json({ error: 'id and status are required' }, { status: 400 });
        }

        db.prepare('UPDATE article_queue SET status = ? WHERE id = ?').run(status, id);
        return Response.json({ success: true });
      }

      if (action === 'delete') {
        const id = body.id as number;
        if (!id) {
          return Response.json({ error: 'id is required' }, { status: 400 });
        }

        db.prepare('DELETE FROM article_queue WHERE id = ?').run(id);
        return Response.json({ success: true });
      }

      return Response.json({ error: 'Invalid action. Use add, update, or delete' }, { status: 400 });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return Response.json({ error: msg }, { status: 500 });
    } finally {
      db?.close();
    }
  },
};

// ============ ARTICLE SETTINGS ============

/**
 * GET /api/automation/article-settings
 *
 * Get all article generation settings.
 */
export const automationArticleSettingsEndpoint: Endpoint = {
  path: '/automation/article-settings',
  method: 'get',
  handler: async () => {
    let db: Database.Database | null = null;
    try {
      db = getArticleQueueModule();

      // Seed defaults
      const defaults: Record<string, string> = {
        max_articles_per_week: '3',
        auto_publish: 'false',
        seasonal_lead_weeks: '6',
        min_rating_to_feature: '2.0',
        interlinking_enabled: 'true',
        image_generation_enabled: 'true',
        preferred_types: JSON.stringify(['test-summary', 'seasonal-guide', 'comparison']),
      };
      const insertStmt = db.prepare(
        'INSERT OR IGNORE INTO article_settings (key, value) VALUES (?, ?)'
      );
      for (const [key, value] of Object.entries(defaults)) {
        insertStmt.run(key, value);
      }

      const rows = db
        .prepare('SELECT key, value FROM article_settings ORDER BY key')
        .all() as Array<{ key: string; value: string }>;

      const settings: Record<string, string> = {};
      for (const row of rows) {
        settings[row.key] = row.value;
      }

      return Response.json({ settings });
    } catch {
      return Response.json({ settings: {} });
    } finally {
      db?.close();
    }
  },
};

/**
 * POST /api/automation/article-settings
 *
 * Update article generation settings.
 * Body: { settings: Record<string, string> }
 */
export const automationArticleSettingsUpdateEndpoint: Endpoint = {
  path: '/automation/article-settings',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { settings: Record<string, string> };
    try {
      body = await req.json!();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.settings || typeof body.settings !== 'object') {
      return Response.json({ error: 'settings object is required' }, { status: 400 });
    }

    let db: Database.Database | null = null;
    try {
      db = getArticleQueueModule();

      const stmt = db.prepare(
        `INSERT INTO article_settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = ?`
      );

      const transaction = db.transaction(() => {
        for (const [key, value] of Object.entries(body.settings)) {
          stmt.run(key, value, value);
        }
      });
      transaction();

      return Response.json({ success: true });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return Response.json({ error: msg }, { status: 500 });
    } finally {
      db?.close();
    }
  },
};
