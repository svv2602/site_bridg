/**
 * Google AI (Gemini) LLM Provider
 *
 * Integration with Gemini 2.0 Flash, Gemini Pro models.
 */

import type { LLMMessage, LLMOptions, LLMResponse, LLMStreamChunk } from "../types.js";
import { BaseLLMProvider, type BaseLLMConfig } from "./base.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("GoogleProvider");

// Google AI model identifiers
export const GOOGLE_MODELS = [
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.0-pro",
] as const;

export type GoogleModel = (typeof GOOGLE_MODELS)[number];

const GOOGLE_API_URL = "https://generativelanguage.googleapis.com/v1beta";

interface GeminiContent {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GoogleProvider extends BaseLLMProvider {
  readonly name = "google";
  readonly models = GOOGLE_MODELS;
  readonly defaultModel: GoogleModel = "gemini-2.0-flash-exp";

  constructor(config: BaseLLMConfig) {
    super(config);
    if (config.defaultModel && GOOGLE_MODELS.includes(config.defaultModel as GoogleModel)) {
      this.defaultModel = config.defaultModel as GoogleModel;
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
    const model = (options?.model as GoogleModel) || this.defaultModel;

    if (!this.apiKey) {
      throw new Error("GOOGLE_AI_API_KEY is not set");
    }

    // Convert messages to Gemini format
    const systemInstruction = messages.find((m) => m.role === "system")?.content || options?.systemPrompt;
    const contents: GeminiContent[] = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    this.logRequest(model, this.countTokens(messages.map((m) => m.content).join("")));

    try {
      const response = await this.withRetry(async () => {
        const url = `${GOOGLE_API_URL}/models/${model}:generateContent?key=${this.apiKey}`;

        const body: Record<string, unknown> = {
          contents,
          generationConfig: {
            maxOutputTokens: options?.maxTokens ?? 4096,
            temperature: options?.temperature ?? 0.7,
            topP: options?.topP,
            stopSequences: options?.stopSequences,
          },
        };

        if (systemInstruction) {
          body.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const error = await res.text();
          throw new Error(`Google API error: ${res.status} ${error}`);
        }

        return res.json() as Promise<GeminiResponse>;
      });

      const candidate = response.candidates?.[0];
      if (!candidate?.content?.parts?.[0]?.text) {
        throw new Error("No content in Gemini response");
      }

      const content = candidate.content.parts.map((p) => p.text).join("");

      const result = this.createResponse({
        content,
        model,
        promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
        latencyMs: Date.now() - startTime,
        finishReason: this.mapFinishReason(candidate.finishReason),
        raw: response,
      });

      this.logResponse(result);
      return result;
    } catch (error) {
      logger.error("Google API error", {
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
    const model = (options?.model as GoogleModel) || this.defaultModel;

    if (!this.apiKey) {
      throw new Error("GOOGLE_AI_API_KEY is not set");
    }

    const url = `${GOOGLE_API_URL}/models/${model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;

    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
      },
      ...(options?.systemPrompt && {
        systemInstruction: { parts: [{ text: options.systemPrompt }] },
      }),
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Google API error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                yield { content: text, isComplete: false };
              }
              if (data.candidates?.[0]?.finishReason) {
                yield {
                  content: "",
                  isComplete: true,
                  finishReason: this.mapFinishReason(data.candidates[0].finishReason),
                };
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      logger.error("Google streaming error", {
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
      const url = `${GOOGLE_API_URL}/models?key=${this.apiKey}`;
      const res = await fetch(url);
      return res.ok;
    } catch (error) {
      logger.warn("Google availability check failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Map Gemini finish reason to standard format
   */
  private mapFinishReason(reason: string): LLMResponse["finishReason"] {
    switch (reason) {
      case "STOP":
        return "stop";
      case "MAX_TOKENS":
        return "length";
      case "SAFETY":
        return "content_filter";
      default:
        return "stop";
    }
  }
}

/**
 * Create Google provider with default config
 */
export function createGoogleProvider(apiKey?: string): GoogleProvider {
  return new GoogleProvider({
    type: "llm",
    name: "google",
    apiKey: apiKey || process.env.GOOGLE_AI_API_KEY || "",
    enabled: true,
    priority: 4,
  });
}
