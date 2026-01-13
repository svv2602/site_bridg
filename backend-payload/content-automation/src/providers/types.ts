/**
 * Provider Types and Interfaces
 *
 * Core type definitions for the multi-provider architecture.
 */

// === LLM Types ===

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  systemPrompt?: string;
  /** Response format - some providers support JSON mode */
  responseFormat?: "text" | "json";
  /** Timeout in milliseconds */
  timeoutMs?: number;
}

export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  usage: LLMUsage;
  cost: number;
  latencyMs: number;
  finishReason: "stop" | "length" | "tool_use" | "content_filter" | "error";
  /** Raw response from provider for debugging */
  raw?: unknown;
}

export interface LLMStreamChunk {
  content: string;
  isComplete: boolean;
  finishReason?: LLMResponse["finishReason"];
}

export interface LLMProvider {
  /** Provider name (e.g., "anthropic", "openai") */
  readonly name: string;
  /** Available models */
  readonly models: readonly string[];
  /** Default model to use */
  readonly defaultModel: string;

  /** Generate text from a prompt */
  generateText(prompt: string, options?: LLMOptions): Promise<LLMResponse>;

  /** Generate text from chat messages */
  generateChat(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;

  /** Generate and parse JSON response */
  generateJSON<T = unknown>(
    prompt: string,
    options?: LLMOptions & { schema?: object }
  ): Promise<{ data: T; response: LLMResponse }>;

  /** Stream text generation */
  generateStream(
    prompt: string,
    options?: LLMOptions
  ): AsyncIterable<LLMStreamChunk>;

  /** Estimate cost for given token counts */
  estimateCost(promptTokens: number, completionTokens: number, model?: string): number;

  /** Check if provider is available (API key set, service reachable) */
  isAvailable(): Promise<boolean>;

  /** Count tokens in text (approximate) */
  countTokens(text: string): number;
}

// === Image Types ===

export type ImageSize =
  | "256x256"
  | "512x512"
  | "1024x1024"
  | "1792x1024"
  | "1024x1792"
  | "1536x1024"
  | "1024x1536";

export type ImageQuality = "standard" | "hd" | "ultra";
export type ImageStyle = "natural" | "vivid" | "cinematic" | "anime" | "3d";

export interface ImageOptions {
  model?: string;
  size?: ImageSize;
  quality?: ImageQuality;
  style?: ImageStyle;
  /** Negative prompt for exclusions */
  negativePrompt?: string;
  /** Seed for reproducibility */
  seed?: number;
  /** Number of images to generate */
  count?: number;
  /** Timeout in milliseconds */
  timeoutMs?: number;
}

export interface ImageResult {
  /** URL to the generated image */
  url: string;
  /** Base64 encoded image data */
  base64?: string;
  /** Local file path if downloaded */
  localPath?: string;
  /** Revised prompt (if provider modified it) */
  revisedPrompt?: string;
  /** Model used */
  model: string;
  /** Provider name */
  provider: string;
  /** Image dimensions */
  size: { width: number; height: number };
  /** Cost of generation */
  cost: number;
  /** Generation time in milliseconds */
  latencyMs: number;
}

export interface ImageProvider {
  /** Provider name */
  readonly name: string;
  /** Available models */
  readonly models: readonly string[];
  /** Default model */
  readonly defaultModel: string;

  /** Generate image from prompt */
  generateImage(prompt: string, options?: ImageOptions): Promise<ImageResult>;

  /** Generate multiple images */
  generateImages(
    prompt: string,
    count: number,
    options?: ImageOptions
  ): Promise<ImageResult[]>;

  /** Create variations of an existing image */
  createVariations?(
    imageUrl: string,
    count: number,
    options?: ImageOptions
  ): Promise<ImageResult[]>;

  /** Estimate cost for image generation */
  estimateCost(model?: string, size?: ImageSize, quality?: ImageQuality): number;

  /** Check if provider is available */
  isAvailable(): Promise<boolean>;
}

// === Embedding Types ===

export interface EmbeddingOptions {
  model?: string;
  /** Target dimensions (if model supports) */
  dimensions?: number;
  /** Timeout in milliseconds */
  timeoutMs?: number;
}

export interface EmbeddingResult {
  /** The embedding vector */
  embedding: number[];
  /** Model used */
  model: string;
  /** Provider name */
  provider: string;
  /** Vector dimensions */
  dimensions: number;
  /** Token usage */
  usage: { totalTokens: number };
  /** Cost of embedding */
  cost: number;
  /** Processing time */
  latencyMs: number;
}

export interface EmbeddingProvider {
  /** Provider name */
  readonly name: string;
  /** Available models */
  readonly models: readonly string[];
  /** Default model */
  readonly defaultModel: string;
  /** Default dimensions */
  readonly defaultDimensions: number;

  /** Embed single text */
  embed(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult>;

  /** Embed multiple texts in batch */
  embedBatch(
    texts: string[],
    options?: EmbeddingOptions
  ): Promise<EmbeddingResult[]>;

  /** Calculate similarity between two embeddings */
  similarity(embedding1: number[], embedding2: number[]): number;

  /** Estimate cost for embedding */
  estimateCost(tokens: number, model?: string): number;

  /** Check if provider is available */
  isAvailable(): Promise<boolean>;
}

// === Provider Registry Types ===

export type ProviderType = "llm" | "image" | "embedding";

export interface ProviderConfig {
  /** Provider type */
  type: ProviderType;
  /** Provider name (unique identifier) */
  name: string;
  /** API key (from environment) */
  apiKey?: string;
  /** Base URL override */
  baseUrl?: string;
  /** Default model for this provider */
  defaultModel?: string;
  /** Whether provider is enabled */
  enabled: boolean;
  /** Priority for fallback (lower = higher priority) */
  priority: number;
  /** Additional provider-specific options */
  options?: Record<string, unknown>;
}

export interface ProviderHealth {
  name: string;
  type: ProviderType;
  available: boolean;
  latencyMs?: number;
  lastChecked: Date;
  error?: string;
}

// === Task Routing Types ===

export type TaskType =
  // LLM tasks
  | "content-generation" // SEO texts, descriptions
  | "content-rewrite" // Rewriting existing content
  | "content-translation" // Translation
  | "quick-task" // Fast simple tasks
  | "analysis" // Data analysis
  | "reasoning" // Complex reasoning (use o1, R1)
  | "code-generation" // Code writing
  // Image tasks
  | "image-article" // Images for articles
  | "image-product" // Product images
  | "image-lifestyle" // Lifestyle photos
  | "image-banner" // Marketing banners
  // Embedding tasks
  | "embedding-search" // Search embeddings
  | "embedding-similarity"; // Text similarity

export interface TaskRouting {
  /** Task type */
  task: TaskType;
  /** Preferred provider name */
  preferredProvider: string;
  /** Preferred model */
  preferredModel: string;
  /** Fallback models in order (same provider, tried before switching providers) */
  fallbackModels?: string[];
  /** Fallback providers in order */
  fallbackProviders: string[];
  /** Max retries before trying fallback */
  maxRetries: number;
  /** Timeout per attempt in milliseconds */
  timeoutMs: number;
  /** Maximum cost allowed (USD) */
  maxCost?: number;
}

// === Cost Tracking Types ===

export interface CostEntry {
  timestamp: Date;
  provider: string;
  model: string;
  taskType: TaskType;
  inputTokens?: number;
  outputTokens?: number;
  cost: number;
  latencyMs: number;
  success: boolean;
  error?: string;
}

export interface CostSummary {
  period: "day" | "week" | "month";
  startDate: Date;
  endDate: Date;
  totalCost: number;
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
  byTaskType: Record<TaskType, number>;
  requestCount: number;
  successRate: number;
  avgLatencyMs: number;
}

export interface CostLimits {
  dailyLimit: number;
  monthlyLimit: number;
  perRequestLimit: number;
  warningThreshold: number; // 0-1, e.g., 0.8 = warn at 80%
}

// === Model Pricing Types ===

export interface ModelPricing {
  /** Provider name */
  provider: string;
  /** Model identifier */
  model: string;
  /** Cost per 1M input tokens (USD) */
  inputPer1M: number;
  /** Cost per 1M output tokens (USD) */
  outputPer1M: number;
  /** For image models: cost per image */
  perImage?: number;
  /** Context window size */
  contextWindow?: number;
  /** Max output tokens */
  maxOutput?: number;
  /** Last updated */
  updatedAt: Date;
}

// === Provider Factory Types ===

export interface ProviderFactory {
  /** Create LLM provider instance */
  createLLM(name: string): LLMProvider;
  /** Create image provider instance */
  createImage(name: string): ImageProvider;
  /** Create embedding provider instance */
  createEmbedding(name: string): EmbeddingProvider;
  /** Get default provider for type */
  getDefault(type: ProviderType): LLMProvider | ImageProvider | EmbeddingProvider;
  /** List available providers */
  listProviders(type: ProviderType): string[];
  /** Check all providers health */
  healthCheck(): Promise<ProviderHealth[]>;
}

// === Helper Types ===

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface AsyncResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  latencyMs: number;
}
