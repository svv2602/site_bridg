/**
 * Image Providers Index
 *
 * Export all image provider implementations.
 */

export { BaseImageProvider, type BaseImageConfig } from "./base.js";
export { OpenAIDalleProvider, createDalleProvider, DALLE_MODELS, type DalleModel } from "./openai-dalle.js";
export { ReplicateProvider, createReplicateProvider, REPLICATE_MODELS, type ReplicateModel } from "./replicate.js";

import type { ImageProvider } from "../types.js";
import type { BaseImageConfig } from "./base.js";
import { OpenAIDalleProvider } from "./openai-dalle.js";
import { ReplicateProvider } from "./replicate.js";
import { getProviderConfig } from "../../config/providers.js";

/**
 * Create Image provider by name
 */
export function createImageProvider(name: string): ImageProvider {
  const config = getProviderConfig(name);

  if (!config || config.type !== "image") {
    throw new Error(`Unknown Image provider: ${name}`);
  }

  const baseConfig: BaseImageConfig = {
    ...config,
    maxRetries: 2,
    timeoutMs: 120000,
  };

  switch (name) {
    case "openai-dalle":
      return new OpenAIDalleProvider(baseConfig);
    case "replicate":
      return new ReplicateProvider(baseConfig);
    // TODO: Add more providers
    // case "stability":
    //   return new StabilityProvider(baseConfig);
    // case "leonardo":
    //   return new LeonardoProvider(baseConfig);
    default:
      throw new Error(`Image provider not implemented: ${name}`);
  }
}

/**
 * Get default Image provider
 */
export function getDefaultImageProvider(): ImageProvider {
  const providers = ["openai-dalle", "replicate", "stability", "leonardo"];

  for (const name of providers) {
    const config = getProviderConfig(name);
    if (config?.enabled && config.type === "image") {
      try {
        return createImageProvider(name);
      } catch {
        continue;
      }
    }
  }

  throw new Error("No Image providers available");
}

/**
 * List available Image provider names
 */
export function listImageProviders(): string[] {
  return ["openai-dalle", "replicate", "stability", "leonardo"]
    .filter((name) => {
      const config = getProviderConfig(name);
      return config?.enabled && config.type === "image";
    });
}
