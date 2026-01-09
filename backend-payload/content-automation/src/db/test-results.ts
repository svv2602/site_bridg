/**
 * Test Results Database
 *
 * SQLite storage for tyre test results from ADAC, AutoBild, TyreReviews.
 */

import Database from "better-sqlite3";
import { ENV } from "../config/env.js";
import path from "path";

// Types
export interface TestResultEntry {
  tireName: string;
  position: number;
  rating: string;
  ratingNumeric: number;
  categoryWins?: string[];
}

export interface TestResult {
  testUid: string;
  source: "adac" | "autobild" | "tyrereviews";
  testType: "summer" | "winter" | "allseason";
  year: number;
  testedSize: string;
  sourceUrl: string;
  publishedDate?: string;
  results: TestResultEntry[];
  scrapedAt: string;
}

// Database instance
let db: Database.Database | null = null;

/**
 * Get database instance
 */
export function getDatabase(): Database.Database {
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
    CREATE TABLE IF NOT EXISTS test_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_uid TEXT UNIQUE NOT NULL,
      source TEXT NOT NULL,
      test_type TEXT NOT NULL,
      year INTEGER NOT NULL,
      tested_size TEXT NOT NULL,
      source_url TEXT NOT NULL,
      published_date TEXT,
      results_json TEXT NOT NULL,
      scraped_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_test_results_source ON test_results(source);
    CREATE INDEX IF NOT EXISTS idx_test_results_year ON test_results(year);
    CREATE INDEX IF NOT EXISTS idx_test_results_type ON test_results(test_type);
  `);
}

/**
 * Save test result
 */
export function saveTestResult(result: TestResult): boolean {
  const database = getDatabase();

  try {
    const stmt = database.prepare(`
      INSERT OR REPLACE INTO test_results
      (test_uid, source, test_type, year, tested_size, source_url, published_date, results_json, scraped_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      result.testUid,
      result.source,
      result.testType,
      result.year,
      result.testedSize,
      result.sourceUrl,
      result.publishedDate || null,
      JSON.stringify(result.results),
      result.scrapedAt
    );

    return true;
  } catch (error) {
    console.error("Failed to save test result:", error);
    return false;
  }
}

/**
 * Get test result by UID
 */
export function getTestResult(testUid: string): TestResult | null {
  const database = getDatabase();

  const row = database
    .prepare("SELECT * FROM test_results WHERE test_uid = ?")
    .get(testUid) as Record<string, unknown> | undefined;

  if (!row) return null;

  return {
    testUid: row.test_uid as string,
    source: row.source as TestResult["source"],
    testType: row.test_type as TestResult["testType"],
    year: row.year as number,
    testedSize: row.tested_size as string,
    sourceUrl: row.source_url as string,
    publishedDate: row.published_date as string | undefined,
    results: JSON.parse(row.results_json as string),
    scrapedAt: row.scraped_at as string,
  };
}

/**
 * Get all test results by source
 */
export function getTestResultsBySource(source: TestResult["source"]): TestResult[] {
  const database = getDatabase();

  const rows = database
    .prepare("SELECT * FROM test_results WHERE source = ? ORDER BY year DESC")
    .all(source) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    testUid: row.test_uid as string,
    source: row.source as TestResult["source"],
    testType: row.test_type as TestResult["testType"],
    year: row.year as number,
    testedSize: row.tested_size as string,
    sourceUrl: row.source_url as string,
    publishedDate: row.published_date as string | undefined,
    results: JSON.parse(row.results_json as string),
    scrapedAt: row.scraped_at as string,
  }));
}

/**
 * Get all test results for a year
 */
export function getTestResultsByYear(year: number): TestResult[] {
  const database = getDatabase();

  const rows = database
    .prepare("SELECT * FROM test_results WHERE year = ? ORDER BY source, test_type")
    .all(year) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    testUid: row.test_uid as string,
    source: row.source as TestResult["source"],
    testType: row.test_type as TestResult["testType"],
    year: row.year as number,
    testedSize: row.tested_size as string,
    sourceUrl: row.source_url as string,
    publishedDate: row.published_date as string | undefined,
    results: JSON.parse(row.results_json as string),
    scrapedAt: row.scraped_at as string,
  }));
}

/**
 * Find test results containing a specific tyre
 */
export function findTestResultsForTyre(tireName: string): TestResult[] {
  const database = getDatabase();

  const rows = database
    .prepare("SELECT * FROM test_results ORDER BY year DESC")
    .all() as Array<Record<string, unknown>>;

  const normalizedSearch = tireName.toLowerCase();

  return rows
    .map((row) => ({
      testUid: row.test_uid as string,
      source: row.source as TestResult["source"],
      testType: row.test_type as TestResult["testType"],
      year: row.year as number,
      testedSize: row.tested_size as string,
      sourceUrl: row.source_url as string,
      publishedDate: row.published_date as string | undefined,
      results: JSON.parse(row.results_json as string) as TestResultEntry[],
      scrapedAt: row.scraped_at as string,
    }))
    .filter((result) =>
      result.results.some((r) =>
        r.tireName.toLowerCase().includes(normalizedSearch)
      )
    );
}

/**
 * Check if test result exists
 */
export function testResultExists(testUid: string): boolean {
  const database = getDatabase();

  const row = database
    .prepare("SELECT 1 FROM test_results WHERE test_uid = ?")
    .get(testUid);

  return !!row;
}

/**
 * Get recent test results
 */
export function getRecentTestResults(limit = 10): TestResult[] {
  const database = getDatabase();

  const rows = database
    .prepare(
      "SELECT * FROM test_results ORDER BY scraped_at DESC LIMIT ?"
    )
    .all(limit) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    testUid: row.test_uid as string,
    source: row.source as TestResult["source"],
    testType: row.test_type as TestResult["testType"],
    year: row.year as number,
    testedSize: row.tested_size as string,
    sourceUrl: row.source_url as string,
    publishedDate: row.published_date as string | undefined,
    results: JSON.parse(row.results_json as string),
    scrapedAt: row.scraped_at as string,
  }));
}

/**
 * Close database connection
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Test
async function main() {
  console.log("Testing Test Results Database...\n");

  // Test save
  const testResult: TestResult = {
    testUid: "adac-summer-2024-205-55-r16",
    source: "adac",
    testType: "summer",
    year: 2024,
    testedSize: "205/55 R16",
    sourceUrl: "https://www.adac.de/rund-ums-fahrzeug/tests/reifen/sommerreifen/205-55-r16/",
    results: [
      {
        tireName: "Bridgestone Turanza 6",
        position: 1,
        rating: "gut",
        ratingNumeric: 1.8,
        categoryWins: ["Nassbremsen", "Handling nass"],
      },
      {
        tireName: "Continental PremiumContact 7",
        position: 2,
        rating: "gut",
        ratingNumeric: 2.0,
      },
    ],
    scrapedAt: new Date().toISOString(),
  };

  console.log("Saving test result...");
  const saved = saveTestResult(testResult);
  console.log(`Saved: ${saved}`);

  console.log("\nRetrieving test result...");
  const retrieved = getTestResult(testResult.testUid);
  if (retrieved) {
    console.log(`Test: ${retrieved.testUid}`);
    console.log(`Results: ${retrieved.results.length} tyres`);
    console.log(`Winner: ${retrieved.results[0]?.tireName}`);
  }

  console.log("\nFinding Bridgestone results...");
  const bridgestoneTests = findTestResultsForTyre("Bridgestone");
  console.log(`Found ${bridgestoneTests.length} tests with Bridgestone`);

  closeDatabase();
  console.log("\n✅ Database test complete");
}

main();
