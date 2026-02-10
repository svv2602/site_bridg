/**
 * Sentry Error Tracking for Backend
 *
 * Initializes Sentry for error tracking in the Payload CMS backend.
 * Only active when SENTRY_DSN environment variable is set.
 *
 * To enable:
 * 1. npm install @sentry/node
 * 2. Set SENTRY_DSN in .env
 * 3. Import and call initSentry() in payload.config.ts onInit
 *
 * @example
 * // In payload.config.ts
 * onInit: async () => {
 *   initSentry();
 *   initScheduler();
 * },
 */

let sentryInitialized = false;

/**
 * Initialize Sentry error tracking.
 * No-op if SENTRY_DSN is not set or @sentry/node is not installed.
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.log('[Sentry] SENTRY_DSN not set, error tracking disabled');
    return;
  }

  try {
    // Dynamic import to avoid hard dependency on @sentry/node
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/node');

    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.npm_package_version || '1.0.0',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Only send errors in production
      beforeSend(event: unknown) {
        if (process.env.NODE_ENV !== 'production') {
          return null;
        }
        return event;
      },
    });

    sentryInitialized = true;
    console.log('[Sentry] Initialized for backend error tracking');
  } catch {
    console.log('[Sentry] @sentry/node not installed, skipping initialization');
    console.log('[Sentry] To enable: npm install @sentry/node');
  }
}

/**
 * Capture an exception with Sentry (if initialized).
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (!sentryInitialized) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/node');
    if (context) {
      Sentry.setContext('extra', context);
    }
    Sentry.captureException(error);
  } catch {
    // Sentry should never crash the application
  }
}

/**
 * Capture a message with Sentry (if initialized).
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (!sentryInitialized) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/node');
    Sentry.captureMessage(message, level);
  } catch {
    // Sentry should never crash the application
  }
}
