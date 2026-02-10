/**
 * Fallback-aware LLM Provider
 *
 * Wraps LLM calls with automatic fallback to alternative providers
 * when the primary provider fails.
 */

import type {
  LLMProvider,
  LLMOptions,
  LLMResponse,
  TaskRouting,
  TaskType,
} from "./types.js";
import { createLLMProvider } from "./llm/index.js";
import { costTracker } from "./cost-tracker.js";
import { createLogger } from "../utils/logger.js";
import {
  loadProvidersFromDatabase,
  loadTaskRoutingFromDatabase,
  getTaskRoutingFromDB,
  getProviderConfigFromDB,
  hasApiKey,
} from "../config/database-providers.js";

const logger = createLogger("FallbackLLM");

// Error types that should trigger fallback
const FALLBACK_ERROR_TYPES = [
  "rate_limit",
  "timeout",
  "service_unavailable",
  "authentication_error",
  "connection_error",
  "connection error",  // Match "Connection error." from OpenAI SDK
  "fetch failed",      // Node.js fetch error
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",         // DNS lookup failure
  "ECONNREFUSED",
  "429",
  "500",
  "502",
  "503",
  "504",
];

// Provider instance cache with TTL
const PROVIDER_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const providerCache = new Map<string, { provider: LLMProvider; createdAt: number }>();

/**
 * Clear provider cache (e.g., when CMS config changes)
 */
export function clearProviderCache(): void {
  providerCache.clear();
  logger.info("Provider cache cleared");
}

/**
 * Check if error should trigger fallback
 */
function shouldFallback(error: Error | unknown): boolean {
  const errorString = String(error);
  const errorMessage = error instanceof Error ? error.message : errorString;

  return FALLBACK_ERROR_TYPES.some(
    (type) =>
      errorMessage.toLowerCase().includes(type.toLowerCase()) ||
      errorString.includes(type)
  );
}

/**
 * Get or create LLM provider instance (with TTL-based cache invalidation)
 */
function getProvider(name: string): LLMProvider | null {
  const cached = providerCache.get(name);
  const now = Date.now();

  // Return cached if within TTL
  if (cached && (now - cached.createdAt) < PROVIDER_CACHE_TTL_MS) {
    return cached.provider;
  }

  // Remove expired entry
  if (cached) {
    providerCache.delete(name);
  }

  try {
    // Check if API key exists
    if (!hasApiKey(name)) {
      logger.debug(`Provider ${name} skipped - no API key`);
      return null;
    }
    const provider = createLLMProvider(name);
    providerCache.set(name, { provider, createdAt: now });
    return provider;
  } catch (error) {
    logger.warn(`Failed to create provider ${name}`, { error });
    return null;
  }
}

/**
 * Resolve model for a provider: use routing's preferredModel only for the
 * preferred provider; for fallback providers use their own defaultModel.
 */
async function resolveModel(
  providerName: string,
  routing: TaskRouting,
  explicitModel?: string
): Promise<string> {
  if (explicitModel) return explicitModel;
  if (providerName === routing.preferredProvider) return routing.preferredModel;
  // Fallback provider — use its own default model
  const cfg = await getProviderConfigFromDB(providerName);
  return cfg?.defaultModel || routing.preferredModel;
}

/**
 * Result of a fallback-aware generation
 */
export interface FallbackResult<T = LLMResponse> {
  result: T;
  providersAttempted: string[];
  fallbackUsed: boolean;
  errors: Array<{ provider: string; error: string }>;
}

/**
 * Generate text with automatic fallback
 */
export async function generateWithFallback(
  prompt: string,
  options?: LLMOptions & { taskType?: TaskType }
): Promise<FallbackResult<LLMResponse>> {
  const taskType = options?.taskType || "content-generation";
  const routing = await getTaskRoutingFromDB(taskType);

  if (!routing) {
    throw new Error(`No routing configuration for task: ${taskType}`);
  }

  const providersToTry = [
    routing.preferredProvider,
    ...(routing.fallbackProviders || []),
  ];

  const providersAttempted: string[] = [];
  const errors: Array<{ provider: string; error: string }> = [];

  for (const providerName of providersToTry) {
    providersAttempted.push(providerName);
    const provider = getProvider(providerName);

    if (!provider) {
      errors.push({ provider: providerName, error: "Provider not available (no API key)" });
      continue;
    }

    try {
      logger.info(`Attempting generation with ${providerName}`, { taskType });

      // Check cost limits
      const estimatedTokens = provider.countTokens(prompt) + (options?.maxTokens ?? 1000);
      const estimatedCost = provider.estimateCost(
        estimatedTokens / 2,
        estimatedTokens / 2,
        options?.model || routing.preferredModel
      );

      const affordCheck = costTracker.canAfford(estimatedCost);
      if (!affordCheck.allowed) {
        errors.push({ provider: providerName, error: `Cost limit: ${affordCheck.reason}` });
        continue;
      }

      // Create timeout with proper cleanup to avoid timer leaks
      const timeoutMs = routing.timeoutMs || 60000;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("timeout")), timeoutMs);
      });

      // Generate with timeout
      let response: LLMResponse;
      try {
        // Try fallback models within the same provider first
        const primaryModel = await resolveModel(providerName, routing, options?.model);
        const modelsToTry = [
          primaryModel,
          ...(routing.fallbackModels || []),
        ];

        let lastModelError: Error | undefined;
        let succeeded = false;

        for (const model of modelsToTry) {
          try {
            response = await Promise.race([
              provider.generateText(prompt, {
                ...options,
                model,
              }),
              timeoutPromise,
            ]);
            succeeded = true;
            break;
          } catch (modelError) {
            lastModelError = modelError instanceof Error ? modelError : new Error(String(modelError));
            if (modelsToTry.indexOf(model) < modelsToTry.length - 1) {
              logger.warn(`Model ${model} failed on ${providerName}, trying next model`, {
                error: lastModelError.message,
              });
            }
          }
        }

        if (!succeeded) {
          throw lastModelError || new Error("All models failed");
        }
      } finally {
        // Always clear the timeout to prevent timer leaks
        if (timeoutId) clearTimeout(timeoutId);
      }

      // Record cost
      costTracker.record({
        provider: response!.provider,
        model: response!.model,
        taskType,
        inputTokens: response!.usage.promptTokens,
        outputTokens: response!.usage.completionTokens,
        cost: response!.cost,
        latencyMs: response!.latencyMs,
        success: true,
      });

      logger.info(`Generation successful with ${providerName}`, {
        taskType,
        model: response!.model,
        latencyMs: response!.latencyMs,
        cost: response!.cost,
        fallbackUsed: providersAttempted.length > 1,
      });

      return {
        result: response!,
        providersAttempted,
        fallbackUsed: providersAttempted.length > 1,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push({ provider: providerName, error: errorMessage });

      // Record failed attempt
      costTracker.record({
        provider: providerName,
        model: options?.model || routing.preferredModel,
        taskType,
        cost: 0,
        latencyMs: 0,
        success: false,
        error: errorMessage,
      });

      logger.warn(`Provider ${providerName} failed`, {
        error: errorMessage,
        willFallback: shouldFallback(error) && providersToTry.indexOf(providerName) < providersToTry.length - 1,
      });

      // Continue to next provider if error is fallback-worthy
      if (shouldFallback(error)) {
        continue;
      }

      // If error is not fallback-worthy, throw immediately
      throw error;
    }
  }

  // All providers failed
  const errorSummary = errors.map((e) => `${e.provider}: ${e.error}`).join("; ");
  throw new Error(`All providers failed for task ${taskType}. Errors: ${errorSummary}`);
}

/**
 * Generate JSON with automatic fallback
 */
export async function generateJSONWithFallback<T = unknown>(
  prompt: string,
  options?: LLMOptions & { taskType?: TaskType; schema?: object }
): Promise<FallbackResult<{ data: T; response: LLMResponse }>> {
  const taskType = options?.taskType || "content-generation";
  const routing = await getTaskRoutingFromDB(taskType);

  if (!routing) {
    throw new Error(`No routing configuration for task: ${taskType}`);
  }

  const providersToTry = [
    routing.preferredProvider,
    ...(routing.fallbackProviders || []),
  ];

  const providersAttempted: string[] = [];
  const errors: Array<{ provider: string; error: string }> = [];

  for (const providerName of providersToTry) {
    providersAttempted.push(providerName);
    const provider = getProvider(providerName);

    if (!provider) {
      errors.push({ provider: providerName, error: "Provider not available (no API key)" });
      continue;
    }

    try {
      logger.info(`Attempting JSON generation with ${providerName}`, { taskType });

      // Create timeout with proper cleanup to avoid timer leaks
      const timeoutMs = routing.timeoutMs || 60000;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("timeout")), timeoutMs);
      });

      let result: { data: T; response: LLMResponse };
      try {
        // Try fallback models within the same provider
        const primaryModel = await resolveModel(providerName, routing, options?.model);
        const modelsToTry = [
          primaryModel,
          ...(routing.fallbackModels || []),
        ];

        let lastModelError: Error | undefined;
        let succeeded = false;

        for (const model of modelsToTry) {
          try {
            result = await Promise.race([
              provider.generateJSON<T>(prompt, {
                ...options,
                model,
              }),
              timeoutPromise,
            ]);
            succeeded = true;
            break;
          } catch (modelError) {
            lastModelError = modelError instanceof Error ? modelError : new Error(String(modelError));
            if (modelsToTry.indexOf(model) < modelsToTry.length - 1) {
              logger.warn(`Model ${model} failed on ${providerName} for JSON, trying next model`, {
                error: lastModelError.message,
              });
            }
          }
        }

        if (!succeeded) {
          throw lastModelError || new Error("All models failed");
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }

      // Record cost
      costTracker.record({
        provider: result!.response.provider,
        model: result!.response.model,
        taskType,
        inputTokens: result!.response.usage.promptTokens,
        outputTokens: result!.response.usage.completionTokens,
        cost: result!.response.cost,
        latencyMs: result!.response.latencyMs,
        success: true,
      });

      logger.info(`JSON generation successful with ${providerName}`, {
        taskType,
        model: result!.response.model,
        latencyMs: result!.response.latencyMs,
        fallbackUsed: providersAttempted.length > 1,
      });

      return {
        result: result!,
        providersAttempted,
        fallbackUsed: providersAttempted.length > 1,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push({ provider: providerName, error: errorMessage });

      costTracker.record({
        provider: providerName,
        model: options?.model || routing.preferredModel,
        taskType,
        cost: 0,
        latencyMs: 0,
        success: false,
        error: errorMessage,
      });

      logger.warn(`Provider ${providerName} failed for JSON generation`, { error: errorMessage });

      if (shouldFallback(error)) {
        continue;
      }
      throw error;
    }
  }

  const errorSummary = errors.map((e) => `${e.provider}: ${e.error}`).join("; ");
  throw new Error(`All providers failed for JSON task ${taskType}. Errors: ${errorSummary}`);
}

/**
 * Fallback-aware LLM API (drop-in replacement for llm object)
 */
export const fallbackLlm = {
  /**
   * Generate text with automatic fallback
   */
  async generate(
    prompt: string,
    options?: LLMOptions & { taskType?: TaskType }
  ): Promise<LLMResponse> {
    const result = await generateWithFallback(prompt, options);
    return result.result;
  },

  /**
   * Generate JSON with automatic fallback
   */
  async generateJSON<T = unknown>(
    prompt: string,
    options?: LLMOptions & { taskType?: TaskType; schema?: object }
  ): Promise<{ data: T; response: LLMResponse }> {
    const result = await generateJSONWithFallback<T>(prompt, options);
    return result.result;
  },

  /**
   * Get provider for specific task type (with fallback support)
   */
  forTask(taskType: TaskType): {
    generate: (prompt: string, options?: LLMOptions) => Promise<LLMResponse>;
    generateJSON: <T = unknown>(
      prompt: string,
      options?: LLMOptions & { schema?: object }
    ) => Promise<{ data: T; response: LLMResponse }>;
    generateWithInfo: (prompt: string, options?: LLMOptions) => Promise<FallbackResult<LLMResponse>>;
  } {
    return {
      generate: (prompt: string, options?: LLMOptions) =>
        this.generate(prompt, { ...options, taskType }),

      generateJSON: <T = unknown>(prompt: string, options?: LLMOptions & { schema?: object }) =>
        this.generateJSON<T>(prompt, { ...options, taskType }),

      generateWithInfo: (prompt: string, options?: LLMOptions) =>
        generateWithFallback(prompt, { ...options, taskType }),
    };
  },
};

export default fallbackLlm;
