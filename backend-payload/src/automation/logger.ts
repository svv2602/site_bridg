/**
 * Structured Logger
 *
 * Provides structured logging with different levels and file output.
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

// Default configuration
let config: LoggerConfig = {
  minLevel: "info",
  logToFile: true,
  logFilePath: path.join(process.cwd(), "logs", "automation.log"),
  logToConsole: true,
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
 * Format log entry for file
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

  // File output
  if (config.logToFile) {
    try {
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

// Initialize logger
configureLogger({});

// Test
async function main() {
  console.log("Testing Logger...\n");

  const logger = createLogger("Test");

  logger.debug("Debug message", { key: "value" });
  logger.info("Info message");
  logger.warn("Warning message", { count: 42 });
  logger.error("Error message", { code: "ERR_001" });

  // Test timed operation
  await logger.time("Async operation", async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  console.log("\n✅ Logger test complete");
  console.log(`Log file: ${config.logFilePath}`);
}

main();
