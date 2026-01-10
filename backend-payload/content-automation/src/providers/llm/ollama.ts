/**
 * Ollama LLM Provider
 *
 * Local model inference with Ollama.
 * Free, private, and works offline.
 */

import type { LLMMessage, LLMOptions, LLMResponse, LLMStreamChunk } from "../types.js";
import { BaseLLMProvider, type BaseLLMConfig } from "./base.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("OllamaProvider");

// Common Ollama models
export const OLLAMA_MODELS = [
  "llama3.2",
  "llama3.1",
  "mistral",
  "mixtral",
  "codellama",
  "phi3",
  "gemma2",
  "qwen2.5",
] as const;

export type OllamaModel = (typeof OLLAMA_MODELS)[number] | string;

const DEFAULT_OLLAMA_URL = "http://localhost:11434";

interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

interface OllamaChatResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

export class OllamaProvider extends BaseLLMProvider {
  readonly name = "ollama";
  readonly models = OLLAMA_MODELS;
  readonly defaultModel: OllamaModel = "llama3.2";

  private baseUrl: string;

  constructor(config: BaseLLMConfig) {
    super(config);
    this.baseUrl = config.baseUrl || DEFAULT_OLLAMA_URL;
    if (config.defaultModel) {
      this.defaultModel = config.defaultModel;
    }
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

    // Convert to Ollama format
    const ollamaMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Add system prompt if provided and not already in messages
    if (options?.systemPrompt && !messages.some((m) => m.role === "system")) {
      ollamaMessages.unshift({
        role: "system",
        content: options.systemPrompt,
      });
    }

    this.logRequest(model, this.countTokens(messages.map((m) => m.content).join("")));

    try {
      const response = await this.withRetry(async () => {
        const res = await fetch(`${this.baseUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: ollamaMessages,
            stream: false,
            options: {
              temperature: options?.temperature ?? 0.7,
              top_p: options?.topP,
              num_predict: options?.maxTokens ?? 4096,
              stop: options?.stopSequences,
            },
          }),
        });

        if (!res.ok) {
          const error = await res.text();
          throw new Error(`Ollama error: ${res.status} ${error}`);
        }

        return res.json() as Promise<OllamaChatResponse>;
      });

      if (!response.message?.content) {
        throw new Error("No content in Ollama response");
      }

      const result = this.createResponse({
        content: response.message.content,
        model: response.model,
        promptTokens: response.prompt_eval_count ?? 0,
        completionTokens: response.eval_count ?? 0,
        latencyMs: Date.now() - startTime,
        finishReason: response.done ? "stop" : "length",
        raw: response,
      });

      this.logResponse(result);
      return result;
    } catch (error) {
      logger.error("Ollama API error", {
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

    const messages = [];
    if (options?.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    try {
      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens ?? 4096,
          },
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Ollama error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split("\n");

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line) as OllamaChatResponse;

            if (data.message?.content) {
              yield {
                content: data.message.content,
                isComplete: false,
              };
            }

            if (data.done) {
              yield {
                content: "",
                isComplete: true,
                finishReason: "stop",
              };
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      logger.error("Ollama streaming error", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Check if provider is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      return res.ok;
    } catch (error) {
      logger.warn("Ollama availability check failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * List available local models
   */
  async listLocalModels(): Promise<string[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      if (!res.ok) return [];

      const data = (await res.json()) as { models: Array<{ name: string }> };
      return data.models.map((m) => m.name);
    } catch {
      return [];
    }
  }

  /**
   * Override cost estimation - Ollama is free
   */
  override estimateCost(): number {
    return 0;
  }
}

/**
 * Create Ollama provider with default config
 */
export function createOllamaProvider(baseUrl?: string): OllamaProvider {
  return new OllamaProvider({
    type: "llm",
    name: "ollama",
    baseUrl: baseUrl || process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_URL,
    enabled: true,
    priority: 100,
  });
}
