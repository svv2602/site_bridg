/**
 * Structured Logger
 *
 * Provides structured logging with different levels, file output,
 * PII masking, and log rotation by size.
 */

import fs from "fs";
import path from "path";

// Log levels
export type LogLevel = "debug" | "info" | "warn" | "error";

// Log entry structure
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, unknown>;
  duration?: number;
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  logToFile: boolean;
  logFilePath: string;
  logToConsole: boolean;
  /** Maximum log file size in bytes before rotation. Default: 10MB */
  maxFileSize: number;
  /** Number of rotated log files to keep. Default: 5 */
  maxFiles: number;
  /** Enable PII masking in logs. Default: true */
  maskPii: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: "\x1b[36m", // cyan
  info: "\x1b[32m",  // green
  warn: "\x1b[33m",  // yellow
  error: "\x1b[31m", // red
};

const RESET_COLOR = "\x1b[0m";

// PII patterns for masking
const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Email addresses
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: "[EMAIL]" },
  // Ukrainian phone numbers (+380...)
  { pattern: /\+?3?8?0\d{9}/g, replacement: "[PHONE]" },
  // Generic phone patterns (xxx-xxx-xxxx, (xxx) xxx-xxxx)
  { pattern: /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, replacement: "[PHONE]" },
  // API keys (sk-..., key_..., etc.)
  { pattern: /\b(sk-[a-zA-Z0-9]{20,}|key_[a-zA-Z0-9]{20,})\b/g, replacement: "[API_KEY]" },
  // Password-like fields in JSON
  { pattern: /"(?:password|passwd|secret|token|apiKey|api_key)":\s*"[^"]*"/gi, replacement: '"$1":"[REDACTED]"' },
];

/**
 * Mask PII (Personally Identifiable Information) in a string.
 */
function maskPii(text: string): string {
  let masked = text;
  for (const { pattern, replacement } of PII_PATTERNS) {
    masked = masked.replace(pattern, replacement);
  }
  return masked;
}

/**
 * Deep-mask PII in an object. Returns a new object with PII values replaced.
 */
function maskPiiInData(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    // Mask known sensitive field names entirely
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("password") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("token") ||
      lowerKey === "apikey" ||
      lowerKey === "api_key"
    ) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "string") {
      result[key] = maskPii(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = maskPiiInData(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Default configuration
let config: LoggerConfig = {
  minLevel: "info",
  logToFile: true,
  logFilePath: path.join(process.cwd(), "logs", "automation.log"),
  logToConsole: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  maskPii: true,
};

/**
 * Configure logger
 */
export function configureLogger(newConfig: Partial<LoggerConfig>) {
  config = { ...config, ...newConfig };

  // Ensure log directory exists
  if (config.logToFile) {
    const logDir = path.dirname(config.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
}

/**
 * Rotate log file if it exceeds maxFileSize.
 * Renames automation.log -> automation.log.1 -> automation.log.2 etc.
 */
function rotateIfNeeded(): void {
  if (!config.logToFile) return;

  try {
    if (!fs.existsSync(config.logFilePath)) return;

    const stat = fs.statSync(config.logFilePath);
    if (stat.size < config.maxFileSize) return;

    // Rotate existing numbered logs (remove oldest if limit reached)
    for (let i = config.maxFiles - 1; i >= 1; i--) {
      const from = i === 1 ? config.logFilePath : `${config.logFilePath}.${i - 1}`;
      const to = `${config.logFilePath}.${i}`;
      if (fs.existsSync(from)) {
        fs.renameSync(from, to);
      }
    }

    // Current log becomes .1 (renameSync above already moved it if maxFiles > 1)
    // If maxFiles is 1, just truncate
    if (config.maxFiles <= 1) {
      fs.truncateSync(config.logFilePath, 0);
    }
  } catch {
    // Rotation failure should not crash the logger
  }
}

/**
 * Format log entry for console
 */
function formatForConsole(entry: LogEntry): string {
  const color = LOG_COLORS[entry.level];
  const levelStr = entry.level.toUpperCase().padEnd(5);
  const categoryStr = `[${entry.category}]`.padEnd(20);

  let message = `${color}${levelStr}${RESET_COLOR} ${categoryStr} ${entry.message}`;

  if (entry.duration !== undefined) {
    message += ` (${entry.duration}ms)`;
  }

  if (entry.data && Object.keys(entry.data).length > 0) {
    message += `\n       ${JSON.stringify(entry.data)}`;
  }

  return message;
}

/**
 * Format log entry for file (JSON lines format)
 */
function formatForFile(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Write log entry
 */
function writeLog(entry: LogEntry) {
  // Check minimum level
  if (LOG_LEVELS[entry.level] < LOG_LEVELS[config.minLevel]) {
    return;
  }

  // Apply PII masking
  if (config.maskPii) {
    entry = {
      ...entry,
      message: maskPii(entry.message),
      data: entry.data ? maskPiiInData(entry.data) : entry.data,
    };
  }

  // Console output
  if (config.logToConsole) {
    const formattedMessage = formatForConsole(entry);
    if (entry.level === "error") {
      console.error(formattedMessage);
    } else if (entry.level === "warn") {
      console.warn(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  }

  // File output with rotation
  if (config.logToFile) {
    try {
      rotateIfNeeded();
      const logLine = formatForFile(entry) + "\n";
      fs.appendFileSync(config.logFilePath, logLine);
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }
}

/**
 * Create a logger instance for a specific category
 */
export function createLogger(category: string) {
  return {
    debug(message: string, data?: Record<string, unknown>) {
      writeLog({
        timestamp: new Date().toISOString(),
        level: "debug",
        category,
        message,
        data,
      });
    },

    info(message: string, data?: Record<string, unknown>) {
      writeLog({
        timestamp: new Date().toISOString(),
        level: "info",
        category,
        message,
        data,
      });
    },

    warn(message: string, data?: Record<string, unknown>) {
      writeLog({
        timestamp: new Date().toISOString(),
        level: "warn",
        category,
        message,
        data,
      });
    },

    error(message: string, data?: Record<string, unknown>) {
      writeLog({
        timestamp: new Date().toISOString(),
        level: "error",
        category,
        message,
        data,
      });
    },

    /**
     * Log operation with duration
     */
    async time<T>(
      operation: string,
      fn: () => Promise<T>,
      level: LogLevel = "info"
    ): Promise<T> {
      const startTime = Date.now();
      try {
        const result = await fn();
        const duration = Date.now() - startTime;
        writeLog({
          timestamp: new Date().toISOString(),
          level,
          category,
          message: `${operation} completed`,
          duration,
        });
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        writeLog({
          timestamp: new Date().toISOString(),
          level: "error",
          category,
          message: `${operation} failed`,
          duration,
          data: { error: error instanceof Error ? error.message : String(error) },
        });
        throw error;
      }
    },
  };
}

// Pre-configured loggers for common categories
export const scraperLogger = createLogger("Scraper");
export const generatorLogger = createLogger("Generator");
export const publisherLogger = createLogger("Publisher");
export const validatorLogger = createLogger("Validator");
export const schedulerLogger = createLogger("Scheduler");

// Initialize logger with defaults
configureLogger({});
