/**
 * In-memory rate limiter for Next.js API routes.
 *
 * Uses a module-level Map keyed by IP address. Each request triggers a
 * cleanup pass that evicts entries whose window has elapsed, so the map
 * never grows unboundedly in long-running processes.
 *
 * Usage:
 *   const limiter = createRateLimiter({ maxRequests: 5, windowMs: 15 * 60 * 1000 });
 *   // inside a route handler:
 *   const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
 *   if (!limiter.check(ip)) {
 *     return NextResponse.json({ error: '...' }, { status: 429 });
 *   }
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  /** Maximum number of requests allowed within the window. */
  maxRequests: number;
  /** Time window in milliseconds. */
  windowMs: number;
}

export interface RateLimiter {
  /**
   * Returns `true` if the request is within the limit, `false` if it should
   * be rejected (429).
   */
  check(ip: string): boolean;
}

export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const { maxRequests, windowMs } = options;
  const store = new Map<string, RateLimitEntry>();

  function cleanup() {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    }
  }

  return {
    check(ip: string): boolean {
      // Evict expired entries on every call to keep memory bounded
      cleanup();

      const now = Date.now();
      const entry = store.get(ip);

      if (!entry || now >= entry.resetAt) {
        // First request or window expired — start a new window
        store.set(ip, { count: 1, resetAt: now + windowMs });
        return true;
      }

      // Within the current window
      entry.count += 1;
      return entry.count <= maxRequests;
    },
  };
}
