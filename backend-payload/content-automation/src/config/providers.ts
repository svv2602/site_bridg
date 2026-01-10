/**
 * Provider Configuration
 *
 * Configuration for all LLM, Image, and Embedding providers.
 */

import type {
  ProviderConfig,
  TaskRouting,
  TaskType,
  CostLimits,
} from "../providers/types.js";
import { ENV } from "./env.js";

// === LLM Provider Configs ===

export const LLM_PROVIDERS: ProviderConfig[] = [
  {
    type: "llm",
    name: "anthropic",
    apiKey: ENV.ANTHROPIC_API_KEY,
    enabled: Boolean(ENV.ANTHROPIC_API_KEY),
    priority: 1,
    defaultModel: "claude-sonnet-4-20250514",
    options: {
      maxTokens: 4096,
    },
  },
  {
    type: "llm",
    name: "openai",
    apiKey: ENV.OPENAI_API_KEY,
    enabled: Boolean(ENV.OPENAI_API_KEY),
    priority: 2,
    defaultModel: "gpt-4o",
    options: {
      maxTokens: 4096,
    },
  },
  {
    type: "llm",
    name: "deepseek",
    apiKey: ENV.DEEPSEEK_API_KEY,
    baseUrl: "https://api.deepseek.com",
    enabled: Boolean(ENV.DEEPSEEK_API_KEY),
    priority: 3,
    defaultModel: "deepseek-chat",
    options: {
      maxTokens: 4096,
    },
  },
  {
    type: "llm",
    name: "google",
    apiKey: ENV.GOOGLE_AI_API_KEY,
    enabled: Boolean(ENV.GOOGLE_AI_API_KEY),
    priority: 4,
    defaultModel: "gemini-2.0-flash-exp",
    options: {
      maxTokens: 8192,
    },
  },
  {
    type: "llm",
    name: "groq",
    apiKey: ENV.GROQ_API_KEY,
    enabled: Boolean(ENV.GROQ_API_KEY),
    priority: 5,
    defaultModel: "llama-3.3-70b-versatile",
    options: {
      maxTokens: 4096,
    },
  },
  {
    type: "llm",
    name: "openrouter",
    apiKey: ENV.OPENROUTER_API_KEY,
    baseUrl: "https://openrouter.ai/api/v1",
    enabled: Boolean(ENV.OPENROUTER_API_KEY),
    priority: 10, // Fallback
    defaultModel: "anthropic/claude-3.5-sonnet",
    options: {
      maxTokens: 4096,
    },
  },
  {
    type: "llm",
    name: "ollama",
    baseUrl: ENV.OLLAMA_BASE_URL,
    enabled: Boolean(ENV.OLLAMA_BASE_URL),
    priority: 100, // Local fallback
    defaultModel: "llama3.2",
    options: {
      maxTokens: 4096,
    },
  },
];

// === Image Provider Configs ===

export const IMAGE_PROVIDERS: ProviderConfig[] = [
  {
    type: "image",
    name: "openai-dalle",
    apiKey: ENV.OPENAI_API_KEY,
    enabled: Boolean(ENV.OPENAI_API_KEY),
    priority: 1,
    defaultModel: "dall-e-3",
    options: {
      defaultSize: "1024x1024",
      defaultQuality: "hd",
    },
  },
  {
    type: "image",
    name: "stability",
    apiKey: ENV.STABILITY_API_KEY,
    enabled: Boolean(ENV.STABILITY_API_KEY),
    priority: 2,
    defaultModel: "stable-diffusion-3",
    options: {
      defaultSize: "1024x1024",
    },
  },
  {
    type: "image",
    name: "replicate",
    apiKey: ENV.REPLICATE_API_TOKEN,
    enabled: Boolean(ENV.REPLICATE_API_TOKEN),
    priority: 3,
    defaultModel: "black-forest-labs/flux-pro",
    options: {
      defaultSize: "1024x1024",
    },
  },
  {
    type: "image",
    name: "leonardo",
    apiKey: ENV.LEONARDO_API_KEY,
    enabled: Boolean(ENV.LEONARDO_API_KEY),
    priority: 4,
    defaultModel: "phoenix",
    options: {
      defaultSize: "1024x1024",
    },
  },
];

// === Embedding Provider Configs ===

export const EMBEDDING_PROVIDERS: ProviderConfig[] = [
  {
    type: "embedding",
    name: "openai",
    apiKey: ENV.OPENAI_API_KEY,
    enabled: Boolean(ENV.OPENAI_API_KEY),
    priority: 1,
    defaultModel: "text-embedding-3-small",
    options: {
      dimensions: 1536,
    },
  },
  {
    type: "embedding",
    name: "voyage",
    apiKey: ENV.VOYAGE_API_KEY,
    enabled: Boolean(ENV.VOYAGE_API_KEY),
    priority: 2,
    defaultModel: "voyage-3",
    options: {
      dimensions: 1024,
    },
  },
  {
    type: "embedding",
    name: "cohere",
    apiKey: ENV.COHERE_API_KEY,
    enabled: Boolean(ENV.COHERE_API_KEY),
    priority: 3,
    defaultModel: "embed-multilingual-v3.0",
    options: {
      dimensions: 1024,
    },
  },
];

// === Task Routing ===

export const TASK_ROUTING: TaskRouting[] = [
  // Content generation - prefer Claude for quality
  {
    task: "content-generation",
    preferredProvider: "anthropic",
    preferredModel: "claude-sonnet-4-20250514",
    fallbackProviders: ["openai", "deepseek", "openrouter"],
    maxRetries: 2,
    timeoutMs: 60000,
    maxCost: 0.5,
  },
  // Content rewriting - can use cheaper models
  {
    task: "content-rewrite",
    preferredProvider: "deepseek",
    preferredModel: "deepseek-chat",
    fallbackProviders: ["anthropic", "openai"],
    maxRetries: 2,
    timeoutMs: 45000,
    maxCost: 0.2,
  },
  // Quick tasks - use fastest providers
  {
    task: "quick-task",
    preferredProvider: "groq",
    preferredModel: "llama-3.3-70b-versatile",
    fallbackProviders: ["google", "anthropic"],
    maxRetries: 1,
    timeoutMs: 15000,
    maxCost: 0.05,
  },
  // Complex reasoning - use specialized models
  {
    task: "reasoning",
    preferredProvider: "deepseek",
    preferredModel: "deepseek-reasoner",
    fallbackProviders: ["openai", "anthropic"],
    maxRetries: 2,
    timeoutMs: 120000,
    maxCost: 1.0,
  },
  // Analysis tasks
  {
    task: "analysis",
    preferredProvider: "anthropic",
    preferredModel: "claude-sonnet-4-20250514",
    fallbackProviders: ["openai", "deepseek"],
    maxRetries: 2,
    timeoutMs: 60000,
    maxCost: 0.3,
  },
  // Translation
  {
    task: "content-translation",
    preferredProvider: "google",
    preferredModel: "gemini-2.0-flash-exp",
    fallbackProviders: ["anthropic", "deepseek"],
    maxRetries: 2,
    timeoutMs: 30000,
    maxCost: 0.1,
  },
  // Code generation
  {
    task: "code-generation",
    preferredProvider: "anthropic",
    preferredModel: "claude-sonnet-4-20250514",
    fallbackProviders: ["openai", "deepseek"],
    maxRetries: 2,
    timeoutMs: 60000,
    maxCost: 0.5,
  },
  // Image generation
  {
    task: "image-article",
    preferredProvider: "openai-dalle",
    preferredModel: "dall-e-3",
    fallbackProviders: ["replicate", "stability"],
    maxRetries: 2,
    timeoutMs: 120000,
    maxCost: 0.15,
  },
  {
    task: "image-product",
    preferredProvider: "replicate",
    preferredModel: "black-forest-labs/flux-pro",
    fallbackProviders: ["openai-dalle", "stability"],
    maxRetries: 2,
    timeoutMs: 120000,
    maxCost: 0.1,
  },
  {
    task: "image-lifestyle",
    preferredProvider: "replicate",
    preferredModel: "black-forest-labs/flux-pro",
    fallbackProviders: ["openai-dalle"],
    maxRetries: 2,
    timeoutMs: 120000,
    maxCost: 0.1,
  },
  {
    task: "image-banner",
    preferredProvider: "leonardo",
    preferredModel: "phoenix",
    fallbackProviders: ["openai-dalle", "stability"],
    maxRetries: 2,
    timeoutMs: 120000,
    maxCost: 0.15,
  },
  // Embeddings
  {
    task: "embedding-search",
    preferredProvider: "openai",
    preferredModel: "text-embedding-3-small",
    fallbackProviders: ["voyage", "cohere"],
    maxRetries: 2,
    timeoutMs: 30000,
    maxCost: 0.01,
  },
  {
    task: "embedding-similarity",
    preferredProvider: "voyage",
    preferredModel: "voyage-3",
    fallbackProviders: ["openai", "cohere"],
    maxRetries: 2,
    timeoutMs: 30000,
    maxCost: 0.01,
  },
];

// === Cost Limits ===

export const COST_LIMITS: CostLimits = {
  dailyLimit: parseFloat(ENV.COST_DAILY_LIMIT || "10"),
  monthlyLimit: parseFloat(ENV.COST_MONTHLY_LIMIT || "100"),
  perRequestLimit: parseFloat(ENV.COST_PER_REQUEST_LIMIT || "1"),
  warningThreshold: 0.8, // Warn at 80%
};

// === Helper Functions ===

/**
 * Get enabled LLM providers sorted by priority
 */
export function getEnabledLLMProviders(): ProviderConfig[] {
  return LLM_PROVIDERS.filter((p) => p.enabled).sort(
    (a, b) => a.priority - b.priority
  );
}

/**
 * Get enabled Image providers sorted by priority
 */
export function getEnabledImageProviders(): ProviderConfig[] {
  return IMAGE_PROVIDERS.filter((p) => p.enabled).sort(
    (a, b) => a.priority - b.priority
  );
}

/**
 * Get enabled Embedding providers sorted by priority
 */
export function getEnabledEmbeddingProviders(): ProviderConfig[] {
  return EMBEDDING_PROVIDERS.filter((p) => p.enabled).sort(
    (a, b) => a.priority - b.priority
  );
}

/**
 * Get routing for specific task type
 */
export function getTaskRouting(taskType: TaskType): TaskRouting | undefined {
  return TASK_ROUTING.find((r) => r.task === taskType);
}

/**
 * Get provider config by name
 */
export function getProviderConfig(name: string): ProviderConfig | undefined {
  return (
    LLM_PROVIDERS.find((p) => p.name === name) ||
    IMAGE_PROVIDERS.find((p) => p.name === name) ||
    EMBEDDING_PROVIDERS.find((p) => p.name === name)
  );
}
