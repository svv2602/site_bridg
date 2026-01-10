/**
 * Anthropic LLM Provider
 *
 * Integration with Claude models (Sonnet, Haiku, Opus).
 */

import Anthropic from "@anthropic-ai/sdk";
import type { LLMMessage, LLMOptions, LLMResponse, LLMStreamChunk } from "../types.js";
import { BaseLLMProvider, type BaseLLMConfig } from "./base.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("AnthropicProvider");

// Anthropic model identifiers
export const ANTHROPIC_MODELS = [
  "claude-opus-4-20250514",
  "claude-sonnet-4-20250514",
  "claude-3-5-haiku-20241022",
  "claude-3-5-sonnet-20241022",
  "claude-3-opus-20240229",
] as const;

export type AnthropicModel = (typeof ANTHROPIC_MODELS)[number];

export class AnthropicProvider extends BaseLLMProvider {
  readonly name = "anthropic";
  readonly models = ANTHROPIC_MODELS;
  readonly defaultModel: AnthropicModel = "claude-sonnet-4-20250514";

  private client: Anthropic | null = null;

  constructor(config: BaseLLMConfig) {
    super(config);
    if (config.defaultModel && ANTHROPIC_MODELS.includes(config.defaultModel as AnthropicModel)) {
      this.defaultModel = config.defaultModel as AnthropicModel;
    }
  }

  /**
   * Get or create Anthropic client
   */
  private getClient(): Anthropic {
    if (!this.client) {
      if (!this.apiKey) {
        throw new Error("ANTHROPIC_API_KEY is not set");
      }
      this.client = new Anthropic({ apiKey: this.apiKey });
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
    const model = (options?.model as AnthropicModel) || this.defaultModel;

    // Separate system message from conversation
    const systemMessage = messages.find((m) => m.role === "system");
    const conversationMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    this.logRequest(model, this.countTokens(messages.map(m => m.content).join("")));

    try {
      const response = await this.withRetry(async () => {
        const client = this.getClient();
        return client.messages.create({
          model,
          max_tokens: options?.maxTokens ?? 4096,
          temperature: options?.temperature ?? 0.7,
          system: systemMessage?.content || options?.systemPrompt,
          messages: conversationMessages,
          stop_sequences: options?.stopSequences,
        });
      });

      // Extract text content
      const textBlock = response.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response from Claude");
      }

      const result = this.createResponse({
        content: textBlock.text,
        model: response.model,
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        latencyMs: Date.now() - startTime,
        finishReason: this.mapStopReason(response.stop_reason),
        raw: response,
      });

      this.logResponse(result);
      return result;
    } catch (error) {
      logger.error("Anthropic API error", {
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
    const model = (options?.model as AnthropicModel) || this.defaultModel;
    const client = this.getClient();

    const messages: Array<{ role: "user" | "assistant"; content: string }> = [
      { role: "user", content: prompt },
    ];

    try {
      const stream = await client.messages.stream({
        model,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
        system: options?.systemPrompt,
        messages,
      });

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          yield {
            content: event.delta.text,
            isComplete: false,
          };
        }

        if (event.type === "message_stop") {
          yield {
            content: "",
            isComplete: true,
            finishReason: "stop",
          };
        }
      }
    } catch (error) {
      logger.error("Anthropic streaming error", {
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
      // Quick test with minimal tokens
      await client.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 5,
        messages: [{ role: "user", content: "Hi" }],
      });
      return true;
    } catch (error) {
      logger.warn("Anthropic availability check failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Map Anthropic stop reason to standard finish reason
   */
  private mapStopReason(
    stopReason: string | null
  ): LLMResponse["finishReason"] {
    switch (stopReason) {
      case "end_turn":
      case "stop_sequence":
        return "stop";
      case "max_tokens":
        return "length";
      case "tool_use":
        return "tool_use";
      default:
        return "stop";
    }
  }

  /**
   * Count tokens using Anthropic's approximation
   * Claude uses ~3.5-4 chars per token for English, ~2-3 for Ukrainian
   */
  override countTokens(text: string): number {
    // More accurate for multilingual content
    const hasUkrainian = /[а-яіїєґ]/i.test(text);
    const charsPerToken = hasUkrainian ? 2.5 : 4;
    return Math.ceil(text.length / charsPerToken);
  }
}

/**
 * Create Anthropic provider with default config
 */
export function createAnthropicProvider(apiKey?: string): AnthropicProvider {
  return new AnthropicProvider({
    type: "llm",
    name: "anthropic",
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY || "",
    enabled: true,
    priority: 1,
  });
}
