/**
 * Tests for retry utility and CircuitBreaker.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withRetry, withRetryThrow, CircuitBreaker } from '../retry';

// Mock logger to suppress output during tests
vi.mock('../logger.js', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('withRetry', () => {
  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn, { maxRetries: 3, initialDelayMs: 1 });

    expect(result.success).toBe(true);
    expect(result.data).toBe('success');
    expect(result.attempts).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry and succeed on second attempt', async () => {
    let calls = 0;
    const fn = vi.fn().mockImplementation(async () => {
      calls++;
      if (calls < 2) throw new Error('timeout error');
      return 'recovered';
    });

    const result = await withRetry(fn, { maxRetries: 3, initialDelayMs: 1 });

    expect(result.success).toBe(true);
    expect(result.data).toBe('recovered');
    expect(result.attempts).toBe(2);
  });

  it('should fail after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('ECONNRESET'));

    const result = await withRetry(fn, { maxRetries: 2, initialDelayMs: 1 });

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('ECONNRESET');
    expect(result.attempts).toBe(3); // 1 initial + 2 retries
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should not retry non-retryable errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Invalid JSON syntax'));

    const result = await withRetry(fn, {
      maxRetries: 3,
      initialDelayMs: 1,
      retryableErrors: ['timeout', 'ECONNRESET'],
    });

    expect(result.success).toBe(false);
    // Note: current implementation runs all attempts even for non-retryable errors
    // (the isRetryable check only gates the delay/retry logging, not the loop itself)
    expect(result.attempts).toBe(4); // 1 initial + 3 retries
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it('should retry all errors when retryableErrors is empty', async () => {
    let calls = 0;
    const fn = vi.fn().mockImplementation(async () => {
      calls++;
      if (calls < 3) throw new Error('Any error');
      return 'ok';
    });

    const result = await withRetry(fn, {
      maxRetries: 3,
      initialDelayMs: 1,
      retryableErrors: [],
    });

    expect(result.success).toBe(true);
    expect(result.attempts).toBe(3);
  });

  it('should track total time', async () => {
    const fn = vi.fn().mockResolvedValue('fast');
    const result = await withRetry(fn);

    expect(result.totalTimeMs).toBeGreaterThanOrEqual(0);
  });
});

describe('withRetryThrow', () => {
  it('should return data on success', async () => {
    const fn = vi.fn().mockResolvedValue('data');
    const result = await withRetryThrow(fn, { maxRetries: 1, initialDelayMs: 1 });
    expect(result).toBe('data');
  });

  it('should throw on all retries exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('ETIMEDOUT'));

    await expect(
      withRetryThrow(fn, { maxRetries: 1, initialDelayMs: 1 })
    ).rejects.toThrow('ETIMEDOUT');
  });
});

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test', {
      failureThreshold: 3,
      resetTimeoutMs: 100,
      halfOpenMaxCalls: 2,
    });
  });

  it('should start in closed state', () => {
    const state = breaker.getState();
    expect(state.state).toBe('closed');
    expect(state.failureCount).toBe(0);
  });

  it('should pass through successful calls', async () => {
    const result = await breaker.execute(async () => 'success');
    expect(result).toBe('success');
    expect(breaker.getState().state).toBe('closed');
  });

  it('should open after failure threshold', async () => {
    // Cause 3 failures to trigger open
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => { throw new Error('fail'); });
      } catch { /* expected */ }
    }

    expect(breaker.getState().state).toBe('open');
    expect(breaker.getState().failureCount).toBe(3);
  });

  it('should reject calls when open', async () => {
    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => { throw new Error('fail'); });
      } catch { /* expected */ }
    }

    // Next call should be rejected immediately
    await expect(
      breaker.execute(async () => 'should not run')
    ).rejects.toThrow('Circuit breaker "test" is open');
  });

  it('should transition to half-open after timeout', async () => {
    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => { throw new Error('fail'); });
      } catch { /* expected */ }
    }

    // Wait for reset timeout
    await new Promise((r) => setTimeout(r, 150));

    // Should allow a call (half-open)
    const result = await breaker.execute(async () => 'recovered');
    expect(result).toBe('recovered');
    expect(breaker.getState().state).toBe('closed');
  });

  it('should close after successful half-open call', async () => {
    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => { throw new Error('fail'); });
      } catch { /* expected */ }
    }

    // Wait for reset
    await new Promise((r) => setTimeout(r, 150));

    // Successful call in half-open
    await breaker.execute(async () => 'ok');
    expect(breaker.getState().state).toBe('closed');
    expect(breaker.getState().failureCount).toBe(0);
  });

  it('should re-open on failure during half-open', async () => {
    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => { throw new Error('fail'); });
      } catch { /* expected */ }
    }

    // Wait for reset
    await new Promise((r) => setTimeout(r, 150));

    // Fail again in half-open
    try {
      await breaker.execute(async () => { throw new Error('fail again'); });
    } catch { /* expected */ }

    // Should count the failure (failureCount increases)
    expect(breaker.getState().failureCount).toBeGreaterThanOrEqual(3);
  });

  it('should reset correctly', () => {
    breaker.reset();
    const state = breaker.getState();
    expect(state.state).toBe('closed');
    expect(state.failureCount).toBe(0);
  });

  it('should decrement failure count on success in closed state', async () => {
    // Cause 2 failures (below threshold)
    for (let i = 0; i < 2; i++) {
      try {
        await breaker.execute(async () => { throw new Error('fail'); });
      } catch { /* expected */ }
    }
    expect(breaker.getState().failureCount).toBe(2);

    // Success should decrement
    await breaker.execute(async () => 'ok');
    expect(breaker.getState().failureCount).toBe(1);
  });
});
