/**
 * OpenRouter LLM Provider
 *
 * Universal gateway to 200+ models.
 * Perfect for fallback scenarios.
 */

import OpenAI from "openai";
import type { LLMMessage, LLMOptions, LLMResponse, LLMStreamChunk } from "../types.js";
import { BaseLLMProvider, type BaseLLMConfig } from "./base.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("OpenRouterProvider");

// Popular OpenRouter models
export const OPENROUTER_MODELS = [
  "anthropic/claude-3.5-sonnet",
  "anthropic/claude-3-haiku",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.3-70b-instruct",
  "deepseek/deepseek-chat",
  "mistralai/mistral-large",
] as const;

export type OpenRouterModel = (typeof OPENROUTER_MODELS)[number] | string;

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export class OpenRouterProvider extends BaseLLMProvider {
  readonly name = "openrouter";
  readonly models = OPENROUTER_MODELS;
  readonly defaultModel: OpenRouterModel = "anthropic/claude-3.5-sonnet";

  private client: OpenAI | null = null;

  constructor(config: BaseLLMConfig) {
    super(config);
    if (config.defaultModel) {
      this.defaultModel = config.defaultModel;
    }
  }

  /**
   * Get or create OpenAI-compatible client for OpenRouter
   */
  private getClient(): OpenAI {
    if (!this.client) {
      if (!this.apiKey) {
        throw new Error("OPENROUTER_API_KEY is not set");
      }
      this.client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseUrl || OPENROUTER_BASE_URL,
        defaultHeaders: {
          "HTTP-Referer": "https://bridgestone.ua",
          "X-Title": "Bridgestone Ukraine CMS",
        },
      });
    }
    return this.client;
  }

  /**
   * Generate chat completion
   */
  async generateChat(
    messages: LLMMessage[],
    options?: LLMOptions
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;

    // Convert messages to OpenAI format
    const openaiMessages: OpenAI.ChatCompletionMessageParam[] = messages.map((m) => ({
      role: m.role as "system" | "user" | "assistant",
      content: m.content,
    }));

    // Add system prompt from options if not in messages
    if (options?.systemPrompt && !messages.some((m) => m.role === "system")) {
      openaiMessages.unshift({
        role: "system",
        content: options.systemPrompt,
      });
    }

    this.logRequest(model, this.countTokens(messages.map((m) => m.content).join("")));

    try {
      const response = await this.withRetry(async () => {
        const client = this.getClient();

        return client.chat.completions.create({
          model,
          messages: openaiMessages,
          max_tokens: options?.maxTokens ?? 4096,
          temperature: options?.temperature ?? 0.7,
          top_p: options?.topP,
          stop: options?.stopSequences,
        });
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new Error("No content in OpenRouter response");
      }

      const result = this.createResponse({
        content: choice.message.content,
        model: response.model,
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        latencyMs: Date.now() - startTime,
        finishReason: this.mapFinishReason(choice.finish_reason),
        raw: response,
      });

      this.logResponse(result);
      return result;
    } catch (error) {
      logger.error("OpenRouter API error", {
        error: error instanceof Error ? error.message : String(error),
        model,
      });
      throw error;
    }
  }

  /**
   * Stream chat completion
   */
  async *generateStream(
    prompt: string,
    options?: LLMOptions
  ): AsyncIterable<LLMStreamChunk> {
    const model = options?.model || this.defaultModel;
    const client = this.getClient();

    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (options?.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    try {
      const stream = await client.chat.completions.create({
        model,
        messages,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        const finishReason = chunk.choices[0]?.finish_reason;

        if (delta?.content) {
          yield {
            content: delta.content,
            isComplete: false,
          };
        }

        if (finishReason) {
          yield {
            content: "",
            isComplete: true,
            finishReason: this.mapFinishReason(finishReason),
          };
        }
      }
    } catch (error) {
      logger.error("OpenRouter streaming error", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Check if provider is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const client = this.getClient();
      await client.models.list();
      return true;
    } catch (error) {
      logger.warn("OpenRouter availability check failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Map finish reason to standard format
   */
  private mapFinishReason(reason: string | null): LLMResponse["finishReason"] {
    switch (reason) {
      case "stop":
        return "stop";
      case "length":
        return "length";
      case "tool_calls":
        return "tool_use";
      case "content_filter":
        return "content_filter";
      default:
        return "stop";
    }
  }
}

/**
 * Create OpenRouter provider with default config
 */
export function createOpenRouterProvider(apiKey?: string): OpenRouterProvider {
  return new OpenRouterProvider({
    type: "llm",
    name: "openrouter",
    apiKey: apiKey || process.env.OPENROUTER_API_KEY || "",
    baseUrl: OPENROUTER_BASE_URL,
    enabled: true,
    priority: 10,
  });
}
