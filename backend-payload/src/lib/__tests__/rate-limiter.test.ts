/**
 * Tests for rate-limiter utility.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRateLimiter, extractIp, checkRateLimit } from '../rate-limiter';

describe('createRateLimiter', () => {
  const limiters: ReturnType<typeof createRateLimiter>[] = [];

  function tracked(opts: Parameters<typeof createRateLimiter>[0] = {}) {
    const limiter = createRateLimiter(opts);
    limiters.push(limiter);
    return limiter;
  }

  afterEach(() => {
    for (const l of limiters) l.destroy();
    limiters.length = 0;
  });

  it('should allow requests under the limit', () => {
    const limiter = tracked({ maxRequests: 3, windowMs: 60_000 });
    const r1 = limiter.check('ip1');
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = limiter.check('ip1');
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = limiter.check('ip1');
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('should block requests over the limit', () => {
    const limiter = tracked({ maxRequests: 2, windowMs: 60_000 });
    limiter.check('ip1');
    limiter.check('ip1');
    const r3 = limiter.check('ip1');
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
    expect(r3.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('should track different keys independently', () => {
    const limiter = tracked({ maxRequests: 1, windowMs: 60_000 });
    const r1 = limiter.check('ip1');
    expect(r1.allowed).toBe(true);

    const r2 = limiter.check('ip2');
    expect(r2.allowed).toBe(true);

    const r3 = limiter.check('ip1');
    expect(r3.allowed).toBe(false);
  });

  it('should allow requests after the window expires', () => {
    vi.useFakeTimers();
    const limiter = tracked({ maxRequests: 1, windowMs: 1000 });
    const r1 = limiter.check('ip1');
    expect(r1.allowed).toBe(true);

    const r2 = limiter.check('ip1');
    expect(r2.allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(1100);

    const r3 = limiter.check('ip1');
    expect(r3.allowed).toBe(true);
    vi.useRealTimers();
  });

  it('should reset a specific key', () => {
    const limiter = tracked({ maxRequests: 1, windowMs: 60_000 });
    limiter.check('ip1');
    expect(limiter.check('ip1').allowed).toBe(false);

    limiter.reset('ip1');
    expect(limiter.check('ip1').allowed).toBe(true);
  });

  it('should report correct size', () => {
    const limiter = tracked({ maxRequests: 5, windowMs: 60_000 });
    expect(limiter.size).toBe(0);

    limiter.check('ip1');
    expect(limiter.size).toBe(1);

    limiter.check('ip2');
    expect(limiter.size).toBe(2);

    limiter.reset('ip1');
    expect(limiter.size).toBe(1);
  });

  it('should provide a retryAfterSeconds of at least 1', () => {
    const limiter = tracked({ maxRequests: 1, windowMs: 500 });
    limiter.check('ip1');
    const result = limiter.check('ip1');
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it('destroy should clear the store and stop the timer', () => {
    const limiter = tracked({ maxRequests: 5, windowMs: 60_000 });
    limiter.check('ip1');
    expect(limiter.size).toBe(1);
    limiter.destroy();
    expect(limiter.size).toBe(0);
  });

  it('should use default options when none provided', () => {
    const limiter = tracked();
    // Default is 5 requests per 15 minutes
    for (let i = 0; i < 5; i++) {
      expect(limiter.check('ip1').allowed).toBe(true);
    }
    expect(limiter.check('ip1').allowed).toBe(false);
  });
});

describe('extractIp', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(extractIp(req)).toBe('1.2.3.4');
  });

  it('should extract IP from x-real-ip header', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '10.0.0.1' },
    });
    expect(extractIp(req)).toBe('10.0.0.1');
  });

  it('should prefer x-forwarded-for over x-real-ip', () => {
    const req = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '1.2.3.4',
        'x-real-ip': '10.0.0.1',
      },
    });
    expect(extractIp(req)).toBe('1.2.3.4');
  });

  it('should return "unknown" when no IP headers are present', () => {
    const req = new Request('http://localhost');
    expect(extractIp(req)).toBe('unknown');
  });
});

describe('checkRateLimit', () => {
  it('should return null when request is allowed', () => {
    const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 });
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.1.1.1' },
    });
    const result = checkRateLimit(limiter, req);
    expect(result).toBeNull();
    limiter.destroy();
  });

  it('should return 429 Response when rate limit exceeded', async () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000 });
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.1.1.1' },
    });

    // First request OK
    expect(checkRateLimit(limiter, req)).toBeNull();

    // Second request blocked
    const response = checkRateLimit(limiter, req);
    expect(response).not.toBeNull();
    expect(response!.status).toBe(429);
    expect(response!.headers.get('Retry-After')).toBeTruthy();

    const body = await response!.json();
    expect(body.error).toBe('Забагато спроб. Спробуйте пізніше.');
    limiter.destroy();
  });

  it('should use custom message when provided', async () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000 });
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.1.1.1' },
    });

    limiter.check('1.1.1.1');
    const response = checkRateLimit(limiter, req, 'Custom limit message');
    expect(response).not.toBeNull();

    const body = await response!.json();
    expect(body.error).toBe('Custom limit message');
    limiter.destroy();
  });
});
