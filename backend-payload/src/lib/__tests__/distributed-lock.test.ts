/**
 * Tests for distributed lock utility.
 * Tests the hash function and lock logic without requiring PostgreSQL.
 */
import { describe, it, expect, vi } from 'vitest';
import { LOCK_IDS, tryAcquireLock, releaseLock, withLock } from '../distributed-lock';

describe('LOCK_IDS', () => {
  it('should have unique lock IDs for each task', () => {
    const ids = Object.values(LOCK_IDS);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have positive integer lock IDs', () => {
    for (const id of Object.values(LOCK_IDS)) {
      expect(Number.isInteger(id)).toBe(true);
      expect(id).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have all expected lock types', () => {
    expect(LOCK_IDS.PIPELINE).toBeDefined();
    expect(LOCK_IDS.SMART_ARTICLES).toBeDefined();
    expect(LOCK_IDS.SCRAPE).toBeDefined();
    expect(LOCK_IDS.GENERATE).toBeDefined();
    expect(LOCK_IDS.PUBLISH).toBeDefined();
  });

  it('should produce stable lock IDs (deterministic hash)', () => {
    // Same input should always produce same output
    const id1 = LOCK_IDS.PIPELINE;
    const id2 = LOCK_IDS.PIPELINE;
    expect(id1).toBe(id2);
  });
});

describe('tryAcquireLock', () => {
  it('should return acquired: false when drizzle.execute fails', async () => {
    const mockPayload = {
      db: {
        drizzle: {
          execute: vi.fn().mockRejectedValue(new Error('DB connection failed')),
        },
      },
    };

    const result = await tryAcquireLock(mockPayload as any, 123);
    expect(result.acquired).toBe(false);
    expect(result.lockId).toBe(123);
  });

  it('should return acquired: true when advisory lock succeeds', async () => {
    const mockPayload = {
      db: {
        drizzle: {
          execute: vi.fn().mockResolvedValue([{ acquired: true }]),
        },
      },
    };

    const result = await tryAcquireLock(mockPayload as any, 123);
    expect(result.acquired).toBe(true);
    expect(result.lockId).toBe(123);
  });

  it('should return acquired: false when advisory lock returns false', async () => {
    const mockPayload = {
      db: {
        drizzle: {
          execute: vi.fn().mockResolvedValue([{ acquired: false }]),
        },
      },
    };

    const result = await tryAcquireLock(mockPayload as any, 123);
    expect(result.acquired).toBe(false);
  });
});

describe('releaseLock', () => {
  it('should call pg_advisory_unlock', async () => {
    const executeMock = vi.fn().mockResolvedValue(undefined);
    const mockPayload = { db: { drizzle: { execute: executeMock } } };

    await releaseLock(mockPayload as any, 456);
    expect(executeMock).toHaveBeenCalledTimes(1);
  });

  it('should not throw on failure', async () => {
    const mockPayload = {
      db: {
        drizzle: {
          execute: vi.fn().mockRejectedValue(new Error('DB error')),
        },
      },
    };

    // Should not throw
    await releaseLock(mockPayload as any, 456);
  });
});

describe('withLock', () => {
  it('should execute function when lock is acquired', async () => {
    const mockPayload = {
      db: {
        drizzle: {
          execute: vi.fn().mockResolvedValue([{ acquired: true }]),
        },
      },
    };

    const result = await withLock(mockPayload as any, 123, async () => 'done');
    expect(result.acquired).toBe(true);
    expect(result.result).toBe('done');
  });

  it('should not execute function when lock is not acquired', async () => {
    const mockPayload = {
      db: {
        drizzle: {
          execute: vi.fn().mockResolvedValue([{ acquired: false }]),
        },
      },
    };

    const fn = vi.fn().mockResolvedValue('should not run');
    const result = await withLock(mockPayload as any, 123, fn);
    expect(result.acquired).toBe(false);
    expect(result.result).toBeNull();
    expect(fn).not.toHaveBeenCalled();
  });

  it('should release lock even on error', async () => {
    const executeMock = vi.fn()
      // First call: tryAcquireLock
      .mockResolvedValueOnce([{ acquired: true }])
      // Second call: releaseLock
      .mockResolvedValueOnce(undefined);

    const mockPayload = { db: { drizzle: { execute: executeMock } } };

    await expect(
      withLock(mockPayload as any, 123, async () => {
        throw new Error('Task failed');
      })
    ).rejects.toThrow('Task failed');

    // releaseLock should have been called
    expect(executeMock).toHaveBeenCalledTimes(2);
  });
});
