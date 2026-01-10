/**
 * Base Image Provider
 *
 * Abstract base class for all image generation providers.
 */

import type {
  ImageProvider,
  ImageOptions,
  ImageResult,
  ImageSize,
  ImageQuality,
  ProviderConfig,
} from "../types.js";
import { calculateImageCost } from "../../config/pricing.js";
import { withRetry } from "../../utils/retry.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("ImageProvider");

export interface BaseImageConfig extends ProviderConfig {
  /** Retry configuration */
  maxRetries?: number;
  /** Request timeout in ms */
  timeoutMs?: number;
}

export abstract class BaseImageProvider implements ImageProvider {
  abstract readonly name: string;
  abstract readonly models: readonly string[];
  abstract readonly defaultModel: string;

  protected config: BaseImageConfig;
  protected apiKey: string;
  protected baseUrl?: string;

  constructor(config: BaseImageConfig) {
    this.config = config;
    this.apiKey = config.apiKey || "";
    this.baseUrl = config.baseUrl;
  }

  /**
   * Generate single image - MUST be implemented by subclass
   */
  abstract generateImage(
    prompt: string,
    options?: ImageOptions
  ): Promise<ImageResult>;

  /**
   * Generate multiple images
   */
  async generateImages(
    prompt: string,
    count: number,
    options?: ImageOptions
  ): Promise<ImageResult[]> {
    const results: ImageResult[] = [];

    for (let i = 0; i < count; i++) {
      const result = await this.generateImage(prompt, {
        ...options,
        seed: options?.seed ? options.seed + i : undefined,
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Create variations - optional, not all providers support this
   */
  async createVariations?(
    imageUrl: string,
    count: number,
    options?: ImageOptions
  ): Promise<ImageResult[]>;

  /**
   * Estimate cost for image generation
   */
  estimateCost(
    model?: string,
    size?: ImageSize,
    quality?: ImageQuality
  ): number {
    return calculateImageCost(this.name, model || this.defaultModel, 1);
  }

  /**
   * Check if provider is available
   */
  abstract isAvailable(): Promise<boolean>;

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
   * Create a standardized result object
   */
  protected createResult(params: {
    url: string;
    model: string;
    width: number;
    height: number;
    latencyMs: number;
    revisedPrompt?: string;
    base64?: string;
    localPath?: string;
  }): ImageResult {
    const cost = this.estimateCost(params.model);

    return {
      url: params.url,
      base64: params.base64,
      localPath: params.localPath,
      revisedPrompt: params.revisedPrompt,
      model: params.model,
      provider: this.name,
      size: { width: params.width, height: params.height },
      cost,
      latencyMs: params.latencyMs,
    };
  }

  /**
   * Parse size string to dimensions
   */
  protected parseSize(size: ImageSize): { width: number; height: number } {
    const [width, height] = size.split("x").map(Number);
    return { width, height };
  }

  /**
   * Log request for debugging
   */
  protected logRequest(model: string, prompt: string): void {
    logger.info(`${this.name} image request`, {
      model,
      promptLength: prompt.length,
    });
  }

  /**
   * Log response for debugging
   */
  protected logResponse(result: ImageResult): void {
    logger.info(`${this.name} image response`, {
      model: result.model,
      size: `${result.size.width}x${result.size.height}`,
      cost: result.cost.toFixed(4),
      latency: result.latencyMs,
    });
  }
}
