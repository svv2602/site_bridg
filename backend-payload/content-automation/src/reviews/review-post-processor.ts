/**
 * 6-step post-processing pipeline for generated reviews.
 *
 * Steps:
 * 1. Remove Asian characters (safety net)
 * 2. Replace stop-words (downgrade marketing-speak)
 * 3. Remove banned patterns (formulaic phrases)
 * 4. Gender correction (feminine verb/adj forms)
 * 5. Winter keyword filter (for summer tyres only)
 * 6. Final cleanup (quotes, asterisks, whitespace, capitalize)
 */

import {
  STOP_WORDS_REPLACEMENTS,
  BANNED_PATTERNS,
  GENDER_CORRECTIONS_FEMALE,
  WINTER_KEYWORDS_FILTER,
} from "./review-dictionaries.js";

/**
 * Post-process a single review text through 6 filtering steps.
 *
 * @param text - raw LLM-generated review text
 * @param gender - persona gender ("male" | "female")
 * @param season - tyre season ("summer" | "winter" | "allseason")
 * @returns cleaned review text
 */
export function postProcessReview(
  text: string,
  gender: "male" | "female",
  season: string,
): string {
  let result = text;

  // Step 1: Remove Asian characters (CJK safety net)
  result = removeAsianCharacters(result);

  // Step 2: Replace stop-words (downgrade marketing-speak)
  result = replaceStopWords(result);

  // Step 3: Remove banned patterns (formulaic phrases)
  result = removeBannedPatterns(result);

  // Step 4: Gender correction (if female persona)
  if (gender === "female") {
    result = applyGenderCorrections(result);
  }

  // Step 5: Winter keyword filter (summer tyres only)
  if (season === "summer") {
    result = filterWinterKeywords(result);
  }

  // Step 6: Final cleanup
  result = finalCleanup(result);

  return result;
}

/**
 * Step 1: Remove CJK and other Asian characters that some LLMs insert.
 */
function removeAsianCharacters(text: string): string {
  // CJK Unified Ideographs, Hiragana, Katakana, CJK Symbols
  return text.replace(/[\u3000-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/g, "");
}

/**
 * Step 2: Downgrade marketing-speak to natural language.
 */
function replaceStopWords(text: string): string {
  let result = text;
  for (const [pattern, replacement] of STOP_WORDS_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Step 3: Remove formulaic openings and clichés.
 */
function removeBannedPatterns(text: string): string {
  let result = text;
  for (const pattern of BANNED_PATTERNS) {
    result = result.replace(pattern, "");
  }
  return result;
}

/**
 * Step 4: Apply feminine gender corrections to verbs and adjectives.
 */
function applyGenderCorrections(text: string): string {
  let result = text;
  for (const [pattern, replacement] of GENDER_CORRECTIONS_FEMALE) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Step 5: Remove sentences containing winter keywords from summer tyre reviews.
 */
function filterWinterKeywords(text: string): string {
  // Split into sentences
  const sentences = text.split(/(?<=[.!?])\s+/);

  const filtered = sentences.filter((sentence) => {
    return !WINTER_KEYWORDS_FILTER.some((pattern) => pattern.test(sentence));
  });

  // If all sentences were filtered, return the original minus the winter bits
  if (filtered.length === 0) {
    return text;
  }

  return filtered.join(" ");
}

/**
 * Step 6: Final cleanup — normalize quotes, remove asterisks, fix whitespace, capitalize.
 */
function finalCleanup(text: string): string {
  let result = text;

  // Remove asterisks (LLM formatting artifacts)
  result = result.replace(/\*+/g, "");

  // Normalize quotes to Ukrainian style
  result = result.replace(/[""]/g, '"');
  result = result.replace(/['']/g, "'");

  // Remove double/triple spaces
  result = result.replace(/ {2,}/g, " ");

  // Remove leading/trailing whitespace from each line
  result = result
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  // Capitalize first letter
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  // Ensure ends with punctuation
  if (result.length > 0 && !/[.!?]$/.test(result)) {
    result += ".";
  }

  return result.trim();
}
