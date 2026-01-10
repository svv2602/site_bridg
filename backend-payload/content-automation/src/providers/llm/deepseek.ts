/**
 * DeepSeek LLM Provider
 *
 * Integration with DeepSeek V3 and R1 models.
 * Uses OpenAI-compatible API.
 */

import OpenAI from "openai";
import type { LLMMessage, LLMOptions, LLMResponse, LLMStreamChunk } from "../types.js";
import { BaseLLMProvider, type BaseLLMConfig } from "./base.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("DeepSeekProvider");

// DeepSeek model identifiers
export const DEEPSEEK_MODELS = [
  "deepseek-chat",      // DeepSeek V3
  "deepseek-reasoner",  // DeepSeek R1 (reasoning)
] as const;

export type DeepSeekModel = (typeof DEEPSEEK_MODELS)[number];

const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export class DeepSeekProvider extends BaseLLMProvider {
  readonly name = "deepseek";
  readonly models = DEEPSEEK_MODELS;
  readonly defaultModel: DeepSeekModel = "deepseek-chat";

  private client: OpenAI | null = null;

  constructor(config: BaseLLMConfig) {
    super(config);
    if (config.defaultModel && DEEPSEEK_MODELS.includes(config.defaultModel as DeepSeekModel)) {
      this.defaultModel = config.defaultModel as DeepSeekModel;
    }
  }

  /**
   * Get or create OpenAI-compatible client for DeepSeek
   */
  private getClient(): OpenAI {
    if (!this.client) {
      if (!this.apiKey) {
        throw new Error("DEEPSEEK_API_KEY is not set");
      }
      this.client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseUrl || DEEPSEEK_BASE_URL,
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
    const model = (options?.model as DeepSeekModel) || this.defaultModel;
    const isReasoningModel = model === "deepseek-reasoner";

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

        const params: OpenAI.ChatCompletionCreateParamsNonStreaming = {
          model,
          messages: openaiMessages,
          max_tokens: options?.maxTokens ?? 4096,
        };

        // Reasoning model may have different parameter handling
        if (!isReasoningModel) {
          params.temperature = options?.temperature ?? 0.7;
          if (options?.topP !== undefined) {
            params.top_p = options.topP;
          }
        }

        if (options?.stopSequences) {
          params.stop = options.stopSequences;
        }

        return client.chat.completions.create(params);
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new Error("No content in DeepSeek response");
      }

      // For reasoning model, content may include reasoning steps
      let content = choice.message.content;

      // If reasoning model, try to extract just the answer
      if (isReasoningModel && content.includes("<answer>")) {
        const answerMatch = content.match(/<answer>([\s\S]*?)<\/answer>/);
        if (answerMatch) {
          content = answerMatch[1].trim();
        }
      }

      const result = this.createResponse({
        content,
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
      logger.error("DeepSeek API error", {
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
    const model = (options?.model as DeepSeekModel) || this.defaultModel;
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
      logger.error("DeepSeek streaming error", {
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
      // Quick availability check
      await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 5,
      });
      return true;
    } catch (error) {
      logger.warn("DeepSeek availability check failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Map finish reason to standard format
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
        return "tool_use";
      default:
        return "stop";
    }
  }

  /**
   * DeepSeek token counting - similar to GPT
   */
  override countTokens(text: string): number {
    // DeepSeek uses similar tokenization to GPT
    const hasUkrainian = /[а-яіїєґ]/i.test(text);
    const charsPerToken = hasUkrainian ? 2 : 4;
    return Math.ceil(text.length / charsPerToken);
  }
}

/**
 * Create DeepSeek provider with default config
 */
export function createDeepSeekProvider(apiKey?: string): DeepSeekProvider {
  return new DeepSeekProvider({
    type: "llm",
    name: "deepseek",
    apiKey: apiKey || process.env.DEEPSEEK_API_KEY || "",
    baseUrl: DEEPSEEK_BASE_URL,
    enabled: true,
    priority: 3,
  });
}
