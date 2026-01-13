/**
 * OpenAI DALL-E Image Provider
 *
 * Integration with DALL-E 3 for high-quality image generation.
 */

import OpenAI from "openai";
import type { ImageOptions, ImageResult, ImageSize } from "../types.js";
import { BaseImageProvider, type BaseImageConfig } from "./base.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("DalleProvider");

// DALL-E models
export const DALLE_MODELS = ["dall-e-3", "dall-e-2"] as const;

export type DalleModel = (typeof DALLE_MODELS)[number];

// DALL-E 3 sizes
const DALLE3_SIZES: ImageSize[] = ["1024x1024", "1792x1024", "1024x1792"];

// DALL-E 2 sizes (more limited)
const DALLE2_SIZES: ImageSize[] = ["256x256", "512x512", "1024x1024"];

export class OpenAIDalleProvider extends BaseImageProvider {
  readonly name = "openai-dalle";
  readonly models = DALLE_MODELS;
  readonly defaultModel: DalleModel = "dall-e-3";

  private client: OpenAI | null = null;

  constructor(config: BaseImageConfig) {
    super(config);
    if (config.defaultModel && DALLE_MODELS.includes(config.defaultModel as DalleModel)) {
      this.defaultModel = config.defaultModel as DalleModel;
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
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
    return this.client;
  }

  /**
   * Generate image
   */
  async generateImage(
    prompt: string,
    options?: ImageOptions
  ): Promise<ImageResult> {
    const startTime = Date.now();
    const model = (options?.model as DalleModel) || this.defaultModel;

    // Validate and adjust size based on model
    let size: ImageSize = options?.size || "1024x1024";
    if (model === "dall-e-3" && !DALLE3_SIZES.includes(size)) {
      size = "1024x1024";
    } else if (model === "dall-e-2" && !DALLE2_SIZES.includes(size)) {
      // DALL-E 2 has more limited sizes, fallback to max supported
      size = "1024x1024";
      logger.info("Adjusted size for dall-e-2", { original: options?.size, adjusted: size });
    }

    this.logRequest(model, prompt);

    try {
      const response = await this.withRetry(async () => {
        const client = this.getClient();

        const params: OpenAI.ImageGenerateParams = {
          model,
          prompt,
          n: 1,
          size: size as "1024x1024" | "1792x1024" | "1024x1792",
        };

        if (model === "dall-e-3") {
          params.quality = options?.quality === "hd" ? "hd" : "standard";
          params.style = options?.style === "vivid" ? "vivid" : "natural";
        }

        return client.images.generate(params);
      });

      const image = response.data[0];
      if (!image?.url) {
        throw new Error("No image URL in DALL-E response");
      }

      const dimensions = this.parseSize(size);

      const result = this.createResult({
        url: image.url,
        model,
        width: dimensions.width,
        height: dimensions.height,
        latencyMs: Date.now() - startTime,
        revisedPrompt: image.revised_prompt,
      });

      this.logResponse(result);
      return result;
    } catch (error) {
      logger.error("DALL-E API error", {
        error: error instanceof Error ? error.message : String(error),
        model,
      });
      throw error;
    }
  }

  /**
   * Create variations of an existing image
   */
  async createVariations(
    imageUrl: string,
    count: number,
    options?: ImageOptions
  ): Promise<ImageResult[]> {
    const startTime = Date.now();

    // DALL-E variations only work with dall-e-2
    const model = "dall-e-2";
    const size = options?.size || "1024x1024";

    try {
      // First, download the image
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], "image.png", { type: "image/png" });

      const client = this.getClient();

      const response = await client.images.createVariation({
        image: imageFile,
        n: count,
        size: size as "256x256" | "512x512" | "1024x1024",
      });

      const dimensions = this.parseSize(size);

      return response.data.map((img) =>
        this.createResult({
          url: img.url!,
          model,
          width: dimensions.width,
          height: dimensions.height,
          latencyMs: Date.now() - startTime,
        })
      );
    } catch (error) {
      logger.error("DALL-E variations error", {
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
      await client.models.retrieve("dall-e-3");
      return true;
    } catch (error) {
      logger.warn("DALL-E availability check failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}

/**
 * Create DALL-E provider with default config
 */
export function createDalleProvider(apiKey?: string): OpenAIDalleProvider {
  return new OpenAIDalleProvider({
    type: "image",
    name: "openai-dalle",
    apiKey: apiKey || process.env.OPENAI_API_KEY || "",
    enabled: true,
    priority: 1,
  });
}
