/**
 * Content Validator
 *
 * Validates generated content for SEO requirements and quality.
 */

import { createLogger } from "./logger.js";

const logger = createLogger("ContentValidator");

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: ContentStats;
}

/**
 * Content statistics
 */
export interface ContentStats {
  charCount: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  headingCount: number;
  listCount: number;
  avgWordsPerSentence: number;
  readingTimeMinutes: number;
}

/**
 * Validation rules
 */
export interface ValidationRules {
  minChars?: number;
  maxChars?: number;
  minWords?: number;
  maxWords?: number;
  requireHeadings?: boolean;
  minHeadings?: number;
  requireLists?: boolean;
  checkUkrainian?: boolean;
  forbiddenWords?: string[];
  requiredKeywords?: string[];
}

/**
 * Default validation rules for different content types
 */
export const DEFAULT_RULES = {
  shortDescription: {
    minChars: 100,
    maxChars: 350,
    checkUkrainian: true,
    forbiddenWords: ["ціна", "грн", "купити за", "найкращий", "найдешевший"],
  },

  fullDescription: {
    minChars: 1000,
    maxChars: 8000,
    minWords: 300,
    maxWords: 1500,
    requireHeadings: true,
    minHeadings: 2,
    checkUkrainian: true,
    forbiddenWords: ["ціна", "грн", "купити за"],
  },

  seoTitle: {
    minChars: 30,
    maxChars: 70,
    checkUkrainian: true,
  },

  seoDescription: {
    minChars: 100,
    maxChars: 170,
    checkUkrainian: true,
  },

  article: {
    minWords: 500,
    maxWords: 2000,
    requireHeadings: true,
    minHeadings: 3,
    requireLists: true,
    checkUkrainian: true,
  },

  faq: {
    minChars: 50,
    maxChars: 500,
    checkUkrainian: true,
  },
};

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

/**
 * Count sentences in text
 */
function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
}

/**
 * Count paragraphs in text
 */
function countParagraphs(text: string): number {
  return text.split(/\n\n+/).filter((p) => p.trim().length > 0).length;
}

/**
 * Count headings in Markdown text
 */
function countHeadings(text: string): number {
  return (text.match(/^#{1,6}\s+/gm) || []).length;
}

/**
 * Count lists in Markdown text
 */
function countLists(text: string): number {
  const bulletLists = text.split(/(?:^|\n)[-*]\s+/).length - 1;
  const numberLists = text.split(/(?:^|\n)\d+\.\s+/).length - 1;
  return bulletLists > 0 || numberLists > 0 ? 1 : 0;
}

/**
 * Check if text is predominantly Ukrainian
 */
function isUkrainian(text: string): boolean {
  // Ukrainian Cyrillic letters: і, ї, є, ґ
  const ukrainianChars = /[іїєґІЇЄҐ]/g;
  const cyrillicChars = /[а-яА-ЯёЁ]/g;

  const ukMatches = text.match(ukrainianChars)?.length || 0;
  const cyrMatches = text.match(cyrillicChars)?.length || 0;

  // If there are cyrillic characters but no Ukrainian-specific ones, it might be Russian
  if (cyrMatches > 50 && ukMatches === 0) {
    return false;
  }

  // At least some Ukrainian-specific characters should be present in longer texts
  if (cyrMatches > 100 && ukMatches < 3) {
    return false;
  }

  return true;
}

/**
 * Calculate content statistics
 */
export function calculateStats(text: string): ContentStats {
  const charCount = text.length;
  const wordCount = countWords(text);
  const sentenceCount = countSentences(text);
  const paragraphCount = countParagraphs(text);
  const headingCount = countHeadings(text);
  const listCount = countLists(text);

  return {
    charCount,
    wordCount,
    sentenceCount,
    paragraphCount,
    headingCount,
    listCount,
    avgWordsPerSentence: sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0,
    readingTimeMinutes: Math.ceil(wordCount / 200),
  };
}

/**
 * Validate content against rules
 */
export function validateContent(
  content: string,
  rules: ValidationRules
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stats = calculateStats(content);

  // Character count validation
  if (rules.minChars && stats.charCount < rules.minChars) {
    errors.push(`Content too short: ${stats.charCount} chars (min ${rules.minChars})`);
  }
  if (rules.maxChars && stats.charCount > rules.maxChars) {
    errors.push(`Content too long: ${stats.charCount} chars (max ${rules.maxChars})`);
  }

  // Word count validation
  if (rules.minWords && stats.wordCount < rules.minWords) {
    errors.push(`Too few words: ${stats.wordCount} (min ${rules.minWords})`);
  }
  if (rules.maxWords && stats.wordCount > rules.maxWords) {
    warnings.push(`Too many words: ${stats.wordCount} (max ${rules.maxWords})`);
  }

  // Heading validation
  if (rules.requireHeadings && stats.headingCount === 0) {
    errors.push("Content must include headings");
  }
  if (rules.minHeadings && stats.headingCount < rules.minHeadings) {
    errors.push(`Need at least ${rules.minHeadings} headings, got ${stats.headingCount}`);
  }

  // List validation
  if (rules.requireLists && stats.listCount === 0) {
    warnings.push("Content should include at least one list");
  }

  // Ukrainian language check
  if (rules.checkUkrainian && !isUkrainian(content)) {
    errors.push("Content does not appear to be in Ukrainian");
  }

  // Forbidden words check
  if (rules.forbiddenWords) {
    const found = rules.forbiddenWords.filter((word) =>
      content.toLowerCase().includes(word.toLowerCase())
    );
    if (found.length > 0) {
      errors.push(`Forbidden words found: ${found.join(", ")}`);
    }
  }

  // Required keywords check
  if (rules.requiredKeywords) {
    const missing = rules.requiredKeywords.filter(
      (keyword) => !content.toLowerCase().includes(keyword.toLowerCase())
    );
    if (missing.length > 0) {
      warnings.push(`Missing keywords: ${missing.join(", ")}`);
    }
  }

  // Readability warnings
  if (stats.avgWordsPerSentence > 25) {
    warnings.push(`Long sentences: avg ${stats.avgWordsPerSentence} words (recommended < 25)`);
  }

  const valid = errors.length === 0;

  if (!valid) {
    logger.warn("Content validation failed", { errors, warnings });
  }

  return {
    valid,
    errors,
    warnings,
    stats,
  };
}

/**
 * Validate tire description content
 */
export function validateTireDescription(content: {
  shortDescription: string;
  fullDescription: string;
}): { valid: boolean; errors: string[] } {
  const allErrors: string[] = [];

  const shortResult = validateContent(content.shortDescription, DEFAULT_RULES.shortDescription);
  if (!shortResult.valid) {
    allErrors.push(...shortResult.errors.map((e) => `shortDescription: ${e}`));
  }

  const fullResult = validateContent(content.fullDescription, DEFAULT_RULES.fullDescription);
  if (!fullResult.valid) {
    allErrors.push(...fullResult.errors.map((e) => `fullDescription: ${e}`));
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Validate SEO metadata
 */
export function validateSEO(seo: {
  seoTitle: string;
  seoDescription: string;
}): { valid: boolean; errors: string[] } {
  const allErrors: string[] = [];

  const titleResult = validateContent(seo.seoTitle, DEFAULT_RULES.seoTitle);
  if (!titleResult.valid) {
    allErrors.push(...titleResult.errors.map((e) => `seoTitle: ${e}`));
  }

  const descResult = validateContent(seo.seoDescription, DEFAULT_RULES.seoDescription);
  if (!descResult.valid) {
    allErrors.push(...descResult.errors.map((e) => `seoDescription: ${e}`));
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Validate article content
 */
export function validateArticle(article: {
  title: string;
  content: string;
  excerpt: string;
}): { valid: boolean; errors: string[]; warnings: string[] } {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Title validation
  if (!article.title || article.title.length < 20) {
    allErrors.push("Title too short (min 20 chars)");
  }
  if (article.title && article.title.length > 100) {
    allWarnings.push("Title too long (max 100 chars recommended)");
  }

  // Excerpt validation
  const excerptResult = validateContent(article.excerpt, DEFAULT_RULES.seoDescription);
  if (!excerptResult.valid) {
    allErrors.push(...excerptResult.errors.map((e) => `excerpt: ${e}`));
  }

  // Content validation
  const contentResult = validateContent(article.content, DEFAULT_RULES.article);
  allErrors.push(...contentResult.errors);
  allWarnings.push(...contentResult.warnings);

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// CLI test
if (process.argv[1]?.includes("content-validator.ts")) {
  const testContent = `## Bridgestone Turanza 6: огляд

Це преміальна літня шина для легкових автомобілів та кросоверів.

### Переваги

- Відмінне зчеплення на мокрій дорозі
- Низький рівень шуму
- Висока паливна ефективність

### Технології

Шина використовує технологію ENLITEN для зниження ваги та покращення ефективності.

Рекомендуємо для міського та приміського водіння.
`;

  console.log("=== CONTENT VALIDATION TEST ===");
  const result = validateContent(testContent, DEFAULT_RULES.fullDescription);

  console.log("\nStats:");
  console.log(JSON.stringify(result.stats, null, 2));

  console.log("\nValid:", result.valid);
  console.log("Errors:", result.errors);
  console.log("Warnings:", result.warnings);
}
