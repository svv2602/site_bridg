/**
 * Base LLM Provider
 *
 * Abstract base class for all LLM providers.
 * Provides common functionality and enforces interface.
 */

import type {
  LLMProvider,
  LLMOptions,
  LLMResponse,
  LLMMessage,
  LLMStreamChunk,
  ProviderConfig,
} from "../types.js";
import { calculateLLMCost } from "../../config/pricing.js";
import { withRetry } from "../../utils/retry.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("LLMProvider");

export interface BaseLLMConfig extends ProviderConfig {
  /** Retry configuration */
  maxRetries?: number;
  /** Request timeout in ms */
  timeoutMs?: number;
}

export abstract class BaseLLMProvider implements LLMProvider {
  abstract readonly name: string;
  abstract readonly models: readonly string[];
  abstract readonly defaultModel: string;

  protected config: BaseLLMConfig;
  protected apiKey: string;
  protected baseUrl?: string;

  constructor(config: BaseLLMConfig) {
    this.config = config;
    this.apiKey = config.apiKey || "";
    this.baseUrl = config.baseUrl;
  }

  /**
   * Generate text from a prompt
   */
  async generateText(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    const messages: LLMMessage[] = [];

    if (options?.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    return this.generateChat(messages, options);
  }

  /**
   * Generate text from chat messages - MUST be implemented by subclass
   */
  abstract generateChat(
    messages: LLMMessage[],
    options?: LLMOptions
  ): Promise<LLMResponse>;

  /**
   * Generate and parse JSON response
   */
  async generateJSON<T = unknown>(
    prompt: string,
    options?: LLMOptions & { schema?: object }
  ): Promise<{ data: T; response: LLMResponse }> {
    const jsonPrompt = `${prompt}

Respond with valid JSON only. No explanations or markdown.`;

    const response = await this.generateText(jsonPrompt, {
      ...options,
      responseFormat: "json",
    });

    try {
      // Try to extract JSON from response
      const content = response.content.trim();

      // First, try to parse the entire content as JSON
      try {
        const data = JSON.parse(content) as T;
        return { data, response };
      } catch {
        // Not valid JSON, try to extract
      }

      // Try to find a JSON array first
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          const data = JSON.parse(arrayMatch[0]) as T;
          return { data, response };
        } catch {
          // Array match wasn't valid JSON
        }
      }

      // Try to find a single JSON object
      const objectMatch = content.match(/\{[\s\S]*?\}/);
      if (objectMatch) {
        try {
          const data = JSON.parse(objectMatch[0]) as T;
          return { data, response };
        } catch {
          // Single object match wasn't valid JSON
        }
      }

      // Try to extract multiple JSON objects and combine into array
      // This handles cases where LLM returns separate objects instead of an array
      const objects: unknown[] = [];
      const objectRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
      let match;
      while ((match = objectRegex.exec(content)) !== null) {
        try {
          objects.push(JSON.parse(match[0]));
        } catch {
          // Skip invalid objects
        }
      }

      if (objects.length > 0) {
        logger.info(`Extracted ${objects.length} separate JSON objects from response`);
        return { data: objects as T, response };
      }

      throw new Error("No valid JSON found in response");
    } catch (error) {
      logger.error(`Failed to parse JSON response from ${this.name}`, {
        error: error instanceof Error ? error.message : String(error),
        content: response.content.slice(0, 500),
      });
      throw new Error(`Failed to parse JSON: ${error}`);
    }
  }

  /**
   * Stream text generation - default implementation throws
   * Subclasses should override if they support streaming
   */
  async *generateStream(
    prompt: string,
    options?: LLMOptions
  ): AsyncIterable<LLMStreamChunk> {
    // Default: no streaming support, return full response as single chunk
    const response = await this.generateText(prompt, options);
    yield {
      content: response.content,
      isComplete: true,
      finishReason: response.finishReason,
    };
  }

  /**
   * Estimate cost for given token counts
   */
  estimateCost(
    promptTokens: number,
    completionTokens: number,
    model?: string
  ): number {
    return calculateLLMCost(
      this.name,
      model || this.defaultModel,
      promptTokens,
      completionTokens
    );
  }

  /**
   * Check if provider is available
   */
  abstract isAvailable(): Promise<boolean>;

  /**
   * Count tokens in text (approximate)
   * Default implementation: ~4 chars per token
   */
  countTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Execute API call with retry logic
   */
  protected async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    const result = await withRetry(fn, {
      maxRetries: this.config.maxRetries ?? 2,
    });

    if (!result.success) {
      throw result.error || new Error("Request failed after retries");
    }

    return result.data!;
  }

  /**
   * Create a standardized response object
   */
  protected createResponse(params: {
    content: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
    finishReason?: LLMResponse["finishReason"];
    raw?: unknown;
  }): LLMResponse {
    const cost = this.estimateCost(
      params.promptTokens,
      params.completionTokens,
      params.model
    );

    return {
      content: params.content,
      model: params.model,
      provider: this.name,
      usage: {
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        totalTokens: params.promptTokens + params.completionTokens,
      },
      cost,
      latencyMs: params.latencyMs,
      finishReason: params.finishReason || "stop",
      raw: params.raw,
    };
  }

  /**
   * Log request for debugging
   */
  protected logRequest(model: string, tokens: number): void {
    logger.info(`${this.name} request`, { model, tokens });
  }

  /**
   * Log response for debugging
   */
  protected logResponse(response: LLMResponse): void {
    logger.info(`${this.name} response`, {
      model: response.model,
      tokens: response.usage.totalTokens,
      cost: response.cost.toFixed(4),
      latency: response.latencyMs,
    });
  }
}

/**
 * Helper to create LLMMessage array from simple prompt
 */
export function createMessages(
  prompt: string,
  systemPrompt?: string
): LLMMessage[] {
  const messages: LLMMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  messages.push({ role: "user", content: prompt });

  return messages;
}
