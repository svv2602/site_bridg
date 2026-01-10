/**
 * Cost Tracker
 *
 * Tracks API costs across all providers.
 * Provides daily/monthly limits and notifications.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { CostEntry, CostSummary, CostLimits, TaskType } from "./types.js";
import { COST_LIMITS } from "../config/providers.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("CostTracker");

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../data");
const COSTS_FILE = join(DATA_DIR, "costs.json");

interface CostsData {
  entries: CostEntry[];
  lastUpdated: string;
}

/**
 * Cost Tracker singleton
 */
class CostTrackerImpl {
  private limits: CostLimits;
  private entries: CostEntry[] = [];
  private loaded = false;

  constructor(limits?: CostLimits) {
    this.limits = limits || COST_LIMITS;
    this.ensureDataDir();
  }

  /**
   * Ensure data directory exists
   */
  private ensureDataDir(): void {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  /**
   * Load costs from file
   */
  private load(): void {
    if (this.loaded) return;

    try {
      if (existsSync(COSTS_FILE)) {
        const data = JSON.parse(readFileSync(COSTS_FILE, "utf-8")) as CostsData;
        this.entries = data.entries.map((e) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
      }
    } catch (error) {
      logger.warn("Failed to load costs data", {
        error: error instanceof Error ? error.message : String(error),
      });
      this.entries = [];
    }

    this.loaded = true;
  }

  /**
   * Save costs to file
   */
  private save(): void {
    try {
      const data: CostsData = {
        entries: this.entries,
        lastUpdated: new Date().toISOString(),
      };
      writeFileSync(COSTS_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      logger.error("Failed to save costs data", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Record a cost entry
   */
  record(entry: Omit<CostEntry, "timestamp">): void {
    this.load();

    const fullEntry: CostEntry = {
      ...entry,
      timestamp: new Date(),
    };

    this.entries.push(fullEntry);
    this.save();

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

    // Warn if approaching daily limit
    if (dailyCost > this.limits.dailyLimit * this.limits.warningThreshold) {
      logger.warn("Approaching daily cost limit", {
        current: dailyCost.toFixed(2),
        limit: this.limits.dailyLimit,
        percent: ((dailyCost / this.limits.dailyLimit) * 100).toFixed(0),
      });
    }

    // Warn if approaching monthly limit
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
    this.load();

    // Check per-request limit
    if (estimatedCost > this.limits.perRequestLimit) {
      return {
        allowed: false,
        reason: `Estimated cost $${estimatedCost.toFixed(2)} exceeds per-request limit $${this.limits.perRequestLimit}`,
      };
    }

    // Check daily limit
    const dailyCost = this.getDailyCost();
    if (dailyCost + estimatedCost > this.limits.dailyLimit) {
      return {
        allowed: false,
        reason: `Would exceed daily limit. Current: $${dailyCost.toFixed(2)}, Limit: $${this.limits.dailyLimit}`,
      };
    }

    // Check monthly limit
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
    this.load();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.entries
      .filter((e) => new Date(e.timestamp) >= today)
      .reduce((sum, e) => sum + e.cost, 0);
  }

  /**
   * Get current month's total cost
   */
  getMonthlyCost(): number {
    this.load();

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    return this.entries
      .filter((e) => new Date(e.timestamp) >= monthStart)
      .reduce((sum, e) => sum + e.cost, 0);
  }

  /**
   * Get cost summary for a period
   */
  getSummary(period: "day" | "week" | "month"): CostSummary {
    this.load();

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

    const periodEntries = this.entries.filter(
      (e) => new Date(e.timestamp) >= startDate
    );

    const byProvider: Record<string, number> = {};
    const byModel: Record<string, number> = {};
    const byTaskType: Record<TaskType, number> = {} as Record<TaskType, number>;

    let totalCost = 0;
    let successCount = 0;
    let totalLatency = 0;

    for (const entry of periodEntries) {
      totalCost += entry.cost;

      byProvider[entry.provider] = (byProvider[entry.provider] || 0) + entry.cost;
      byModel[entry.model] = (byModel[entry.model] || 0) + entry.cost;
      byTaskType[entry.taskType] = (byTaskType[entry.taskType] || 0) + entry.cost;

      if (entry.success) successCount++;
      totalLatency += entry.latencyMs;
    }

    return {
      period,
      startDate,
      endDate: now,
      totalCost,
      byProvider,
      byModel,
      byTaskType,
      requestCount: periodEntries.length,
      successRate: periodEntries.length > 0 ? successCount / periodEntries.length : 1,
      avgLatencyMs: periodEntries.length > 0 ? totalLatency / periodEntries.length : 0,
    };
  }

  /**
   * Get recent entries
   */
  getRecentEntries(limit: number = 50): CostEntry[] {
    this.load();
    return this.entries.slice(-limit).reverse();
  }

  /**
   * Clear old entries (older than 90 days)
   */
  cleanup(): number {
    this.load();

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    const originalCount = this.entries.length;
    this.entries = this.entries.filter((e) => new Date(e.timestamp) >= cutoff);

    if (this.entries.length < originalCount) {
      this.save();
      const removed = originalCount - this.entries.length;
      logger.info(`Cleaned up ${removed} old cost entries`);
      return removed;
    }

    return 0;
  }

  /**
   * Reset all data (for testing)
   */
  reset(): void {
    this.entries = [];
    this.save();
    logger.info("Cost tracker reset");
  }
}

// Singleton instance
export const costTracker = new CostTrackerImpl();

// Export class for testing
export { CostTrackerImpl };
