/**
 * Structured Logger for Backend (src/)
 *
 * Lightweight logger matching the content-automation logger API.
 * Console-only (no file output) — production deployments capture
 * stdout/stderr via Docker logging drivers.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
};

const RESET = '\x1b[0m';

const MIN_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function log(level: LogLevel, category: string, message: string, data?: Record<string, unknown>) {
  if (LOG_LEVELS[level] < LOG_LEVELS[MIN_LEVEL]) return;

  const color = LOG_COLORS[level];
  const tag = `[${category}]`;
  const prefix = `${color}${level.toUpperCase().padEnd(5)}${RESET} ${tag.padEnd(16)}`;

  if (data && Object.keys(data).length > 0) {
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(`${prefix} ${message}`, data);
  } else {
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(`${prefix} ${message}`);
  }
}

export function createLogger(category: string) {
  return {
    debug: (msg: string, data?: Record<string, unknown>) => log('debug', category, msg, data),
    info: (msg: string, data?: Record<string, unknown>) => log('info', category, msg, data),
    warn: (msg: string, data?: Record<string, unknown>) => log('warn', category, msg, data),
    error: (msg: string, data?: Record<string, unknown>) => log('error', category, msg, data),
  };
}

// Pre-configured loggers
export const serverLogger = createLogger('Server');
export const importLogger = createLogger('Import');
export const sentryLogger = createLogger('Sentry');
export const schedulerLogger = createLogger('Scheduler');
