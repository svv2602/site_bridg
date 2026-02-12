/**
 * News Items Database
 *
 * SQLite storage for news/press releases from Bridgestone EMEA and similar sources.
 * Separate from test_results — stores product launches, innovations, corporate news.
 */

import { getDatabase as getArticleDb } from "./article-queue.js";
import type Database from "better-sqlite3";

export interface NewsItem {
  id?: number;
  source: string;
  title: string;
  summary: string;
  url: string;
  publishedDate: string | null;
  category: string | null;
  scrapedAt: string;
}

let initialized = false;

/**
 * Get database instance (reuses article-queue DB)
 */
function getDatabase(): Database.Database {
  const db = getArticleDb();

  if (!initialized) {
    initSchema(db);
    initialized = true;
  }

  return db;
}

/**
 * Initialize news_items table
 */
function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS news_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      url TEXT UNIQUE NOT NULL,
      published_date TEXT,
      category TEXT,
      scraped_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_news_items_source ON news_items(source);
    CREATE INDEX IF NOT EXISTS idx_news_items_scraped_at ON news_items(scraped_at);
  `);
}

/**
 * Save a news item (skips if URL already exists)
 */
export function saveNewsItem(item: NewsItem): boolean {
  const database = getDatabase();

  try {
    const stmt = database.prepare(`
      INSERT OR IGNORE INTO news_items
      (source, title, summary, url, published_date, category, scraped_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      item.source,
      item.title,
      item.summary,
      item.url,
      item.publishedDate || null,
      item.category || null,
      item.scrapedAt
    );

    return result.changes > 0;
  } catch (error) {
    console.error("Failed to save news item:", error);
    return false;
  }
}

/**
 * Check if a news item already exists by URL
 */
export function newsItemExists(url: string): boolean {
  const database = getDatabase();

  const row = database
    .prepare("SELECT 1 FROM news_items WHERE url = ?")
    .get(url);

  return !!row;
}

/**
 * Get news items scraped after a given date
 */
export function getNewsItemsSince(sinceDate: string): NewsItem[] {
  const database = getDatabase();

  const rows = database
    .prepare(
      "SELECT * FROM news_items WHERE scraped_at > ? ORDER BY scraped_at DESC"
    )
    .all(sinceDate) as Array<Record<string, unknown>>;

  return rows.map(mapNewsItem);
}

/**
 * Get recent news items
 */
export function getRecentNewsItems(limit = 10): NewsItem[] {
  const database = getDatabase();

  const rows = database
    .prepare("SELECT * FROM news_items ORDER BY scraped_at DESC LIMIT ?")
    .all(limit) as Array<Record<string, unknown>>;

  return rows.map(mapNewsItem);
}

/**
 * Get news items count
 */
export function getNewsItemsCount(): number {
  const database = getDatabase();
  const row = database
    .prepare("SELECT COUNT(*) as count FROM news_items")
    .get() as { count: number };
  return row.count;
}

function mapNewsItem(row: Record<string, unknown>): NewsItem {
  return {
    id: row.id as number,
    source: row.source as string,
    title: row.title as string,
    summary: row.summary as string,
    url: row.url as string,
    publishedDate: (row.published_date as string) || null,
    category: (row.category as string) || null,
    scrapedAt: row.scraped_at as string,
  };
}
