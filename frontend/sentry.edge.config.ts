import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Edge Configuration
 *
 * This file configures Sentry for Edge runtime (middleware, edge API routes).
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Only enable when DSN is configured
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Debug mode
  debug: false,
});
