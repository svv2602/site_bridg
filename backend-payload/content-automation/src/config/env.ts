/**
 * Environment configuration for Content Automation
 */

import { config } from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from content-automation directory
config({ path: join(__dirname, "../../.env") });

export const ENV = {
  // LLM
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",

  // Payload CMS (replaces Strapi)
  PAYLOAD_URL: process.env.PAYLOAD_URL || "http://localhost:3001",

  // Legacy Strapi (deprecated, keep for backward compatibility)
  STRAPI_URL: process.env.STRAPI_URL || "http://localhost:1337",
  STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN || "",

  // Telegram notifications
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || "",

  // Scraping
  SCRAPE_DELAY_MS: parseInt(process.env.SCRAPE_DELAY_MS || "2000", 10),
} as const;

// Validation
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = ["ANTHROPIC_API_KEY"];
  const missing = required.filter((key) => !ENV[key as keyof typeof ENV]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

// Check env on import
const { valid, missing } = validateEnv();
if (!valid) {
  console.warn(`Warning: Missing environment variables: ${missing.join(", ")}`);
  console.warn("Some features may not work. Create a .env file in backend/content-automation/");
}
