/**
 * Cost Tracker
 *
 * Tracks API costs across all providers using SQLite for atomic, crash-safe writes.
 * Provides daily/monthly limits and notifications.
 */

import Database from "better-sqlite3";
import path from "path";
import type { CostEntry, CostSummary, CostLimits, TaskType } from "./types.js";
import { COST_LIMITS } from "../config/providers.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("CostTracker");

// ============ DATABASE ============

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  const dbPath =
    process.env.SQLITE_PATH || path.join(process.cwd(), "data", "content-automation.db");
  db = new Database(dbPath);
  initCostSchema(db);
  return db;
}

function initCostSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS cost_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      task_type TEXT NOT NULL,
      input_tokens INTEGER,
      output_tokens INTEGER,
      cost REAL NOT NULL,
      latency_ms INTEGER NOT NULL DEFAULT 0,
      success INTEGER NOT NULL DEFAULT 1,
      error TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_cost_records_timestamp ON cost_records(timestamp);
    CREATE INDEX IF NOT EXISTS idx_cost_records_provider ON cost_records(provider);
  `);
}

// ============ ROW MAPPING ============

interface CostRow {
  id: number;
  timestamp: string;
  provider: string;
  model: string;
  task_type: string;
  input_tokens: number | null;
  output_tokens: number | null;
  cost: number;
  latency_ms: number;
  success: number;
  error: string | null;
}

function mapRow(row: CostRow): CostEntry {
  return {
    timestamp: new Date(row.timestamp),
    provider: row.provider,
    model: row.model,
    taskType: row.task_type as TaskType,
    inputTokens: row.input_tokens ?? undefined,
    outputTokens: row.output_tokens ?? undefined,
    cost: row.cost,
    latencyMs: row.latency_ms,
    success: row.success === 1,
    error: row.error ?? undefined,
  };
}

// ============ COST TRACKER ============

/**
 * Cost Tracker singleton
 */
class CostTrackerImpl {
  private limits: CostLimits;

  constructor(limits?: CostLimits) {
    this.limits = limits || COST_LIMITS;
  }

  /**
   * Record a cost entry
   */
  record(entry: Omit<CostEntry, "timestamp">): void {
    const database = getDb();
    const now = new Date().toISOString();

    database.prepare(`
      INSERT INTO cost_records (timestamp, provider, model, task_type, input_tokens, output_tokens, cost, latency_ms, success, error)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      now,
      entry.provider,
      entry.model,
      entry.taskType,
      entry.inputTokens ?? null,
      entry.outputTokens ?? null,
      entry.cost,
      entry.latencyMs,
      entry.success ? 1 : 0,
      entry.error ?? null,
    );

    // Check limits and warn if needed
    this.checkLimits();

    logger.info("Cost recorded", {
      provider: entry.provider,
      model: entry.model,
      cost: entry.cost.toFixed(4),
      task: entry.taskType,
    });
  }

  /**
   * Check if cost limits are exceeded
   */
  private checkLimits(): void {
    const dailyCost = this.getDailyCost();
    const monthlyCost = this.getMonthlyCost();

    if (dailyCost > this.limits.dailyLimit * this.limits.warningThreshold) {
      logger.warn("Approaching daily cost limit", {
        current: dailyCost.toFixed(2),
        limit: this.limits.dailyLimit,
        percent: ((dailyCost / this.limits.dailyLimit) * 100).toFixed(0),
      });
    }

    if (monthlyCost > this.limits.monthlyLimit * this.limits.warningThreshold) {
      logger.warn("Approaching monthly cost limit", {
        current: monthlyCost.toFixed(2),
        limit: this.limits.monthlyLimit,
        percent: ((monthlyCost / this.limits.monthlyLimit) * 100).toFixed(0),
      });
    }
  }

  /**
   * Check if a request should be allowed based on cost
   */
  canAfford(estimatedCost: number): { allowed: boolean; reason?: string } {
    if (estimatedCost > this.limits.perRequestLimit) {
      return {
        allowed: false,
        reason: `Estimated cost $${estimatedCost.toFixed(2)} exceeds per-request limit $${this.limits.perRequestLimit}`,
      };
    }

    const dailyCost = this.getDailyCost();
    if (dailyCost + estimatedCost > this.limits.dailyLimit) {
      return {
        allowed: false,
        reason: `Would exceed daily limit. Current: $${dailyCost.toFixed(2)}, Limit: $${this.limits.dailyLimit}`,
      };
    }

    const monthlyCost = this.getMonthlyCost();
    if (monthlyCost + estimatedCost > this.limits.monthlyLimit) {
      return {
        allowed: false,
        reason: `Would exceed monthly limit. Current: $${monthlyCost.toFixed(2)}, Limit: $${this.limits.monthlyLimit}`,
      };
    }

    return { allowed: true };
  }

  /**
   * Get today's total cost
   */
  getDailyCost(): number {
    const database = getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const row = database.prepare(
      `SELECT COALESCE(SUM(cost), 0) as total FROM cost_records WHERE timestamp >= ?`
    ).get(today.toISOString()) as { total: number };

    return row.total;
  }

  /**
   * Get current month's total cost
   */
  getMonthlyCost(): number {
    const database = getDb();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const row = database.prepare(
      `SELECT COALESCE(SUM(cost), 0) as total FROM cost_records WHERE timestamp >= ?`
    ).get(monthStart.toISOString()) as { total: number };

    return row.total;
  }

  /**
   * Get cost summary for a period
   */
  getSummary(period: "day" | "week" | "month"): CostSummary {
    const database = getDb();
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "day":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    const rows = database.prepare(
      `SELECT * FROM cost_records WHERE timestamp >= ? ORDER BY timestamp`
    ).all(startDate.toISOString()) as CostRow[];

    const byProvider: Record<string, number> = {};
    const byModel: Record<string, number> = {};
    const byTaskType: Record<TaskType, number> = {} as Record<TaskType, number>;

    let totalCost = 0;
    let successCount = 0;
    let totalLatency = 0;

    for (const row of rows) {
      totalCost += row.cost;
      byProvider[row.provider] = (byProvider[row.provider] || 0) + row.cost;
      byModel[row.model] = (byModel[row.model] || 0) + row.cost;
      byTaskType[row.task_type as TaskType] = (byTaskType[row.task_type as TaskType] || 0) + row.cost;
      if (row.success) successCount++;
      totalLatency += row.latency_ms;
    }

    return {
      period,
      startDate,
      endDate: now,
      totalCost,
      byProvider,
      byModel,
      byTaskType,
      requestCount: rows.length,
      successRate: rows.length > 0 ? successCount / rows.length : 1,
      avgLatencyMs: rows.length > 0 ? totalLatency / rows.length : 0,
    };
  }

  /**
   * Get recent entries
   */
  getRecentEntries(limit: number = 50): CostEntry[] {
    const database = getDb();
    const rows = database.prepare(
      `SELECT * FROM cost_records ORDER BY id DESC LIMIT ?`
    ).all(limit) as CostRow[];

    return rows.map(mapRow);
  }

  /**
   * Clear old entries (older than 90 days)
   */
  cleanup(): number {
    const database = getDb();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    const result = database.prepare(
      `DELETE FROM cost_records WHERE timestamp < ?`
    ).run(cutoff.toISOString());

    const removed = result.changes;
    if (removed > 0) {
      logger.info(`Cleaned up ${removed} old cost entries`);
    }
    return removed;
  }

  /**
   * Reset all data (for testing)
   */
  reset(): void {
    const database = getDb();
    database.prepare(`DELETE FROM cost_records`).run();
    logger.info("Cost tracker reset");
  }

  /**
   * No-op (SQLite writes are atomic, no flush needed)
   * Kept for backward compatibility with callers.
   */
  flush(): void {
    // SQLite writes are immediate and atomic — no flush needed
  }
}

// Singleton instance
export const costTracker = new CostTrackerImpl();

// Export class for testing
export { CostTrackerImpl };
