/**
 * Storage Utilities for Content Automation
 *
 * Handles saving and loading of raw scraped content and generated content.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type {
  RawTyreContent,
  RawTyreContentCollection,
  GeneratedTyreContent,
  ContentStatus,
} from "../types/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Data directories
const DATA_DIR = join(__dirname, "../../data");
const RAW_DIR = join(DATA_DIR, "raw");
const GENERATED_DIR = join(DATA_DIR, "generated");

/**
 * Ensure directories exist
 */
function ensureDirectories(): void {
  for (const dir of [DATA_DIR, RAW_DIR, GENERATED_DIR]) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}

// === Raw Content Storage ===

/**
 * Generate filename for raw content
 */
function getRawContentFilename(modelSlug: string, source?: string): string {
  if (source) {
    return `${modelSlug}-${source}.json`;
  }
  return `${modelSlug}.json`;
}

/**
 * Save raw content to file
 */
export function saveRawContent(content: RawTyreContent): string {
  ensureDirectories();
  const filename = getRawContentFilename(content.modelSlug, content.source);
  const filepath = join(RAW_DIR, filename);
  writeFileSync(filepath, JSON.stringify(content, null, 2), "utf-8");
  return filepath;
}

/**
 * Save raw content collection to file
 */
export function saveRawContentCollection(collection: RawTyreContentCollection): string {
  ensureDirectories();
  const filename = `${collection.modelSlug}.json`;
  const filepath = join(RAW_DIR, filename);
  writeFileSync(filepath, JSON.stringify(collection, null, 2), "utf-8");
  return filepath;
}

/**
 * Load raw content from file
 */
export function loadRawContent(
  modelSlug: string,
  source?: string
): RawTyreContent | null {
  const filename = getRawContentFilename(modelSlug, source);
  const filepath = join(RAW_DIR, filename);

  if (!existsSync(filepath)) {
    return null;
  }

  try {
    const data = readFileSync(filepath, "utf-8");
    return JSON.parse(data) as RawTyreContent;
  } catch {
    return null;
  }
}

/**
 * Load raw content collection from file
 */
export function loadRawContentCollection(
  modelSlug: string
): RawTyreContentCollection | null {
  const filepath = join(RAW_DIR, `${modelSlug}.json`);

  if (!existsSync(filepath)) {
    return null;
  }

  try {
    const data = readFileSync(filepath, "utf-8");
    return JSON.parse(data) as RawTyreContentCollection;
  } catch {
    return null;
  }
}

/**
 * List all raw content files
 */
export function listRawContent(): string[] {
  ensureDirectories();
  return readdirSync(RAW_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

/**
 * Check if raw content exists
 */
export function hasRawContent(modelSlug: string): boolean {
  const filepath = join(RAW_DIR, `${modelSlug}.json`);
  return existsSync(filepath);
}

// === Generated Content Storage ===

/**
 * Save generated content to file
 */
export function saveGeneratedContent(content: GeneratedTyreContent): string {
  ensureDirectories();
  const filename = `${content.modelSlug}.json`;
  const filepath = join(GENERATED_DIR, filename);
  writeFileSync(filepath, JSON.stringify(content, null, 2), "utf-8");
  return filepath;
}

/**
 * Load generated content from file
 */
export function loadGeneratedContent(modelSlug: string): GeneratedTyreContent | null {
  const filepath = join(GENERATED_DIR, `${modelSlug}.json`);

  if (!existsSync(filepath)) {
    return null;
  }

  try {
    const data = readFileSync(filepath, "utf-8");
    return JSON.parse(data) as GeneratedTyreContent;
  } catch {
    return null;
  }
}

/**
 * List all generated content files
 */
export function listGeneratedContent(): string[] {
  ensureDirectories();
  return readdirSync(GENERATED_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

/**
 * Check if generated content exists
 */
export function hasGeneratedContent(modelSlug: string): boolean {
  const filepath = join(GENERATED_DIR, `${modelSlug}.json`);
  return existsSync(filepath);
}

// === Status ===

/**
 * Get content status for a model
 */
export function getContentStatus(modelSlug: string): ContentStatus {
  const rawFilepath = join(RAW_DIR, `${modelSlug}.json`);
  const generatedFilepath = join(GENERATED_DIR, `${modelSlug}.json`);

  const status: ContentStatus = {
    modelSlug,
    brand: "bridgestone", // Default, will be overwritten if found
    hasRawData: existsSync(rawFilepath),
    hasGeneratedContent: existsSync(generatedFilepath),
    isPublished: false, // TODO: Check Payload CMS
  };

  // Get dates and brand if files exist
  if (status.hasRawData) {
    try {
      const data = JSON.parse(readFileSync(rawFilepath, "utf-8"));
      status.rawDataDate = data.collectedAt || data.scrapedAt;
      if (data.brand) {
        status.brand = data.brand;
      }
    } catch {
      // Ignore
    }
  }

  if (status.hasGeneratedContent) {
    try {
      const data = JSON.parse(readFileSync(generatedFilepath, "utf-8"));
      status.generatedDate = data.metadata?.generatedAt;
      if (data.brand) {
        status.brand = data.brand;
      }
    } catch {
      // Ignore
    }
  }

  return status;
}

/**
 * Get status for all models
 */
export function getAllContentStatus(): ContentStatus[] {
  const rawModels = new Set(listRawContent());
  const generatedModels = new Set(listGeneratedContent());
  const allModels = new Set([...rawModels, ...generatedModels]);

  return Array.from(allModels).map((slug) => getContentStatus(slug));
}

// === Cleanup ===

/**
 * Delete raw content
 */
export function deleteRawContent(modelSlug: string): boolean {
  const filepath = join(RAW_DIR, `${modelSlug}.json`);
  if (existsSync(filepath)) {
    const { unlinkSync } = require("fs");
    unlinkSync(filepath);
    return true;
  }
  return false;
}

/**
 * Delete generated content
 */
export function deleteGeneratedContent(modelSlug: string): boolean {
  const filepath = join(GENERATED_DIR, `${modelSlug}.json`);
  if (existsSync(filepath)) {
    const { unlinkSync } = require("fs");
    unlinkSync(filepath);
    return true;
  }
  return false;
}

// Export directories for reference
export { DATA_DIR, RAW_DIR, GENERATED_DIR };

// === Generic Storage Functions ===

/**
 * Generic load from storage (async wrapper for compatibility)
 */
export async function loadFromStorage<T>(path: string): Promise<T | null> {
  const filepath = join(DATA_DIR, `${path}.json`);

  if (!existsSync(filepath)) {
    return null;
  }

  try {
    const data = readFileSync(filepath, "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/**
 * Generic save to storage (async wrapper for compatibility)
 */
export async function saveToStorage<T>(path: string, data: T): Promise<string> {
  ensureDirectories();
  const filepath = join(DATA_DIR, `${path}.json`);
  const dir = dirname(filepath);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
  return filepath;
}
