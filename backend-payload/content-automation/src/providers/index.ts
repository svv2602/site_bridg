/**
 * Providers Module
 *
 * Main entry point for the multi-provider architecture.
 * Provides simple API for LLM, Image, and Embedding generation.
 */

// Export types
export * from "./types.js";

// Export LLM providers
export * from "./llm/index.js";

// Export Image providers
export * from "./image/index.js";

// Export cost tracker
export { costTracker, CostTrackerImpl } from "./cost-tracker.js";

// Export fallback-aware LLM
export {
  fallbackLlm,
  generateWithFallback,
  generateJSONWithFallback,
  type FallbackResult,
} from "./fallback-llm.js";

// Export configurations (static)
export {
  LLM_PROVIDERS,
  IMAGE_PROVIDERS,
  EMBEDDING_PROVIDERS,
  TASK_ROUTING,
  COST_LIMITS,
  getEnabledLLMProviders,
  getEnabledImageProviders,
  getEnabledEmbeddingProviders,
  getTaskRouting,
  getProviderConfig,
} from "../config/providers.js";

// Export database-backed configurations
export {
  loadProvidersFromDatabase,
  loadTaskRoutingFromDatabase,
  getTaskRoutingFromDB,
  getProviderConfigFromDB,
  getEnabledLLMProvidersFromDB,
  getEnabledImageProvidersFromDB,
  hasApiKey,
  clearProviderCache,
} from "../config/database-providers.js";

// Export pricing utilities
export {
  getModelPricing,
  calculateLLMCost,
  calculateImageCost,
  calculateEmbeddingCost,
  findCheapestLLM,
  findCheapestImage,
} from "../config/pricing.js";

import type {
  LLMProvider,
  LLMOptions,
  LLMResponse,
  ImageProvider,
  ImageOptions,
  ImageResult,
  TaskType,
} from "./types.js";
import { createLLMProvider, getDefaultLLMProvider } from "./llm/index.js";
import { createImageProvider, getDefaultImageProvider } from "./image/index.js";
import { getTaskRouting, getProviderConfig } from "../config/providers.js";
import { costTracker } from "./cost-tracker.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("Providers");

// Cached providers
const llmProviderCache = new Map<string, LLMProvider>();
const imageProviderCache = new Map<string, ImageProvider>();

/**
 * Get or create LLM provider (cached)
 */
function getLLMProvider(name?: string): LLMProvider {
  const providerName = name || "default";

  if (!llmProviderCache.has(providerName)) {
    const provider = name ? createLLMProvider(name) : getDefaultLLMProvider();
    llmProviderCache.set(providerName, provider);
  }

  return llmProviderCache.get(providerName)!;
}

/**
 * Get or create Image provider (cached)
 */
function getImageProvider(name?: string): ImageProvider {
  const providerName = name || "default";

  if (!imageProviderCache.has(providerName)) {
    const provider = name ? createImageProvider(name) : getDefaultImageProvider();
    imageProviderCache.set(providerName, provider);
  }

  return imageProviderCache.get(providerName)!;
}

/**
 * Simple LLM API
 */
export const llm = {
  /**
   * Generate text using default or specified provider
   */
  async generate(
    prompt: string,
    options?: LLMOptions & { provider?: string; taskType?: TaskType }
  ): Promise<LLMResponse> {
    const provider = getLLMProvider(options?.provider);

    // Check cost limits
    const estimatedTokens = provider.countTokens(prompt) + (options?.maxTokens ?? 1000);
    const estimatedCost = provider.estimateCost(estimatedTokens / 2, estimatedTokens / 2, options?.model);

    const affordCheck = costTracker.canAfford(estimatedCost);
    if (!affordCheck.allowed) {
      throw new Error(`Cost limit exceeded: ${affordCheck.reason}`);
    }

    const response = await provider.generateText(prompt, options);

    // Record cost
    costTracker.record({
      provider: response.provider,
      model: response.model,
      taskType: options?.taskType || "content-generation",
      inputTokens: response.usage.promptTokens,
      outputTokens: response.usage.completionTokens,
      cost: response.cost,
      latencyMs: response.latencyMs,
      success: true,
    });

    return response;
  },

  /**
   * Generate JSON using default or specified provider
   */
  async generateJSON<T = unknown>(
    prompt: string,
    options?: LLMOptions & { provider?: string; schema?: object; taskType?: TaskType }
  ): Promise<{ data: T; response: LLMResponse }> {
    const provider = getLLMProvider(options?.provider);
    const result = await provider.generateJSON<T>(prompt, options);

    // Record cost
    costTracker.record({
      provider: result.response.provider,
      model: result.response.model,
      taskType: options?.taskType || "content-generation",
      inputTokens: result.response.usage.promptTokens,
      outputTokens: result.response.usage.completionTokens,
      cost: result.response.cost,
      latencyMs: result.response.latencyMs,
      success: true,
    });

    return result;
  },

  /**
   * Get provider for specific task type
   */
  forTask(taskType: TaskType): {
    generate: (prompt: string, options?: LLMOptions) => Promise<LLMResponse>;
    generateJSON: <T = unknown>(
      prompt: string,
      options?: LLMOptions & { schema?: object }
    ) => Promise<{ data: T; response: LLMResponse }>;
  } {
    const routing = getTaskRouting(taskType);
    if (!routing) {
      throw new Error(`No routing for task type: ${taskType}`);
    }

    return {
      generate: (prompt: string, options?: LLMOptions) => {
        return this.generate(prompt, {
          ...options,
          provider: routing.preferredProvider,
          model: routing.preferredModel,
          taskType,
        });
      },
      generateJSON: <T = unknown>(
        prompt: string,
        options?: LLMOptions & { schema?: object }
      ) => {
        return this.generateJSON<T>(prompt, {
          ...options,
          provider: routing.preferredProvider,
          model: routing.preferredModel,
          taskType,
        });
      },
    };
  },

  /**
   * Get provider instance
   */
  getProvider(name?: string): LLMProvider {
    return getLLMProvider(name);
  },

  /**
   * List available providers
   */
  listProviders(): string[] {
    return ["anthropic", "openai", "deepseek", "google", "groq", "openrouter", "ollama"]
      .filter((name) => {
        const config = getProviderConfig(name);
        return config?.enabled && config.type === "llm";
      });
  },
};

/**
 * Simple Image API
 */
export const image = {
  /**
   * Generate image using default or specified provider
   */
  async generate(
    prompt: string,
    options?: ImageOptions & { provider?: string; taskType?: TaskType }
  ): Promise<ImageResult> {
    const provider = getImageProvider(options?.provider);

    // Check cost limits
    const estimatedCost = provider.estimateCost(options?.model, options?.size, options?.quality);

    const affordCheck = costTracker.canAfford(estimatedCost);
    if (!affordCheck.allowed) {
      throw new Error(`Cost limit exceeded: ${affordCheck.reason}`);
    }

    const result = await provider.generateImage(prompt, options);

    // Record cost
    costTracker.record({
      provider: result.provider,
      model: result.model,
      taskType: options?.taskType || "image-article",
      cost: result.cost,
      latencyMs: result.latencyMs,
      success: true,
    });

    return result;
  },

  /**
   * Generate multiple images
   */
  async generateMultiple(
    prompt: string,
    count: number,
    options?: ImageOptions & { provider?: string; taskType?: TaskType }
  ): Promise<ImageResult[]> {
    const provider = getImageProvider(options?.provider);
    const results = await provider.generateImages(prompt, count, options);

    // Record costs
    for (const result of results) {
      costTracker.record({
        provider: result.provider,
        model: result.model,
        taskType: options?.taskType || "image-article",
        cost: result.cost,
        latencyMs: result.latencyMs,
        success: true,
      });
    }

    return results;
  },

  /**
   * Get provider instance
   */
  getProvider(name?: string): ImageProvider {
    return getImageProvider(name);
  },

  /**
   * List available providers
   */
  listProviders(): string[] {
    return ["openai-dalle", "replicate", "stability", "leonardo"]
      .filter((name) => {
        const config = getProviderConfig(name);
        return config?.enabled && config.type === "image";
      });
  },
};

/**
 * Health check for all enabled providers
 */
export async function checkProvidersHealth(): Promise<
  Array<{ name: string; type: string; available: boolean; latencyMs?: number; error?: string }>
> {
  const results: Array<{
    name: string;
    type: string;
    available: boolean;
    latencyMs?: number;
    error?: string;
  }> = [];

  // Check LLM providers
  for (const name of llm.listProviders()) {
    const startTime = Date.now();
    try {
      const provider = getLLMProvider(name);
      const available = await provider.isAvailable();
      results.push({
        name,
        type: "llm",
        available,
        latencyMs: Date.now() - startTime,
      });
    } catch (error) {
      results.push({
        name,
        type: "llm",
        available: false,
        latencyMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Check Image providers
  for (const name of image.listProviders()) {
    const startTime = Date.now();
    try {
      const provider = getImageProvider(name);
      const available = await provider.isAvailable();
      results.push({
        name,
        type: "image",
        available,
        latencyMs: Date.now() - startTime,
      });
    } catch (error) {
      results.push({
        name,
        type: "image",
        available: false,
        latencyMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logger.info("Provider health check complete", {
    total: results.length,
    available: results.filter((r) => r.available).length,
  });

  return results;
}

/**
 * Get cost statistics
 */
export function getCostStats() {
  return {
    daily: costTracker.getSummary("day"),
    weekly: costTracker.getSummary("week"),
    monthly: costTracker.getSummary("month"),
    recentEntries: costTracker.getRecentEntries(20),
  };
}
