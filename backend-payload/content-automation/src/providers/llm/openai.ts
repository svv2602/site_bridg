/**
 * OpenAI LLM Provider
 *
 * Integration with GPT-4o, o1, o3-mini models.
 */

import OpenAI from "openai";
import type { LLMMessage, LLMOptions, LLMResponse, LLMStreamChunk } from "../types.js";
import { BaseLLMProvider, type BaseLLMConfig } from "./base.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("OpenAIProvider");

// OpenAI model identifiers
export const OPENAI_MODELS = [
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "o1",
  "o1-mini",
  "o3-mini",
] as const;

export type OpenAIModel = (typeof OPENAI_MODELS)[number];

// Models that support system messages
const SUPPORTS_SYSTEM = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"];

// Models that are reasoning-focused (o1, o3)
const REASONING_MODELS = ["o1", "o1-mini", "o3-mini"];

export class OpenAIProvider extends BaseLLMProvider {
  readonly name = "openai";
  readonly models = OPENAI_MODELS;
  readonly defaultModel: OpenAIModel = "gpt-4o";

  private client: OpenAI | null = null;

  constructor(config: BaseLLMConfig) {
    super(config);
    if (config.defaultModel && OPENAI_MODELS.includes(config.defaultModel as OpenAIModel)) {
      this.defaultModel = config.defaultModel as OpenAIModel;
    }
  }

  /**
   * Get or create OpenAI client
   */
  private getClient(): OpenAI {
    if (!this.client) {
      if (!this.apiKey) {
        throw new Error("OPENAI_API_KEY is not set");
      }
      this.client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseUrl,
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
    const model = (options?.model as OpenAIModel) || this.defaultModel;
    const isReasoningModel = REASONING_MODELS.includes(model);
    const supportsSystem = SUPPORTS_SYSTEM.includes(model);

    // Convert messages for OpenAI format
    let openaiMessages: OpenAI.ChatCompletionMessageParam[];

    if (isReasoningModel) {
      // Reasoning models: combine system into user message
      const systemContent = messages.find((m) => m.role === "system")?.content || options?.systemPrompt;
      const userMessages = messages.filter((m) => m.role !== "system");

      if (systemContent && userMessages.length > 0) {
        openaiMessages = userMessages.map((m, i) => {
          if (i === 0 && m.role === "user") {
            return {
              role: "user" as const,
              content: `${systemContent}\n\n${m.content}`,
            };
          }
          return {
            role: m.role as "user" | "assistant",
            content: m.content,
          };
        });
      } else {
        openaiMessages = userMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
      }
    } else if (supportsSystem) {
      // Standard models: use system messages normally
      openaiMessages = messages.map((m) => ({
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
    } else {
      // Fallback: filter out system messages
      openaiMessages = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
    }

    this.logRequest(model, this.countTokens(messages.map((m) => m.content).join("")));

    try {
      const response = await this.withRetry(async () => {
        const client = this.getClient();

        const params: OpenAI.ChatCompletionCreateParamsNonStreaming = {
          model,
          messages: openaiMessages,
          max_completion_tokens: options?.maxTokens ?? 4096,
        };

        // Only add temperature for non-reasoning models
        if (!isReasoningModel) {
          params.temperature = options?.temperature ?? 0.7;
        }

        // Add response format if JSON requested
        if (options?.responseFormat === "json") {
          params.response_format = { type: "json_object" };
        }

        // Add stop sequences
        if (options?.stopSequences) {
          params.stop = options.stopSequences;
        }

        return client.chat.completions.create(params);
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new Error("No content in OpenAI response");
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
      logger.error("OpenAI API error", {
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
    const model = (options?.model as OpenAIModel) || this.defaultModel;
    const client = this.getClient();

    // Reasoning models don't support streaming
    if (REASONING_MODELS.includes(model)) {
      const response = await this.generateText(prompt, options);
      yield {
        content: response.content,
        isComplete: true,
        finishReason: response.finishReason,
      };
      return;
    }

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
      logger.error("OpenAI streaming error", {
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
      logger.warn("OpenAI availability check failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Map OpenAI finish reason to standard format
   */
  private mapFinishReason(
    reason: string | null
  ): LLMResponse["finishReason"] {
    switch (reason) {
      case "stop":
        return "stop";
      case "length":
        return "length";
      case "tool_calls":
      case "function_call":
        return "tool_use";
      case "content_filter":
        return "content_filter";
      default:
        return "stop";
    }
  }
}

/**
 * Create OpenAI provider with default config
 */
export function createOpenAIProvider(apiKey?: string): OpenAIProvider {
  return new OpenAIProvider({
    type: "llm",
    name: "openai",
    apiKey: apiKey || process.env.OPENAI_API_KEY || "",
    enabled: true,
    priority: 2,
  });
}
