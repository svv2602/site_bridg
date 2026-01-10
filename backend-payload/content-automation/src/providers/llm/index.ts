/**
 * LLM Providers Index
 *
 * Export all LLM provider implementations.
 */

export { BaseLLMProvider, createMessages, type BaseLLMConfig } from "./base.js";
export { AnthropicProvider, createAnthropicProvider, ANTHROPIC_MODELS, type AnthropicModel } from "./anthropic.js";
export { OpenAIProvider, createOpenAIProvider, OPENAI_MODELS, type OpenAIModel } from "./openai.js";
export { DeepSeekProvider, createDeepSeekProvider, DEEPSEEK_MODELS, type DeepSeekModel } from "./deepseek.js";
export { GoogleProvider, createGoogleProvider, GOOGLE_MODELS, type GoogleModel } from "./google.js";
export { GroqProvider, createGroqProvider, GROQ_MODELS, type GroqModel } from "./groq.js";
export { OpenRouterProvider, createOpenRouterProvider, OPENROUTER_MODELS, type OpenRouterModel } from "./openrouter.js";
export { OllamaProvider, createOllamaProvider, OLLAMA_MODELS, type OllamaModel } from "./ollama.js";

import type { LLMProvider } from "../types.js";
import type { BaseLLMConfig } from "./base.js";
import { AnthropicProvider } from "./anthropic.js";
import { OpenAIProvider } from "./openai.js";
import { DeepSeekProvider } from "./deepseek.js";
import { GoogleProvider } from "./google.js";
import { GroqProvider } from "./groq.js";
import { OpenRouterProvider } from "./openrouter.js";
import { OllamaProvider } from "./ollama.js";
import { getProviderConfig } from "../../config/providers.js";

/**
 * Create LLM provider by name
 */
export function createLLMProvider(name: string): LLMProvider {
  const config = getProviderConfig(name);

  if (!config || config.type !== "llm") {
    throw new Error(`Unknown LLM provider: ${name}`);
  }

  const baseConfig: BaseLLMConfig = {
    ...config,
    maxRetries: 2,
    timeoutMs: 60000,
  };

  switch (name) {
    case "anthropic":
      return new AnthropicProvider(baseConfig);
    case "openai":
      return new OpenAIProvider(baseConfig);
    case "deepseek":
      return new DeepSeekProvider(baseConfig);
    case "google":
      return new GoogleProvider(baseConfig);
    case "groq":
      return new GroqProvider(baseConfig);
    case "openrouter":
      return new OpenRouterProvider(baseConfig);
    case "ollama":
      return new OllamaProvider(baseConfig);
    default:
      throw new Error(`LLM provider not implemented: ${name}`);
  }
}

/**
 * Get default LLM provider (first enabled by priority)
 */
export function getDefaultLLMProvider(): LLMProvider {
  const providers = ["anthropic", "openai", "deepseek", "google", "groq", "openrouter", "ollama"];

  for (const name of providers) {
    const config = getProviderConfig(name);
    if (config?.enabled && config.type === "llm") {
      try {
        return createLLMProvider(name);
      } catch {
        // Provider not available, try next
        continue;
      }
    }
  }

  throw new Error("No LLM providers available");
}

/**
 * List available LLM provider names
 */
export function listLLMProviders(): string[] {
  return ["anthropic", "openai", "deepseek", "google", "groq", "openrouter", "ollama"]
    .filter((name) => {
      const config = getProviderConfig(name);
      return config?.enabled && config.type === "llm";
    });
}
