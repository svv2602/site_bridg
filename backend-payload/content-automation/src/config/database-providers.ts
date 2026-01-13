/**
 * Database Provider Configuration Loader
 *
 * Loads provider settings and task routing from Payload CMS database.
 * Falls back to hardcoded config if database is unavailable.
 */

import type { ProviderConfig, TaskRouting, TaskType } from "../providers/types.js";
import { ENV } from "./env.js";
import { createLogger } from "../utils/logger.js";
import {
  LLM_PROVIDERS as DEFAULT_LLM_PROVIDERS,
  IMAGE_PROVIDERS as DEFAULT_IMAGE_PROVIDERS,
  TASK_ROUTING as DEFAULT_TASK_ROUTING,
} from "./providers.js";

const logger = createLogger("DatabaseProviders");

// Payload API base URL
const PAYLOAD_API_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3001";

// Cache for loaded config
let cachedProviders: ProviderConfig[] | null = null;
let cachedTaskRouting: TaskRouting[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute cache

// API key environment variable mapping
const API_KEY_ENV_VARS: Record<string, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  "openai-dalle": "OPENAI_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  google: "GOOGLE_AI_API_KEY",
  groq: "GROQ_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  ollama: "OLLAMA_BASE_URL",
  stability: "STABILITY_API_KEY",
  replicate: "REPLICATE_API_TOKEN",
  leonardo: "LEONARDO_API_KEY",
};

/**
 * Load provider settings from Payload database
 */
export async function loadProvidersFromDatabase(): Promise<ProviderConfig[]> {
  // Check cache
  if (cachedProviders && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedProviders;
  }

  try {
    const response = await fetch(`${PAYLOAD_API_URL}/api/provider-settings?limit=100`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch providers: ${response.status}`);
    }

    const data = await response.json() as { docs?: any[] };
    const dbProviders = data.docs || [];

    if (dbProviders.length === 0) {
      logger.warn("No providers in database, using defaults");
      return [...DEFAULT_LLM_PROVIDERS, ...DEFAULT_IMAGE_PROVIDERS];
    }

    // Convert database records to ProviderConfig
    const providers: ProviderConfig[] = dbProviders.map((p: any) => {
      const envVar = API_KEY_ENV_VARS[p.name] || p.apiKeyEnvVar;
      const apiKey = envVar ? (process.env[envVar] as string) : undefined;

      return {
        type: p.type as "llm" | "image" | "embedding",
        name: p.name,
        apiKey,
        baseUrl: p.baseUrl,
        enabled: p.enabled && Boolean(apiKey),
        priority: p.priority || 10,
        defaultModel: p.defaultModel,
        options: {
          maxTokens: p.maxTokens || 4096,
        },
        availableModels: p.availableModels?.map((m: any) => m.model) || [],
      };
    });

    cachedProviders = providers;
    cacheTimestamp = Date.now();
    logger.info(`Loaded ${providers.length} providers from database`);

    return providers;
  } catch (error) {
    logger.error("Failed to load providers from database, using defaults", { error });
    return [...DEFAULT_LLM_PROVIDERS, ...DEFAULT_IMAGE_PROVIDERS];
  }
}

/**
 * Load task routing from Payload database
 */
export async function loadTaskRoutingFromDatabase(): Promise<TaskRouting[]> {
  // Check cache
  if (cachedTaskRouting && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedTaskRouting;
  }

  try {
    const response = await fetch(`${PAYLOAD_API_URL}/api/task-routing?limit=100`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch task routing: ${response.status}`);
    }

    const data = await response.json() as { docs?: any[] };
    const dbRouting = data.docs || [];

    if (dbRouting.length === 0) {
      logger.warn("No task routing in database, using defaults");
      return DEFAULT_TASK_ROUTING;
    }

    // Convert database records to TaskRouting
    const routing: TaskRouting[] = dbRouting.map((r: any) => ({
      task: r.task as TaskType,
      preferredProvider: r.preferredProvider,
      preferredModel: r.preferredModel,
      fallbackModels: r.fallbackModels?.map((m: any) => m.model) || [],
      fallbackProviders: r.fallbackProviders || [],
      maxRetries: r.maxRetries || 2,
      timeoutMs: r.timeoutMs || 60000,
      maxCost: r.maxCost || 0.5,
    }));

    cachedTaskRouting = routing;
    logger.info(`Loaded ${routing.length} task routes from database`);

    return routing;
  } catch (error) {
    logger.error("Failed to load task routing from database, using defaults", { error });
    return DEFAULT_TASK_ROUTING;
  }
}

/**
 * Get task routing for specific task
 */
export async function getTaskRoutingFromDB(taskType: TaskType): Promise<TaskRouting | undefined> {
  const routing = await loadTaskRoutingFromDatabase();
  return routing.find((r) => r.task === taskType);
}

/**
 * Get provider config by name
 */
export async function getProviderConfigFromDB(name: string): Promise<ProviderConfig | undefined> {
  const providers = await loadProvidersFromDatabase();
  return providers.find((p) => p.name === name);
}

/**
 * Get enabled LLM providers sorted by priority
 */
export async function getEnabledLLMProvidersFromDB(): Promise<ProviderConfig[]> {
  const providers = await loadProvidersFromDatabase();
  return providers
    .filter((p) => p.enabled && p.type === "llm")
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get enabled Image providers sorted by priority
 */
export async function getEnabledImageProvidersFromDB(): Promise<ProviderConfig[]> {
  const providers = await loadProvidersFromDatabase();
  return providers
    .filter((p) => p.enabled && p.type === "image")
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Check if a provider has an API key configured
 */
export function hasApiKey(providerName: string): boolean {
  const envVar = API_KEY_ENV_VARS[providerName];
  return envVar ? Boolean(process.env[envVar]) : false;
}

/**
 * Clear cache (useful for testing or forcing reload)
 */
export function clearProviderCache(): void {
  cachedProviders = null;
  cachedTaskRouting = null;
  cacheTimestamp = 0;
  logger.debug("Provider cache cleared");
}
