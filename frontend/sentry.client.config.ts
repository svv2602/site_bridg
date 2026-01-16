import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Client Configuration
 *
 * This file configures Sentry for the browser (client-side).
 * Errors, performance data, and replays are captured here.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  // Capture 10% of transactions for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  // Capture 10% of sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Only enable in production or when DSN is explicitly set
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Debug mode for development
  debug: false,

  // Filter out common non-actionable errors
  ignoreErrors: [
    // Browser extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    // Network errors that are usually transient
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    // ResizeObserver errors (browser quirk, not actionable)
    'ResizeObserver loop',
    // User aborted navigation
    'AbortError',
  ],

  // Attach user info if available
  beforeSend(event) {
    // Don't send events if DSN is not configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }
    return event;
  },
});
