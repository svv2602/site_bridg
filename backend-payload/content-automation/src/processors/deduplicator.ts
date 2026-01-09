/**
 * Deduplication System
 *
 * Prevents duplicate content creation and manages update vs create logic.
 */

import crypto from "crypto";
import Database from "better-sqlite3";
import { ENV } from "../config/env.js";
import path from "path";

// Types
export type DeduplicationAction = "create" | "update" | "skip" | "link_only";

export interface DeduplicationCheckResult {
  action: DeduplicationAction;
  existingId?: number;
  existingStrapiId?: number;
  reason: string;
  contentChanged: boolean;
}

export interface ContentRecord {
  id: number;
  type: "tyre" | "article" | "test";
  slug: string;
  contentHash: string;
  strapiId?: number;
  createdAt: string;
  updatedAt: string;
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
    CREATE TABLE IF NOT EXISTS content_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      slug TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      strapi_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(type, slug)
    );

    CREATE INDEX IF NOT EXISTS idx_content_type_slug ON content_records(type, slug);
    CREATE INDEX IF NOT EXISTS idx_content_hash ON content_records(content_hash);
  `);
}

/**
 * Generate hash for content deduplication
 */
export function hashContent(content: unknown): string {
  const normalized = JSON.stringify(content, Object.keys(content as object).sort());
  return crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}

/**
 * Find existing record by type and slug
 */
export function findExisting(type: string, slug: string): ContentRecord | null {
  const database = getDatabase();

  const row = database
    .prepare("SELECT * FROM content_records WHERE type = ? AND slug = ?")
    .get(type, slug) as Record<string, unknown> | undefined;

  if (!row) return null;

  return {
    id: row.id as number,
    type: row.type as ContentRecord["type"],
    slug: row.slug as string,
    contentHash: row.content_hash as string,
    strapiId: row.strapi_id as number | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Find existing record by content hash
 */
export function findByHash(contentHash: string): ContentRecord | null {
  const database = getDatabase();

  const row = database
    .prepare("SELECT * FROM content_records WHERE content_hash = ?")
    .get(contentHash) as Record<string, unknown> | undefined;

  if (!row) return null;

  return {
    id: row.id as number,
    type: row.type as ContentRecord["type"],
    slug: row.slug as string,
    contentHash: row.content_hash as string,
    strapiId: row.strapi_id as number | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Check deduplication and determine action
 */
export function checkDeduplication(
  type: ContentRecord["type"],
  slug: string,
  content: unknown
): DeduplicationCheckResult {
  const contentHash = hashContent(content);

  // Check if exists by slug
  const existing = findExisting(type, slug);

  if (!existing) {
    // Check if similar content exists elsewhere
    const similarByHash = findByHash(contentHash);
    if (similarByHash) {
      return {
        action: "skip",
        existingId: similarByHash.id,
        existingStrapiId: similarByHash.strapiId,
        reason: `Identical content exists for ${similarByHash.type}/${similarByHash.slug}`,
        contentChanged: false,
      };
    }

    return {
      action: "create",
      reason: "New content, no existing record found",
      contentChanged: true,
    };
  }

  // Exists - check if content changed
  const contentChanged = existing.contentHash !== contentHash;

  if (!contentChanged) {
    return {
      action: "skip",
      existingId: existing.id,
      existingStrapiId: existing.strapiId,
      reason: "Content unchanged, skipping",
      contentChanged: false,
    };
  }

  // Content changed - update
  return {
    action: "update",
    existingId: existing.id,
    existingStrapiId: existing.strapiId,
    reason: "Content changed, needs update",
    contentChanged: true,
  };
}

/**
 * Register new content record
 */
export function registerContent(
  type: ContentRecord["type"],
  slug: string,
  content: unknown,
  strapiId?: number
): ContentRecord {
  const database = getDatabase();
  const contentHash = hashContent(content);
  const now = new Date().toISOString();

  database
    .prepare(`
      INSERT INTO content_records (type, slug, content_hash, strapi_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(type, slug) DO UPDATE SET
        content_hash = excluded.content_hash,
        strapi_id = COALESCE(excluded.strapi_id, strapi_id),
        updated_at = excluded.updated_at
    `)
    .run(type, slug, contentHash, strapiId ?? null, now, now);

  return findExisting(type, slug)!;
}

/**
 * Update Strapi ID for existing record
 */
export function updateStrapiId(type: string, slug: string, strapiId: number): boolean {
  const database = getDatabase();

  const result = database
    .prepare("UPDATE content_records SET strapi_id = ?, updated_at = ? WHERE type = ? AND slug = ?")
    .run(strapiId, new Date().toISOString(), type, slug);

  return result.changes > 0;
}

/**
 * Get all records by type
 */
export function getRecordsByType(type: string): ContentRecord[] {
  const database = getDatabase();

  const rows = database
    .prepare("SELECT * FROM content_records WHERE type = ? ORDER BY updated_at DESC")
    .all(type) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: row.id as number,
    type: row.type as ContentRecord["type"],
    slug: row.slug as string,
    contentHash: row.content_hash as string,
    strapiId: row.strapi_id as number | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));
}

/**
 * Delete record
 */
export function deleteRecord(type: string, slug: string): boolean {
  const database = getDatabase();

  const result = database
    .prepare("DELETE FROM content_records WHERE type = ? AND slug = ?")
    .run(type, slug);

  return result.changes > 0;
}

/**
 * Close database connection
 */
export function closeDeduplicatorDb() {
  if (db) {
    db.close();
    db = null;
  }
}

// Test
async function main() {
  console.log("Testing Deduplicator...\n");

  // Test content
  const tireContent = {
    name: "Turanza 6",
    season: "summer",
    description: "Premium summer tire",
  };

  // Check new content
  console.log("Checking new content...");
  const check1 = checkDeduplication("tyre", "turanza-6", tireContent);
  console.log(`Action: ${check1.action}`);
  console.log(`Reason: ${check1.reason}`);

  // Register content
  console.log("\nRegistering content...");
  const record = registerContent("tyre", "turanza-6", tireContent, 123);
  console.log(`Registered: ${record.type}/${record.slug}`);
  console.log(`Hash: ${record.contentHash}`);

  // Check same content again
  console.log("\nChecking same content again...");
  const check2 = checkDeduplication("tyre", "turanza-6", tireContent);
  console.log(`Action: ${check2.action}`);
  console.log(`Reason: ${check2.reason}`);

  // Check modified content
  console.log("\nChecking modified content...");
  const modifiedContent = { ...tireContent, description: "Updated description" };
  const check3 = checkDeduplication("tyre", "turanza-6", modifiedContent);
  console.log(`Action: ${check3.action}`);
  console.log(`Reason: ${check3.reason}`);

  closeDeduplicatorDb();
  console.log("\n✅ Deduplicator test complete");
}

main();
