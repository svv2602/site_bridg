/**
 * Storage Helper for Content Generation API
 *
 * Simplified storage access for Next.js API routes.
 * Works with the same data directory as content-automation.
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

// Data directory (relative to backend-payload root)
const DATA_DIR = join(process.cwd(), "content-automation/data");
const RAW_DIR = join(DATA_DIR, "raw");
const GENERATED_DIR = join(DATA_DIR, "generated");

/**
 * Load raw content collection from file
 */
export function loadRawContentCollection(modelSlug: string): unknown | null {
  const filepath = join(RAW_DIR, `${modelSlug}.json`);

  if (!existsSync(filepath)) {
    return null;
  }

  try {
    const data = readFileSync(filepath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Load generated content from file
 */
export function loadGeneratedContent(modelSlug: string): unknown | null {
  const filepath = join(GENERATED_DIR, `${modelSlug}.json`);

  if (!existsSync(filepath)) {
    return null;
  }

  try {
    const data = readFileSync(filepath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Check if raw content exists
 */
export function hasRawContent(modelSlug: string): boolean {
  const filepath = join(RAW_DIR, `${modelSlug}.json`);
  return existsSync(filepath);
}

/**
 * Check if generated content exists
 */
export function hasGeneratedContent(modelSlug: string): boolean {
  const filepath = join(GENERATED_DIR, `${modelSlug}.json`);
  return existsSync(filepath);
}

/**
 * List all raw content files
 */
export function listRawContent(): string[] {
  if (!existsSync(RAW_DIR)) {
    return [];
  }
  return readdirSync(RAW_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

/**
 * List all generated content files
 */
export function listGeneratedContent(): string[] {
  if (!existsSync(GENERATED_DIR)) {
    return [];
  }
  return readdirSync(GENERATED_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

export { DATA_DIR, RAW_DIR, GENERATED_DIR };
