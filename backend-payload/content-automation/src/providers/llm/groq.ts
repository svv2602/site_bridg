/**
 * Groq LLM Provider
 *
 * Integration with Groq's ultra-fast inference.
 * Uses OpenAI-compatible API.
 */

import OpenAI from "openai";
import type { LLMMessage, LLMOptions, LLMResponse, LLMStreamChunk } from "../types.js";
import { BaseLLMProvider, type BaseLLMConfig } from "./base.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("GroqProvider");

// Groq model identifiers
export const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
] as const;

export type GroqModel = (typeof GROQ_MODELS)[number];

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

export class GroqProvider extends BaseLLMProvider {
  readonly name = "groq";
  readonly models = GROQ_MODELS;
  readonly defaultModel: GroqModel = "llama-3.3-70b-versatile";

  private client: OpenAI | null = null;

  constructor(config: BaseLLMConfig) {
    super(config);
    if (config.defaultModel && GROQ_MODELS.includes(config.defaultModel as GroqModel)) {
      this.defaultModel = config.defaultModel as GroqModel;
    }
  }

  /**
   * Get or create OpenAI-compatible client for Groq
   */
  private getClient(): OpenAI {
    if (!this.client) {
      if (!this.apiKey) {
        throw new Error("GROQ_API_KEY is not set");
      }
      this.client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseUrl || GROQ_BASE_URL,
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
    const model = (options?.model as GroqModel) || this.defaultModel;

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
        throw new Error("No content in Groq response");
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
      logger.error("Groq API error", {
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
    const model = (options?.model as GroqModel) || this.defaultModel;
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
      logger.error("Groq streaming error", {
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
      logger.warn("Groq availability check failed", {
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
      default:
        return "stop";
    }
  }
}

/**
 * Create Groq provider with default config
 */
export function createGroqProvider(apiKey?: string): GroqProvider {
  return new GroqProvider({
    type: "llm",
    name: "groq",
    apiKey: apiKey || process.env.GROQ_API_KEY || "",
    baseUrl: GROQ_BASE_URL,
    enabled: true,
    priority: 5,
  });
}
