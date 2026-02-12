/**
 * Article Queue Database
 *
 * SQLite storage for content sources, article generation queue, and settings.
 * Used by the Smart Article Pipeline to track what to scrape, plan, and generate.
 */

import Database from "better-sqlite3";
import path from "path";

// ============ TYPES ============

export type SourceType = "test-results" | "news" | "rss";
export type ScraperKey = "adac" | "autobild" | "tyrereviews" | "oeamtc" | "tcs" | "gtue" | "bridgestone-news";

export interface ContentSource {
  id: string;
  name: string;
  sourceType: SourceType;
  scraper: ScraperKey;
  baseUrl: string;
  enabled: boolean;
  checkIntervalHours: number;
  lastCheckedAt: string | null;
  lastFoundNew: number;
}

export type ArticleTriggerType = "test-result" | "seasonal" | "new-product" | "news" | "manual";
export type ArticleType =
  | "test-summary"
  | "comparison"
  | "seasonal-guide"
  | "model-review"
  | "technology"
  | "tips"
  | "news-digest";
export type QueueStatus = "pending" | "generating" | "review" | "published" | "failed" | "rejected";

export interface ArticleQueueItem {
  id: number;
  triggerType: ArticleTriggerType;
  triggerData: Record<string, unknown> | null;
  articleType: ArticleType;
  topic: string;
  priority: number;
  status: QueueStatus;
  relatedTyres: string[] | null;
  generatedPayloadId: string | null;
  retryCount: number;
  createdAt: string;
  processedAt: string | null;
  error: string | null;
}

export interface ArticleSetting {
  key: string;
  value: string;
}

// ============ DEFAULT DATA ============

const DEFAULT_SOURCES: ContentSource[] = [
  {
    id: "adac",
    name: "ADAC Reifentests",
    sourceType: "test-results",
    scraper: "adac",
    baseUrl: "https://www.adac.de/rund-ums-fahrzeug/tests/reifen",
    enabled: true,
    checkIntervalHours: 168, // weekly
    lastCheckedAt: null,
    lastFoundNew: 0,
  },
  {
    id: "autobild",
    name: "Auto Bild Reifentests",
    sourceType: "test-results",
    scraper: "autobild",
    baseUrl: "https://www.autobild.de/tests/reifen",
    enabled: true,
    checkIntervalHours: 168,
    lastCheckedAt: null,
    lastFoundNew: 0,
  },
  {
    id: "tyrereviews",
    name: "TyreReviews Aggregator",
    sourceType: "test-results",
    scraper: "tyrereviews",
    baseUrl: "https://www.tyrereviews.com",
    enabled: false,
    checkIntervalHours: 336, // bi-weekly
    lastCheckedAt: null,
    lastFoundNew: 0,
  },
  {
    id: "oeamtc",
    name: "ÖAMTC Reifentests",
    sourceType: "test-results",
    scraper: "oeamtc",
    baseUrl: "https://www.oeamtc.at/tests/reifentest/",
    enabled: true,
    checkIntervalHours: 168, // weekly
    lastCheckedAt: null,
    lastFoundNew: 0,
  },
  {
    id: "tcs",
    name: "TCS Reifentests",
    sourceType: "test-results",
    scraper: "tcs",
    baseUrl: "https://www.tcs.ch/de/testberichte-ratgeber/tests/reifentests/",
    enabled: true,
    checkIntervalHours: 168, // weekly
    lastCheckedAt: null,
    lastFoundNew: 0,
  },
  {
    id: "gtue",
    name: "GTÜ Reifentests",
    sourceType: "test-results",
    scraper: "gtue",
    baseUrl: "https://www.gtue.news/technik/",
    enabled: true,
    checkIntervalHours: 336, // bi-weekly
    lastCheckedAt: null,
    lastFoundNew: 0,
  },
  {
    id: "bridgestone-news",
    name: "Bridgestone EMEA News",
    sourceType: "news",
    scraper: "bridgestone-news",
    baseUrl: "https://press.bridgestone-emea.com",
    enabled: true,
    checkIntervalHours: 24, // daily
    lastCheckedAt: null,
    lastFoundNew: 0,
  },
];

const DEFAULT_SETTINGS: Record<string, string> = {
  max_articles_per_week: "3",
  auto_publish: "true",
  seasonal_lead_weeks: "6",
  min_rating_to_feature: "2.0",
  interlinking_enabled: "true",
  image_generation_enabled: "true",
  preferred_types: JSON.stringify(["test-summary", "seasonal-guide", "comparison", "news-digest", "model-review", "technology", "tips-evergreen"]),
};

// ============ DATABASE ============

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (db) return db;

  const dbPath =
    process.env.SQLITE_PATH || path.join(process.cwd(), "data", "content-automation.db");
  db = new Database(dbPath);
  initSchema(db);
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
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

    CREATE INDEX IF NOT EXISTS idx_article_queue_status ON article_queue(status);
    CREATE INDEX IF NOT EXISTS idx_article_queue_priority ON article_queue(priority);

    -- Add retry_count column if not exists (safe migration)
    -- SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so use pragma check
  `);

  // Safe column migration: add retry_count if missing
  const columns = database
    .prepare("PRAGMA table_info(article_queue)")
    .all() as Array<{ name: string }>;
  const hasRetryCount = columns.some((c) => c.name === "retry_count");
  if (!hasRetryCount) {
    database.exec("ALTER TABLE article_queue ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0");
  }

  database.exec(`

    CREATE TABLE IF NOT EXISTS article_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed defaults
  seedDefaults(database);
}

function seedDefaults(database: Database.Database) {
  // Seed sources
  const insertSource = database.prepare(
    `INSERT OR IGNORE INTO content_sources
     (id, name, source_type, scraper, base_url, enabled, check_interval_hours, last_found_new)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const s of DEFAULT_SOURCES) {
    insertSource.run(
      s.id,
      s.name,
      s.sourceType,
      s.scraper,
      s.baseUrl,
      s.enabled ? 1 : 0,
      s.checkIntervalHours,
      s.lastFoundNew
    );
  }

  // Seed settings
  const insertSetting = database.prepare(
    `INSERT OR IGNORE INTO article_settings (key, value) VALUES (?, ?)`
  );
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    insertSetting.run(key, value);
  }
}

// ============ CONTENT SOURCES CRUD ============

export function getAllSources(): ContentSource[] {
  const database = getDatabase();
  const rows = database
    .prepare("SELECT * FROM content_sources ORDER BY id")
    .all() as Array<Record<string, unknown>>;

  return rows.map(mapSource);
}

export function getSource(id: string): ContentSource | null {
  const database = getDatabase();
  const row = database
    .prepare("SELECT * FROM content_sources WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;

  return row ? mapSource(row) : null;
}

export function getEnabledSources(): ContentSource[] {
  const database = getDatabase();
  const rows = database
    .prepare("SELECT * FROM content_sources WHERE enabled = 1 ORDER BY id")
    .all() as Array<Record<string, unknown>>;

  return rows.map(mapSource);
}

export function getDueSources(): ContentSource[] {
  const database = getDatabase();
  const now = new Date();

  return getEnabledSources().filter((source) => {
    if (!source.lastCheckedAt) return true;
    const lastChecked = new Date(source.lastCheckedAt);
    const hoursElapsed = (now.getTime() - lastChecked.getTime()) / (1000 * 60 * 60);
    return hoursElapsed >= source.checkIntervalHours;
  });
}

export function updateSource(
  id: string,
  update: Partial<Pick<ContentSource, "enabled" | "checkIntervalHours" | "lastCheckedAt" | "lastFoundNew">>
): boolean {
  const database = getDatabase();
  const fields: string[] = [];
  const values: unknown[] = [];

  if (update.enabled !== undefined) {
    fields.push("enabled = ?");
    values.push(update.enabled ? 1 : 0);
  }
  if (update.checkIntervalHours !== undefined) {
    fields.push("check_interval_hours = ?");
    values.push(update.checkIntervalHours);
  }
  if (update.lastCheckedAt !== undefined) {
    fields.push("last_checked_at = ?");
    values.push(update.lastCheckedAt);
  }
  if (update.lastFoundNew !== undefined) {
    fields.push("last_found_new = ?");
    values.push(update.lastFoundNew);
  }

  if (fields.length === 0) return false;

  values.push(id);
  const result = database
    .prepare(`UPDATE content_sources SET ${fields.join(", ")} WHERE id = ?`)
    .run(...values);

  return result.changes > 0;
}

function mapSource(row: Record<string, unknown>): ContentSource {
  return {
    id: row.id as string,
    name: row.name as string,
    sourceType: row.source_type as SourceType,
    scraper: row.scraper as ScraperKey,
    baseUrl: row.base_url as string,
    enabled: (row.enabled as number) === 1,
    checkIntervalHours: row.check_interval_hours as number,
    lastCheckedAt: (row.last_checked_at as string) || null,
    lastFoundNew: row.last_found_new as number,
  };
}

// ============ ARTICLE QUEUE CRUD ============

export function addToQueue(item: {
  triggerType: ArticleTriggerType;
  triggerData?: Record<string, unknown>;
  articleType: ArticleType;
  topic: string;
  priority?: number;
  relatedTyres?: string[];
}): number {
  const database = getDatabase();

  const result = database
    .prepare(
      `INSERT INTO article_queue
       (trigger_type, trigger_data, article_type, topic, priority, status, related_tyres, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`
    )
    .run(
      item.triggerType,
      item.triggerData ? JSON.stringify(item.triggerData) : null,
      item.articleType,
      item.topic,
      item.priority ?? 5,
      item.relatedTyres ? JSON.stringify(item.relatedTyres) : null,
      new Date().toISOString()
    );

  return result.lastInsertRowid as number;
}

export function getQueueItem(id: number): ArticleQueueItem | null {
  const database = getDatabase();
  const row = database
    .prepare("SELECT * FROM article_queue WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;

  return row ? mapQueueItem(row) : null;
}

export function getPendingQueue(limit = 10): ArticleQueueItem[] {
  const database = getDatabase();
  const rows = database
    .prepare(
      "SELECT * FROM article_queue WHERE status = 'pending' ORDER BY priority ASC, created_at ASC LIMIT ?"
    )
    .all(limit) as Array<Record<string, unknown>>;

  return rows.map(mapQueueItem);
}

export function getQueueByStatus(status: QueueStatus, limit = 50): ArticleQueueItem[] {
  const database = getDatabase();
  const rows = database
    .prepare(
      "SELECT * FROM article_queue WHERE status = ? ORDER BY created_at DESC LIMIT ?"
    )
    .all(status, limit) as Array<Record<string, unknown>>;

  return rows.map(mapQueueItem);
}

export function getRecentQueue(limit = 20): ArticleQueueItem[] {
  const database = getDatabase();
  const rows = database
    .prepare("SELECT * FROM article_queue ORDER BY created_at DESC LIMIT ?")
    .all(limit) as Array<Record<string, unknown>>;

  return rows.map(mapQueueItem);
}

export function updateQueueItem(
  id: number,
  update: Partial<Pick<ArticleQueueItem, "status" | "generatedPayloadId" | "processedAt" | "error" | "relatedTyres" | "retryCount">>
): boolean {
  const database = getDatabase();
  const fields: string[] = [];
  const values: unknown[] = [];

  if (update.status !== undefined) {
    fields.push("status = ?");
    values.push(update.status);
  }
  if (update.generatedPayloadId !== undefined) {
    fields.push("generated_payload_id = ?");
    values.push(update.generatedPayloadId);
  }
  if (update.processedAt !== undefined) {
    fields.push("processed_at = ?");
    values.push(update.processedAt);
  }
  if (update.error !== undefined) {
    fields.push("error = ?");
    values.push(update.error);
  }
  if (update.relatedTyres !== undefined) {
    fields.push("related_tyres = ?");
    values.push(update.relatedTyres ? JSON.stringify(update.relatedTyres) : null);
  }
  if (update.retryCount !== undefined) {
    fields.push("retry_count = ?");
    values.push(update.retryCount);
  }

  if (fields.length === 0) return false;

  values.push(id);
  const result = database
    .prepare(`UPDATE article_queue SET ${fields.join(", ")} WHERE id = ?`)
    .run(...values);

  return result.changes > 0;
}

export function deleteQueueItem(id: number): boolean {
  const database = getDatabase();
  const result = database
    .prepare("DELETE FROM article_queue WHERE id = ?")
    .run(id);
  return result.changes > 0;
}

/**
 * Get failed items eligible for retry (retry_count < maxRetries)
 */
export function getRetryableItems(maxRetries = 3): ArticleQueueItem[] {
  const database = getDatabase();
  const rows = database
    .prepare(
      "SELECT * FROM article_queue WHERE status = 'failed' AND retry_count < ? ORDER BY priority ASC, created_at ASC"
    )
    .all(maxRetries) as Array<Record<string, unknown>>;

  return rows.map(mapQueueItem);
}

/**
 * Check if a similar topic already exists in queue (to prevent duplicates)
 */
export function queueHasSimilarTopic(
  articleType: ArticleType,
  triggerType: ArticleTriggerType,
  triggerKey: string
): boolean {
  const database = getDatabase();

  // Check by trigger_data containing the key (e.g. testUid)
  const row = database
    .prepare(
      `SELECT 1 FROM article_queue
       WHERE article_type = ? AND trigger_type = ?
       AND trigger_data LIKE ?
       AND status NOT IN ('failed', 'rejected')
       LIMIT 1`
    )
    .get(articleType, triggerType, `%${triggerKey}%`);

  return !!row;
}

/**
 * Get queue stats
 */
export function getQueueStats(): Record<QueueStatus, number> {
  const database = getDatabase();
  const rows = database
    .prepare("SELECT status, COUNT(*) as count FROM article_queue GROUP BY status")
    .all() as Array<{ status: string; count: number }>;

  const stats: Record<string, number> = {
    pending: 0,
    generating: 0,
    review: 0,
    published: 0,
    failed: 0,
    rejected: 0,
  };

  for (const row of rows) {
    stats[row.status] = row.count;
  }

  return stats as Record<QueueStatus, number>;
}

function mapQueueItem(row: Record<string, unknown>): ArticleQueueItem {
  return {
    id: row.id as number,
    triggerType: row.trigger_type as ArticleTriggerType,
    triggerData: row.trigger_data ? JSON.parse(row.trigger_data as string) : null,
    articleType: row.article_type as ArticleType,
    topic: row.topic as string,
    priority: row.priority as number,
    status: row.status as QueueStatus,
    relatedTyres: row.related_tyres ? JSON.parse(row.related_tyres as string) : null,
    generatedPayloadId: (row.generated_payload_id as string) || null,
    retryCount: (row.retry_count as number) || 0,
    createdAt: row.created_at as string,
    processedAt: (row.processed_at as string) || null,
    error: (row.error as string) || null,
  };
}

// ============ SETTINGS CRUD ============

export function getSetting(key: string): string | null {
  const database = getDatabase();
  const row = database
    .prepare("SELECT value FROM article_settings WHERE key = ?")
    .get(key) as { value: string } | undefined;

  return row ? row.value : null;
}

export function getSettingNumber(key: string): number {
  const val = getSetting(key);
  return val ? parseFloat(val) : 0;
}

export function getSettingBool(key: string): boolean {
  return getSetting(key) === "true";
}

export function getSettingJSON<T>(key: string): T | null {
  const val = getSetting(key);
  if (!val) return null;
  try {
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
}

export function getAllSettings(): Record<string, string> {
  const database = getDatabase();
  const rows = database
    .prepare("SELECT key, value FROM article_settings ORDER BY key")
    .all() as Array<{ key: string; value: string }>;

  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

export function setSetting(key: string, value: string): void {
  const database = getDatabase();
  database
    .prepare(
      `INSERT INTO article_settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = ?`
    )
    .run(key, value, value);
}

export function setSettings(settings: Record<string, string>): void {
  const database = getDatabase();
  const stmt = database.prepare(
    `INSERT INTO article_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = ?`
  );
  const transaction = database.transaction(() => {
    for (const [key, value] of Object.entries(settings)) {
      stmt.run(key, value, value);
    }
  });
  transaction();
}

// ============ CLEANUP ============

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
