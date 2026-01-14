/**
 * Replicate Image Provider
 *
 * Integration with Flux and other models via Replicate.
 */

import type { ImageOptions, ImageResult, ImageSize } from "../types.js";
import { BaseImageProvider, type BaseImageConfig } from "./base.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("ReplicateProvider");

// Popular Replicate image models
export const REPLICATE_MODELS = [
  "black-forest-labs/flux-pro",
  "black-forest-labs/flux-schnell",
  "black-forest-labs/flux-dev",
  "stability-ai/sdxl",
] as const;

export type ReplicateModel = (typeof REPLICATE_MODELS)[number] | string;

const REPLICATE_API_URL = "https://api.replicate.com/v1";

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[];
  error?: string;
  metrics?: {
    predict_time?: number;
  };
}

export class ReplicateProvider extends BaseImageProvider {
  readonly name = "replicate";
  readonly models = REPLICATE_MODELS;
  readonly defaultModel: ReplicateModel = "black-forest-labs/flux-pro";

  constructor(config: BaseImageConfig) {
    super(config);
    if (config.defaultModel) {
      this.defaultModel = config.defaultModel;
    }
  }

  /**
   * Generate image
   */
  async generateImage(
    prompt: string,
    options?: ImageOptions
  ): Promise<ImageResult> {
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;

    if (!this.apiKey) {
      throw new Error("REPLICATE_API_TOKEN is not set");
    }

    // Parse size
    const size = options?.size || "1024x1024";
    const dimensions = this.parseSize(size);

    this.logRequest(model, prompt);

    try {
      // Create prediction with optimized settings for quality
      const prediction = await this.createPrediction(model, {
        prompt,
        width: dimensions.width,
        height: dimensions.height,
        seed: options?.seed,
        // Increased inference steps for better quality (was 25/50, now 40/60)
        num_inference_steps: options?.quality === "hd" ? 60 : 40,
        // Add guidance scale for better prompt adherence
        guidance_scale: options?.quality === "hd" ? 7.5 : 6.0,
        negative_prompt: options?.negativePrompt,
      });

      // Wait for completion
      const result = await this.waitForPrediction(prediction.id);

      if (result.status !== "succeeded" || !result.output) {
        throw new Error(`Prediction failed: ${result.error || result.status}`);
      }

      // Get the image URL
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;

      const imageResult = this.createResult({
        url: imageUrl,
        model,
        width: dimensions.width,
        height: dimensions.height,
        latencyMs: Date.now() - startTime,
      });

      this.logResponse(imageResult);
      return imageResult;
    } catch (error) {
      logger.error("Replicate API error", {
        error: error instanceof Error ? error.message : String(error),
        model,
      });
      throw error;
    }
  }

  /**
   * Create a prediction
   */
  private async createPrediction(
    model: string,
    input: Record<string, unknown>
  ): Promise<ReplicatePrediction> {
    const [owner, name] = model.split("/");

    const response = await fetch(`${REPLICATE_API_URL}/models/${owner}/${name}/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Replicate API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  /**
   * Wait for prediction to complete
   */
  private async waitForPrediction(
    id: string,
    maxWaitMs: number = 300000
  ): Promise<ReplicatePrediction> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const response = await fetch(`${REPLICATE_API_URL}/predictions/${id}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get prediction: ${response.status}`);
      }

      const prediction: ReplicatePrediction = await response.json();

      if (prediction.status === "succeeded" || prediction.status === "failed") {
        return prediction;
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error("Prediction timed out");
  }

  /**
   * Check if provider is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${REPLICATE_API_URL}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      logger.warn("Replicate availability check failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}

/**
 * Create Replicate provider with default config
 */
export function createReplicateProvider(apiKey?: string): ReplicateProvider {
  return new ReplicateProvider({
    type: "image",
    name: "replicate",
    apiKey: apiKey || process.env.REPLICATE_API_TOKEN || "",
    enabled: true,
    priority: 3,
  });
}
