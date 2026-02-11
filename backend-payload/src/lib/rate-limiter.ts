/**
 * Rate Limiter Utility
 *
 * In-memory, Map-based rate limiter for single-instance deployments.
 * Provides a factory function to create rate limiters and a middleware
 * helper for Payload CMS v3 endpoints (which use Web API Request/Response).
 *
 * Features:
 *   - Sliding window per key (typically IP address)
 *   - Configurable windowMs and maxRequests
 *   - Automatic cleanup of expired entries via lazy purge + periodic sweep
 *   - 429 response with Retry-After header
 *
 * Limitations:
 *   - In-memory only — state is lost on process restart and not shared between instances.
 *   - For horizontal scaling (multiple instances), migrate to Redis-based rate limiting
 *     (e.g., `rate-limiter-flexible` with RedisStore or ioredis).
 *   - Sufficient for current single-instance deployment.
 */

export interface RateLimiterOptions {
  /** Time window in milliseconds (default: 15 minutes) */
  windowMs?: number;
  /** Maximum requests per window (default: 5) */
  maxRequests?: number;
  /** Interval for periodic cleanup in milliseconds (default: 60 seconds) */
  cleanupIntervalMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the client can retry (only set when blocked) */
  retryAfterSeconds?: number;
  /** Number of requests remaining in the current window */
  remaining: number;
}

export interface RateLimiter {
  /** Check whether a key is allowed and record the attempt */
  check(key: string): RateLimitResult;
  /** Reset a specific key (e.g. after successful login) */
  reset(key: string): void;
  /** Stop the periodic cleanup timer */
  destroy(): void;
  /** Current size of the internal map (for testing) */
  readonly size: number;
}

/**
 * Create a new rate limiter instance.
 */
export function createRateLimiter(opts: RateLimiterOptions = {}): RateLimiter {
  const windowMs = opts.windowMs ?? 15 * 60 * 1000; // 15 minutes
  const maxRequests = opts.maxRequests ?? 5;
  const cleanupIntervalMs = opts.cleanupIntervalMs ?? 60 * 1000; // 1 minute

  // key → array of request timestamps (ms)
  const store = new Map<string, number[]>();

  // Periodic sweep: remove keys whose timestamps are all expired.
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    const cutoff = now - windowMs;
    for (const [key, timestamps] of store) {
      const active = timestamps.filter((ts) => ts > cutoff);
      if (active.length === 0) {
        store.delete(key);
      } else {
        store.set(key, active);
      }
    }
  }, cleanupIntervalMs);

  // Don't keep the process alive just for cleanup
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  function check(key: string): RateLimitResult {
    const now = Date.now();
    const cutoff = now - windowMs;

    // Lazy cleanup for this key
    let timestamps = store.get(key) || [];
    timestamps = timestamps.filter((ts) => ts > cutoff);

    if (timestamps.length >= maxRequests) {
      // Blocked — compute retry-after based on when the oldest entry expires
      const oldestInWindow = timestamps[0];
      const retryAfterSeconds = Math.ceil((oldestInWindow + windowMs - now) / 1000);
      store.set(key, timestamps);
      return {
        allowed: false,
        retryAfterSeconds: Math.max(retryAfterSeconds, 1),
        remaining: 0,
      };
    }

    // Allowed — record this request
    timestamps.push(now);
    store.set(key, timestamps);
    return {
      allowed: true,
      remaining: maxRequests - timestamps.length,
    };
  }

  function reset(key: string): void {
    store.delete(key);
  }

  function destroy(): void {
    clearInterval(cleanupTimer);
    store.clear();
  }

  return {
    check,
    reset,
    destroy,
    get size() {
      return store.size;
    },
  };
}

/**
 * Extract client IP from a Payload CMS v3 request (Web API Request).
 * Falls back to 'unknown' if no IP header is found.
 */
export function extractIp(req: Request | { headers: { get(name: string): string | null } }): string {
  // Payload CMS v3 uses Web API Request; headers are accessed via .headers.get()
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; take the first (client) IP
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return 'unknown';
}

/**
 * Check the rate limiter for a Payload endpoint request and return a 429
 * Response if the limit is exceeded, or null if the request is allowed.
 *
 * Usage in a Payload endpoint handler:
 * ```ts
 * const blocked = checkRateLimit(myLimiter, req);
 * if (blocked) return blocked;
 * // ... handle request
 * ```
 */
export function checkRateLimit(
  limiter: RateLimiter,
  req: Request | { headers: { get(name: string): string | null } },
  message = 'Забагато спроб. Спробуйте пізніше.',
): Response | null {
  const key = extractIp(req);
  const result = limiter.check(key);

  if (!result.allowed) {
    return Response.json(
      { error: message },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfterSeconds ?? 60),
        },
      },
    );
  }

  return null;
}
