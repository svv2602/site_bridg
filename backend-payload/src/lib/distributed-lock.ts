/**
 * Distributed Lock using PostgreSQL Advisory Locks
 *
 * Prevents concurrent execution of automation pipeline tasks.
 * Uses pg_advisory_lock which is automatically released when the
 * session/connection ends (crash-safe).
 *
 * Lock IDs are derived from task names via simple hash to int32.
 */

import { type Payload } from 'payload';

// Convert a string to a stable 32-bit integer for advisory lock
function hashToInt32(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0; // Force int32
  }
  return Math.abs(hash);
}

// Well-known lock IDs (pre-computed for common tasks)
export const LOCK_IDS = {
  PIPELINE: hashToInt32('automation-pipeline'),
  SMART_ARTICLES: hashToInt32('smart-articles'),
  SCRAPE: hashToInt32('automation-scrape'),
  GENERATE: hashToInt32('automation-generate'),
  PUBLISH: hashToInt32('automation-publish'),
} as const;

export interface LockResult {
  acquired: boolean;
  lockId: number;
}

/**
 * Try to acquire a PostgreSQL advisory lock (non-blocking).
 * Returns true if the lock was acquired, false if already held by another session.
 *
 * The lock is session-level and will be released when:
 * - releaseLock() is called
 * - The database connection/session ends
 * - The process crashes
 */
export async function tryAcquireLock(
  payload: Payload,
  lockId: number,
): Promise<LockResult> {
  try {
    // pg_try_advisory_lock returns true if lock acquired, false otherwise
    const result = await payload.db.drizzle.execute(
      `SELECT pg_try_advisory_lock(${lockId}) as acquired`
    );
    const rows = result as unknown as Array<{ acquired: boolean }>;
    const acquired = rows?.[0]?.acquired === true;
    return { acquired, lockId };
  } catch (error) {
    console.error(`[DistributedLock] Failed to acquire lock ${lockId}:`, error);
    return { acquired: false, lockId };
  }
}

/**
 * Release a previously acquired advisory lock.
 */
export async function releaseLock(
  payload: Payload,
  lockId: number,
): Promise<void> {
  try {
    await payload.db.drizzle.execute(
      `SELECT pg_advisory_unlock(${lockId})`
    );
  } catch (error) {
    console.error(`[DistributedLock] Failed to release lock ${lockId}:`, error);
  }
}

/**
 * Execute a function while holding a distributed lock.
 * If the lock cannot be acquired, returns an error result without executing.
 *
 * @example
 * const result = await withLock(payload, LOCK_IDS.PIPELINE, async () => {
 *   // ... pipeline code
 *   return { success: true };
 * });
 * if (!result.acquired) {
 *   console.log('Pipeline already running');
 * }
 */
export async function withLock<T>(
  payload: Payload,
  lockId: number,
  fn: () => Promise<T>,
): Promise<{ acquired: true; result: T } | { acquired: false; result: null }> {
  const lock = await tryAcquireLock(payload, lockId);

  if (!lock.acquired) {
    return { acquired: false, result: null };
  }

  try {
    const result = await fn();
    return { acquired: true, result };
  } finally {
    await releaseLock(payload, lockId);
  }
}
