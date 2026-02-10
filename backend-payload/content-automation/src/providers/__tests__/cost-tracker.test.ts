/**
 * Tests for cost-tracker module.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CostTrackerImpl } from '../cost-tracker';
import type { CostLimits, TaskType } from '../types';

// Mock logger
vi.mock('../../utils/logger.js', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Use in-memory SQLite for tests
vi.stubEnv('SQLITE_PATH', ':memory:');

const testLimits: CostLimits = {
  dailyLimit: 10,
  monthlyLimit: 100,
  perRequestLimit: 1,
  warningThreshold: 0.8,
};

function makeTracker(): CostTrackerImpl {
  return new CostTrackerImpl(testLimits);
}

function makeCostEntry(overrides: Partial<{
  provider: string;
  model: string;
  taskType: TaskType;
  cost: number;
  success: boolean;
}> = {}) {
  return {
    provider: overrides.provider ?? 'anthropic',
    model: overrides.model ?? 'claude-sonnet-4-20250514',
    taskType: (overrides.taskType ?? 'content-generation') as TaskType,
    inputTokens: 1000,
    outputTokens: 500,
    cost: overrides.cost ?? 0.01,
    latencyMs: 500,
    success: overrides.success ?? true,
  };
}

describe('CostTrackerImpl', () => {
  beforeEach(() => {
    // Reset data between tests
    const tracker = makeTracker();
    tracker.reset();
  });

  describe('record', () => {
    it('should record a cost entry', () => {
      const tracker = makeTracker();
      tracker.record(makeCostEntry({ cost: 0.05 }));

      const summary = tracker.getSummary('day');
      expect(summary.totalCost).toBeCloseTo(0.05, 4);
      expect(summary.requestCount).toBe(1);
    });

    it('should record multiple entries', () => {
      const tracker = makeTracker();
      tracker.record(makeCostEntry({ cost: 0.01 }));
      tracker.record(makeCostEntry({ cost: 0.02 }));
      tracker.record(makeCostEntry({ cost: 0.03 }));

      const summary = tracker.getSummary('day');
      expect(summary.totalCost).toBeCloseTo(0.06, 4);
      expect(summary.requestCount).toBe(3);
    });
  });

  describe('canAfford', () => {
    it('should allow request within limits', () => {
      const tracker = makeTracker();
      const result = tracker.canAfford(0.5);
      expect(result.allowed).toBe(true);
    });

    it('should reject request exceeding per-request limit', () => {
      const tracker = makeTracker();
      const result = tracker.canAfford(1.5); // > perRequestLimit of 1
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('per-request limit');
    });

    it('should reject request that would exceed daily limit', () => {
      const tracker = makeTracker();
      // Record near-limit costs
      tracker.record(makeCostEntry({ cost: 9.5 }));

      const result = tracker.canAfford(0.6); // 9.5 + 0.6 > 10
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('daily limit');
    });

    it('should allow request just within daily limit', () => {
      const tracker = makeTracker();
      tracker.record(makeCostEntry({ cost: 9.0 }));

      const result = tracker.canAfford(0.5); // 9.0 + 0.5 <= 10
      expect(result.allowed).toBe(true);
    });
  });

  describe('getDailyCost', () => {
    it('should return zero when no entries', () => {
      const tracker = makeTracker();
      expect(tracker.getDailyCost()).toBe(0);
    });

    it('should sum costs for today only', () => {
      const tracker = makeTracker();
      tracker.record(makeCostEntry({ cost: 0.1 }));
      tracker.record(makeCostEntry({ cost: 0.2 }));
      expect(tracker.getDailyCost()).toBeCloseTo(0.3, 4);
    });
  });

  describe('getMonthlyCost', () => {
    it('should return zero when no entries', () => {
      const tracker = makeTracker();
      expect(tracker.getMonthlyCost()).toBe(0);
    });

    it('should sum costs for current month', () => {
      const tracker = makeTracker();
      tracker.record(makeCostEntry({ cost: 1.0 }));
      tracker.record(makeCostEntry({ cost: 2.0 }));
      expect(tracker.getMonthlyCost()).toBeCloseTo(3.0, 4);
    });
  });

  describe('getSummary', () => {
    it('should aggregate by provider', () => {
      const tracker = makeTracker();
      tracker.record(makeCostEntry({ provider: 'anthropic', cost: 0.1 }));
      tracker.record(makeCostEntry({ provider: 'openai', cost: 0.2 }));
      tracker.record(makeCostEntry({ provider: 'anthropic', cost: 0.3 }));

      const summary = tracker.getSummary('day');
      expect(summary.byProvider['anthropic']).toBeCloseTo(0.4, 4);
      expect(summary.byProvider['openai']).toBeCloseTo(0.2, 4);
    });

    it('should aggregate by model', () => {
      const tracker = makeTracker();
      tracker.record(makeCostEntry({ model: 'gpt-4o', cost: 0.1 }));
      tracker.record(makeCostEntry({ model: 'gpt-4o', cost: 0.2 }));

      const summary = tracker.getSummary('day');
      expect(summary.byModel['gpt-4o']).toBeCloseTo(0.3, 4);
    });

    it('should calculate success rate', () => {
      const tracker = makeTracker();
      tracker.record(makeCostEntry({ success: true }));
      tracker.record(makeCostEntry({ success: true }));
      tracker.record(makeCostEntry({ success: false }));

      const summary = tracker.getSummary('day');
      expect(summary.successRate).toBeCloseTo(2 / 3, 2);
    });

    it('should calculate average latency', () => {
      const tracker = makeTracker();
      tracker.record(makeCostEntry());
      tracker.record(makeCostEntry());

      const summary = tracker.getSummary('day');
      expect(summary.avgLatencyMs).toBe(500);
    });

    it('should handle week period', () => {
      const tracker = makeTracker();
      tracker.record(makeCostEntry({ cost: 0.5 }));

      const summary = tracker.getSummary('week');
      expect(summary.period).toBe('week');
      expect(summary.totalCost).toBeCloseTo(0.5, 4);
    });

    it('should handle month period', () => {
      const tracker = makeTracker();
      tracker.record(makeCostEntry({ cost: 1.0 }));

      const summary = tracker.getSummary('month');
      expect(summary.period).toBe('month');
      expect(summary.totalCost).toBeCloseTo(1.0, 4);
    });

    it('should return sane defaults for empty tracker', () => {
      const tracker = makeTracker();
      const summary = tracker.getSummary('day');
      expect(summary.totalCost).toBe(0);
      expect(summary.requestCount).toBe(0);
      expect(summary.successRate).toBe(1); // No failures
      expect(summary.avgLatencyMs).toBe(0);
    });
  });

  describe('getRecentEntries', () => {
    it('should return entries in reverse order', () => {
      const tracker = makeTracker();
      tracker.record(makeCostEntry({ cost: 0.1 }));
      tracker.record(makeCostEntry({ cost: 0.2 }));
      tracker.record(makeCostEntry({ cost: 0.3 }));

      const recent = tracker.getRecentEntries(10);
      expect(recent.length).toBe(3);
      expect(recent[0].cost).toBe(0.3);
      expect(recent[2].cost).toBe(0.1);
    });

    it('should respect limit', () => {
      const tracker = makeTracker();
      for (let i = 0; i < 10; i++) {
        tracker.record(makeCostEntry({ cost: 0.01 }));
      }

      const recent = tracker.getRecentEntries(3);
      expect(recent.length).toBe(3);
    });
  });

  describe('cleanup', () => {
    it('should remove old entries', () => {
      const tracker = makeTracker();
      // Current entries should not be cleaned
      tracker.record(makeCostEntry({ cost: 0.1 }));

      const removed = tracker.cleanup();
      expect(removed).toBe(0); // Nothing old to clean
    });
  });

  describe('reset', () => {
    it('should clear all entries', () => {
      const tracker = makeTracker();
      tracker.record(makeCostEntry({ cost: 1.0 }));
      tracker.record(makeCostEntry({ cost: 2.0 }));

      tracker.reset();
      expect(tracker.getDailyCost()).toBe(0);
      expect(tracker.getRecentEntries().length).toBe(0);
    });
  });
});
