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
  // === LLM Providers ===
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || "",
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY || "",
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "", // e.g., http://localhost:11434

  // === Image Providers ===
  STABILITY_API_KEY: process.env.STABILITY_API_KEY || "",
  REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN || "",
  LEONARDO_API_KEY: process.env.LEONARDO_API_KEY || "",

  // === Embedding Providers ===
  VOYAGE_API_KEY: process.env.VOYAGE_API_KEY || "",
  COHERE_API_KEY: process.env.COHERE_API_KEY || "",

  // === Cost Limits (USD) ===
  COST_DAILY_LIMIT: process.env.COST_DAILY_LIMIT || "10",
  COST_MONTHLY_LIMIT: process.env.COST_MONTHLY_LIMIT || "100",
  COST_PER_REQUEST_LIMIT: process.env.COST_PER_REQUEST_LIMIT || "1",

  // === Payload CMS ===
  PAYLOAD_URL: process.env.PAYLOAD_URL || "http://localhost:3001",

  // === Legacy Strapi (deprecated) ===
  STRAPI_URL: process.env.STRAPI_URL || "http://localhost:1337",
  STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN || "",

  // === Telegram notifications ===
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || "",

  // === Scraping ===
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
