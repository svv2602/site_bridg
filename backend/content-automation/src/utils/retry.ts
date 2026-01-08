/**
 * Retry Utility
 *
 * Provides retry logic with exponential backoff for API calls.
 */

import { createLogger } from "./logger.js";

const logger = createLogger("Retry");

// Types
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: (string | RegExp)[];
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTimeMs: number;
}

// Default configuration
const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    "ECONNRESET",
    "ETIMEDOUT",
    "ENOTFOUND",
    "rate_limit",
    "timeout",
    "429",
    "503",
    "502",
    "504",
  ],
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay for retry attempt
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  // Add jitter (0-20%)
  const jitter = delay * 0.2 * Math.random();
  return Math.min(delay + jitter, config.maxDelayMs);
}

/**
 * Check if error is retryable
 */
function isRetryable(error: Error, config: RetryConfig): boolean {
  const errorString = `${error.name} ${error.message}`;

  if (!config.retryableErrors || config.retryableErrors.length === 0) {
    return true; // Retry all errors
  }

  return config.retryableErrors.some((pattern) => {
    if (typeof pattern === "string") {
      return errorString.includes(pattern);
    }
    return pattern.test(errorString);
  });
}

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const fullConfig: RetryConfig = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
    try {
      const data = await fn();
      return {
        success: true,
        data,
        attempts: attempt + 1,
        totalTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (attempt < fullConfig.maxRetries && isRetryable(lastError, fullConfig)) {
        const delay = calculateDelay(attempt, fullConfig);
        logger.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms`, {
          error: lastError.message,
          attempt: attempt + 1,
          maxRetries: fullConfig.maxRetries,
        });
        await sleep(delay);
      } else {
        // Final attempt or non-retryable error
        logger.error(`All ${attempt + 1} attempts failed`, {
          error: lastError.message,
        });
      }
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: fullConfig.maxRetries + 1,
    totalTimeMs: Date.now() - startTime,
  };
}

/**
 * Execute function with retry, throw on failure
 */
export async function withRetryThrow<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const result = await withRetry(fn, config);

  if (!result.success) {
    throw result.error || new Error("All retry attempts failed");
  }

  return result.data!;
}

// Circuit Breaker
export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxCalls: number;
}

type CircuitState = "closed" | "open" | "half-open";

const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 60000,
  halfOpenMaxCalls: 3,
};

/**
 * Circuit Breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failureCount = 0;
  private lastFailureTime = 0;
  private halfOpenCalls = 0;
  private config: CircuitBreakerConfig;
  private name: string;

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.name = name;
    this.config = { ...DEFAULT_CIRCUIT_CONFIG, ...config };
  }

  /**
   * Execute function through circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === "open") {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      if (timeSinceFailure < this.config.resetTimeoutMs) {
        throw new Error(`Circuit breaker "${this.name}" is open`);
      }
      // Try half-open
      this.state = "half-open";
      this.halfOpenCalls = 0;
      logger.info(`Circuit breaker "${this.name}" entering half-open state`);
    }

    // Check half-open limit
    if (this.state === "half-open" && this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
      throw new Error(`Circuit breaker "${this.name}" half-open limit reached`);
    }

    try {
      if (this.state === "half-open") {
        this.halfOpenCalls++;
      }

      const result = await fn();

      // Success - reset on half-open or decrement on closed
      if (this.state === "half-open") {
        this.state = "closed";
        this.failureCount = 0;
        logger.info(`Circuit breaker "${this.name}" closed`);
      } else if (this.failureCount > 0) {
        this.failureCount--;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.config.failureThreshold) {
        this.state = "open";
        logger.error(`Circuit breaker "${this.name}" opened after ${this.failureCount} failures`);
      }

      throw error;
    }
  }

  /**
   * Get current state
   */
  getState(): { state: CircuitState; failureCount: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
    };
  }

  /**
   * Reset circuit breaker
   */
  reset() {
    this.state = "closed";
    this.failureCount = 0;
    this.halfOpenCalls = 0;
  }
}

// Pre-configured circuit breakers
export const llmCircuitBreaker = new CircuitBreaker("LLM", {
  failureThreshold: 3,
  resetTimeoutMs: 120000, // 2 minutes
});

export const strapiCircuitBreaker = new CircuitBreaker("Strapi", {
  failureThreshold: 5,
  resetTimeoutMs: 30000, // 30 seconds
});

// Test
async function main() {
  console.log("Testing Retry Utility...\n");

  // Test successful retry
  console.log("Test 1: Successful after 2 retries");
  let attempt = 0;
  const result1 = await withRetry(async () => {
    attempt++;
    if (attempt < 3) {
      throw new Error("Simulated timeout error");
    }
    return "success";
  });
  console.log(`Result: ${result1.success ? "✅" : "❌"}`);
  console.log(`Attempts: ${result1.attempts}`);
  console.log(`Data: ${result1.data}`);

  // Test circuit breaker
  console.log("\nTest 2: Circuit Breaker");
  const breaker = new CircuitBreaker("Test", {
    failureThreshold: 2,
    resetTimeoutMs: 1000,
  });

  // Cause failures
  for (let i = 0; i < 3; i++) {
    try {
      await breaker.execute(async () => {
        throw new Error("Simulated failure");
      });
    } catch (e) {
      console.log(`Call ${i + 1}: ${(e as Error).message}`);
    }
  }

  console.log(`Circuit state: ${breaker.getState().state}`);

  // Wait and try again
  console.log("Waiting for reset...");
  await sleep(1100);

  try {
    await breaker.execute(async () => "recovered");
    console.log("Circuit recovered!");
  } catch (e) {
    console.log(`Still failing: ${(e as Error).message}`);
  }

  console.log("\n✅ Retry test complete");
}

main();
