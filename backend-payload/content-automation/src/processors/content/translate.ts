/**
 * English → Ukrainian Translation Utility
 *
 * Translates LLM-generated content from English to Ukrainian
 * using the content-translation task routing (google/gemini-2.0-flash).
 *
 * Used by tire-description and article generators for two-stage
 * generation: generate in English (better quality/length) → translate.
 */

import { fallbackLlm } from "../../providers/fallback-llm.js";
import type { Brand } from "../../types/content.js";
import { BRAND_NAMES } from "../../types/content.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("Translator");

/** Brand transliteration map */
const BRAND_TRANSLITS: Record<Brand, string> = {
  bridgestone: "Бріджстоун",
  firestone: "Файрстоун",
};

/**
 * Translation options
 */
export interface TranslateOptions {
  /** Brand for transliteration (first mention rule) */
  brand?: Brand;
  /** Ukrainian SEO keywords to integrate naturally */
  keywords?: string[];
  /** Content type hint for style adaptation */
  contentType?: "tire-description" | "article";
}

/**
 * Build translation prompt for JSON content
 */
function buildTranslationPrompt(
  englishJson: string,
  options?: TranslateOptions
): string {
  const brand = options?.brand || "bridgestone";
  const brandName = BRAND_NAMES[brand];
  const brandTranslit = BRAND_TRANSLITS[brand];

  return `Translate the following JSON content from English to Ukrainian.

INPUT JSON:
${englishJson}

TRANSLATION RULES:
- Translate ALL text values in the JSON to Ukrainian
- Keep JSON structure, keys, and HTML tags EXACTLY as they are
- Keep brand names (${brandName}, model names like Turanza, Blizzak, Potenza etc.) in original Latin script
- At the FIRST mention of the brand in each text field, add Ukrainian transliteration in parentheses: "${brandName} (${brandTranslit})"
- Do NOT transliterate on subsequent mentions — only the first time per field
- Keep all <a href="..."> links unchanged (only translate link text)
- Keep all HTML tags (h2, h3, p, ul, li, strong, a) intact
- Use professional automotive journalism style
- Use Ukrainian automotive terminology correctly
- Do NOT add prices
- Do NOT invent facts not present in the original
${options?.keywords?.length ? `- Naturally integrate these Ukrainian SEO keywords: ${options.keywords.join(", ")}` : ""}

IMPORTANT:
- Return ONLY valid JSON (same structure as input)
- Every string value must be translated to Ukrainian
- Do NOT translate JSON keys
- Do NOT modify URLs or slugs`;
}

/**
 * Translate JSON content from English to Ukrainian
 */
export async function translateToUkrainian<T>(
  englishContent: T,
  options?: TranslateOptions
): Promise<{
  data: T;
  translationMeta: {
    provider: string;
    model: string;
    cost: number;
    latencyMs: number;
  };
}> {
  const englishJson = JSON.stringify(englishContent, null, 2);
  const prompt = buildTranslationPrompt(englishJson, options);

  const systemPrompt = `You are a professional English-to-Ukrainian translator specializing in automotive content for the ${BRAND_NAMES[options?.brand || "bridgestone"]} Ukraine website.

Rules:
- Translate to natural, professional Ukrainian
- Use correct automotive terminology in Ukrainian
- Preserve HTML markup exactly
- Preserve JSON structure exactly
- Brand/model names stay in Latin script with Ukrainian transliteration on first mention only`;

  logger.info("Translating content EN→UA", {
    contentType: options?.contentType || "unknown",
    brand: options?.brand || "bridgestone",
  });

  const translator = fallbackLlm.forTask("content-translation");

  const { data, response } = await translator.generateJSON<T>(prompt, {
    systemPrompt,
    maxTokens: 4000,
    temperature: 0.3,
  });

  logger.info("Translation complete", {
    provider: response.provider,
    model: response.model,
    cost: response.cost.toFixed(4),
    latencyMs: response.latencyMs,
  });

  return {
    data,
    translationMeta: {
      provider: response.provider,
      model: response.model,
      cost: response.cost,
      latencyMs: response.latencyMs,
    },
  };
}
