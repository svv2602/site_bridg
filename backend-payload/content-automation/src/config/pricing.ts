/**
 * Model Pricing Configuration
 *
 * Pricing data for all supported models (per 1M tokens or per image).
 * Updated: January 2026
 */

import type { ModelPricing } from "../providers/types.js";

// === LLM Model Pricing (USD per 1M tokens) ===

export const LLM_PRICING: ModelPricing[] = [
  // Anthropic
  {
    provider: "anthropic",
    model: "claude-opus-4-20250514",
    inputPer1M: 15.0,
    outputPer1M: 75.0,
    contextWindow: 200000,
    maxOutput: 32000,
    updatedAt: new Date("2025-05-14"),
  },
  {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    inputPer1M: 3.0,
    outputPer1M: 15.0,
    contextWindow: 200000,
    maxOutput: 64000,
    updatedAt: new Date("2025-05-14"),
  },
  {
    provider: "anthropic",
    model: "claude-3-5-haiku-20241022",
    inputPer1M: 0.8,
    outputPer1M: 4.0,
    contextWindow: 200000,
    maxOutput: 8192,
    updatedAt: new Date("2024-10-22"),
  },

  // OpenAI
  {
    provider: "openai",
    model: "gpt-4o",
    inputPer1M: 2.5,
    outputPer1M: 10.0,
    contextWindow: 128000,
    maxOutput: 16384,
    updatedAt: new Date("2024-11-01"),
  },
  {
    provider: "openai",
    model: "gpt-4o-mini",
    inputPer1M: 0.15,
    outputPer1M: 0.6,
    contextWindow: 128000,
    maxOutput: 16384,
    updatedAt: new Date("2024-07-18"),
  },
  {
    provider: "openai",
    model: "o1",
    inputPer1M: 15.0,
    outputPer1M: 60.0,
    contextWindow: 200000,
    maxOutput: 100000,
    updatedAt: new Date("2024-12-17"),
  },
  {
    provider: "openai",
    model: "o3-mini",
    inputPer1M: 1.1,
    outputPer1M: 4.4,
    contextWindow: 200000,
    maxOutput: 100000,
    updatedAt: new Date("2025-01-31"),
  },

  // DeepSeek
  {
    provider: "deepseek",
    model: "deepseek-chat",
    inputPer1M: 0.14,
    outputPer1M: 0.28,
    contextWindow: 64000,
    maxOutput: 8192,
    updatedAt: new Date("2024-12-26"),
  },
  {
    provider: "deepseek",
    model: "deepseek-reasoner",
    inputPer1M: 0.55,
    outputPer1M: 2.19,
    contextWindow: 64000,
    maxOutput: 8192,
    updatedAt: new Date("2025-01-20"),
  },

  // Google
  {
    provider: "google",
    model: "gemini-2.0-flash-exp",
    inputPer1M: 0.075,
    outputPer1M: 0.3,
    contextWindow: 1000000,
    maxOutput: 8192,
    updatedAt: new Date("2024-12-11"),
  },
  {
    provider: "google",
    model: "gemini-1.5-pro",
    inputPer1M: 1.25,
    outputPer1M: 5.0,
    contextWindow: 2000000,
    maxOutput: 8192,
    updatedAt: new Date("2024-05-14"),
  },

  // Groq
  {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    inputPer1M: 0.59,
    outputPer1M: 0.79,
    contextWindow: 128000,
    maxOutput: 32768,
    updatedAt: new Date("2024-12-06"),
  },
  {
    provider: "groq",
    model: "mixtral-8x7b-32768",
    inputPer1M: 0.24,
    outputPer1M: 0.24,
    contextWindow: 32768,
    maxOutput: 32768,
    updatedAt: new Date("2024-03-01"),
  },

  // OpenRouter (wrapper prices vary by model)
  {
    provider: "openrouter",
    model: "anthropic/claude-3.5-sonnet",
    inputPer1M: 3.0,
    outputPer1M: 15.0,
    contextWindow: 200000,
    maxOutput: 8192,
    updatedAt: new Date("2024-06-20"),
  },
];

// === Image Model Pricing (USD per image) ===

export const IMAGE_PRICING: ModelPricing[] = [
  // OpenAI DALL-E
  {
    provider: "openai-dalle",
    model: "dall-e-3",
    inputPer1M: 0,
    outputPer1M: 0,
    perImage: 0.04, // 1024x1024 standard
    updatedAt: new Date("2024-01-01"),
  },
  {
    provider: "openai-dalle",
    model: "dall-e-3-hd",
    inputPer1M: 0,
    outputPer1M: 0,
    perImage: 0.08, // 1024x1024 HD
    updatedAt: new Date("2024-01-01"),
  },

  // Stability AI
  {
    provider: "stability",
    model: "stable-diffusion-3",
    inputPer1M: 0,
    outputPer1M: 0,
    perImage: 0.065,
    updatedAt: new Date("2024-06-01"),
  },
  {
    provider: "stability",
    model: "stable-diffusion-xl",
    inputPer1M: 0,
    outputPer1M: 0,
    perImage: 0.03,
    updatedAt: new Date("2024-01-01"),
  },

  // Replicate
  {
    provider: "replicate",
    model: "black-forest-labs/flux-pro",
    inputPer1M: 0,
    outputPer1M: 0,
    perImage: 0.055,
    updatedAt: new Date("2024-08-01"),
  },
  {
    provider: "replicate",
    model: "black-forest-labs/flux-schnell",
    inputPer1M: 0,
    outputPer1M: 0,
    perImage: 0.003,
    updatedAt: new Date("2024-08-01"),
  },

  // Leonardo
  {
    provider: "leonardo",
    model: "phoenix",
    inputPer1M: 0,
    outputPer1M: 0,
    perImage: 0.015,
    updatedAt: new Date("2024-11-01"),
  },
  {
    provider: "leonardo",
    model: "kino-xl",
    inputPer1M: 0,
    outputPer1M: 0,
    perImage: 0.02,
    updatedAt: new Date("2024-11-01"),
  },
];

// === Embedding Model Pricing (USD per 1M tokens) ===

export const EMBEDDING_PRICING: ModelPricing[] = [
  // OpenAI
  {
    provider: "openai",
    model: "text-embedding-3-large",
    inputPer1M: 0.13,
    outputPer1M: 0,
    updatedAt: new Date("2024-01-25"),
  },
  {
    provider: "openai",
    model: "text-embedding-3-small",
    inputPer1M: 0.02,
    outputPer1M: 0,
    updatedAt: new Date("2024-01-25"),
  },

  // Voyage AI
  {
    provider: "voyage",
    model: "voyage-3",
    inputPer1M: 0.06,
    outputPer1M: 0,
    updatedAt: new Date("2024-09-01"),
  },
  {
    provider: "voyage",
    model: "voyage-3-lite",
    inputPer1M: 0.02,
    outputPer1M: 0,
    updatedAt: new Date("2024-09-01"),
  },

  // Cohere
  {
    provider: "cohere",
    model: "embed-multilingual-v3.0",
    inputPer1M: 0.1,
    outputPer1M: 0,
    updatedAt: new Date("2024-03-01"),
  },
];

// === Helper Functions ===

/**
 * Get pricing for specific model
 */
export function getModelPricing(
  provider: string,
  model: string
): ModelPricing | undefined {
  const allPricing = [...LLM_PRICING, ...IMAGE_PRICING, ...EMBEDDING_PRICING];
  return allPricing.find((p) => p.provider === provider && p.model === model);
}

/**
 * Calculate LLM cost for given token counts
 */
export function calculateLLMCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = getModelPricing(provider, model);
  if (!pricing) {
    // Default estimate if pricing not found
    return (inputTokens + outputTokens) * 0.000002; // ~$2/1M tokens
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.inputPer1M;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPer1M;

  return inputCost + outputCost;
}

/**
 * Calculate image generation cost
 */
export function calculateImageCost(
  provider: string,
  model: string,
  count: number = 1
): number {
  const pricing = getModelPricing(provider, model);
  if (!pricing || !pricing.perImage) {
    // Default estimate
    return count * 0.05;
  }

  return count * pricing.perImage;
}

/**
 * Calculate embedding cost
 */
export function calculateEmbeddingCost(
  provider: string,
  model: string,
  tokens: number
): number {
  const pricing = getModelPricing(provider, model);
  if (!pricing) {
    // Default estimate
    return (tokens / 1_000_000) * 0.05;
  }

  return (tokens / 1_000_000) * pricing.inputPer1M;
}

/**
 * Find cheapest LLM model for given constraints
 */
export function findCheapestLLM(options?: {
  minContextWindow?: number;
  minMaxOutput?: number;
  providers?: string[];
}): ModelPricing | undefined {
  let candidates = LLM_PRICING;

  if (options?.minContextWindow) {
    candidates = candidates.filter(
      (p) => (p.contextWindow || 0) >= options.minContextWindow!
    );
  }

  if (options?.minMaxOutput) {
    candidates = candidates.filter(
      (p) => (p.maxOutput || 0) >= options.minMaxOutput!
    );
  }

  if (options?.providers?.length) {
    candidates = candidates.filter((p) =>
      options.providers!.includes(p.provider)
    );
  }

  // Sort by average cost (input + output)
  candidates.sort(
    (a, b) => a.inputPer1M + a.outputPer1M - (b.inputPer1M + b.outputPer1M)
  );

  return candidates[0];
}

/**
 * Find cheapest image model
 */
export function findCheapestImage(
  providers?: string[]
): ModelPricing | undefined {
  let candidates = IMAGE_PRICING.filter((p) => p.perImage);

  if (providers?.length) {
    candidates = candidates.filter((p) => providers.includes(p.provider));
  }

  candidates.sort((a, b) => (a.perImage || 0) - (b.perImage || 0));

  return candidates[0];
}
