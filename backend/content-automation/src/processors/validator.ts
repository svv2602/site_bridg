/**
 * Content Validator
 *
 * Validates generated content before publishing to ensure quality standards.
 * Checks for: required fields, length constraints, language, SEO requirements.
 */

import crypto from "crypto";

// Types
export interface ValidationResult {
  valid: boolean;
  errors: string[];    // Critical - block publish
  warnings: string[];  // Non-critical - notify only
  contentHash?: string;
}

export interface TireContentForValidation {
  shortDescription?: string;
  fullDescription?: string;
  keyBenefits?: string[];
  seoTitle?: string;
  seoDescription?: string;
  [key: string]: unknown;
}

export interface ArticleContentForValidation {
  title?: string;
  body?: string;
  previewText?: string;
  seoTitle?: string;
  seoDescription?: string;
  [key: string]: unknown;
}

export interface FAQForValidation {
  question?: string;
  answer?: string;
}

// Validation constraints
const TIRE_CONSTRAINTS = {
  shortDescription: { min: 80, max: 350, required: true },
  fullDescription: { min: 400, max: 2500, required: true },
  keyBenefits: { minItems: 2, maxItems: 6, required: true },
  seoTitle: { min: 20, max: 70, required: true },
  seoDescription: { min: 80, max: 180, required: true },
};

const ARTICLE_CONSTRAINTS = {
  title: { min: 20, max: 100, required: true },
  body: { min: 500, max: 5000, required: true },
  previewText: { min: 50, max: 300, required: true },
  seoTitle: { min: 20, max: 70, required: false },
  seoDescription: { min: 80, max: 180, required: false },
};

const FAQ_CONSTRAINTS = {
  question: { min: 15, max: 150, required: true },
  answer: { min: 50, max: 500, required: true },
};

// Minimum Ukrainian character ratio (Cyrillic)
const MIN_UKRAINIAN_RATIO = 0.6;

/**
 * Check if text is primarily in Ukrainian (Cyrillic)
 */
function isUkrainian(text: string): boolean {
  if (!text || text.length === 0) return false;

  // Count Cyrillic characters
  const cyrillicMatches = text.match(/[\u0400-\u04FF]/g) || [];
  const letterMatches = text.match(/[a-zA-Z\u0400-\u04FF]/g) || [];

  if (letterMatches.length === 0) return true; // No letters, consider valid

  const ratio = cyrillicMatches.length / letterMatches.length;
  return ratio >= MIN_UKRAINIAN_RATIO;
}

/**
 * Validate text length
 */
function validateLength(
  text: string | undefined,
  fieldName: string,
  constraints: { min: number; max: number; required: boolean }
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!text || text.trim().length === 0) {
    if (constraints.required) {
      errors.push(`${fieldName}: поле обов'язкове`);
    }
    return { errors, warnings };
  }

  const length = text.trim().length;

  if (length < constraints.min) {
    const message = `${fieldName}: занадто короткий (${length}/${constraints.min} символів)`;
    if (constraints.required) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  if (length > constraints.max) {
    warnings.push(`${fieldName}: занадто довгий (${length}/${constraints.max} символів)`);
  }

  return { errors, warnings };
}

/**
 * Validate array length
 */
function validateArrayLength(
  arr: unknown[] | undefined,
  fieldName: string,
  constraints: { minItems: number; maxItems: number; required: boolean }
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!arr || arr.length === 0) {
    if (constraints.required) {
      errors.push(`${fieldName}: масив обов'язковий`);
    }
    return { errors, warnings };
  }

  if (arr.length < constraints.minItems) {
    errors.push(`${fieldName}: потрібно мінімум ${constraints.minItems} елементів (є ${arr.length})`);
  }

  if (arr.length > constraints.maxItems) {
    warnings.push(`${fieldName}: забагато елементів (${arr.length}/${constraints.maxItems})`);
  }

  return { errors, warnings };
}

/**
 * Generate content hash for deduplication
 */
export function generateContentHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

/**
 * Validate tire content
 */
export function validateTireContent(content: TireContentForValidation): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate shortDescription
  const shortDesc = validateLength(
    content.shortDescription,
    "shortDescription",
    TIRE_CONSTRAINTS.shortDescription
  );
  errors.push(...shortDesc.errors);
  warnings.push(...shortDesc.warnings);

  // Validate fullDescription
  const fullDesc = validateLength(
    content.fullDescription,
    "fullDescription",
    TIRE_CONSTRAINTS.fullDescription
  );
  errors.push(...fullDesc.errors);
  warnings.push(...fullDesc.warnings);

  // Validate keyBenefits
  const benefits = validateArrayLength(
    content.keyBenefits,
    "keyBenefits",
    TIRE_CONSTRAINTS.keyBenefits
  );
  errors.push(...benefits.errors);
  warnings.push(...benefits.warnings);

  // Validate SEO title
  const seoTitle = validateLength(
    content.seoTitle,
    "seoTitle",
    TIRE_CONSTRAINTS.seoTitle
  );
  errors.push(...seoTitle.errors);
  warnings.push(...seoTitle.warnings);

  // Validate SEO description
  const seoDesc = validateLength(
    content.seoDescription,
    "seoDescription",
    TIRE_CONSTRAINTS.seoDescription
  );
  errors.push(...seoDesc.errors);
  warnings.push(...seoDesc.warnings);

  // Validate Ukrainian language
  const textsToCheck = [
    content.shortDescription,
    content.fullDescription,
    ...(content.keyBenefits || []),
  ].filter(Boolean) as string[];

  for (const text of textsToCheck) {
    if (!isUkrainian(text)) {
      warnings.push("Виявлено текст не українською мовою");
      break;
    }
  }

  // Generate content hash
  const contentForHash = JSON.stringify({
    short: content.shortDescription,
    full: content.fullDescription,
    benefits: content.keyBenefits,
  });
  const contentHash = generateContentHash(contentForHash);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    contentHash,
  };
}

/**
 * Validate article content
 */
export function validateArticleContent(content: ArticleContentForValidation): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate title
  const title = validateLength(
    content.title,
    "title",
    ARTICLE_CONSTRAINTS.title
  );
  errors.push(...title.errors);
  warnings.push(...title.warnings);

  // Validate body
  const body = validateLength(
    content.body,
    "body",
    ARTICLE_CONSTRAINTS.body
  );
  errors.push(...body.errors);
  warnings.push(...body.warnings);

  // Validate previewText
  const preview = validateLength(
    content.previewText,
    "previewText",
    ARTICLE_CONSTRAINTS.previewText
  );
  errors.push(...preview.errors);
  warnings.push(...preview.warnings);

  // Validate SEO (optional)
  if (content.seoTitle) {
    const seoTitle = validateLength(
      content.seoTitle,
      "seoTitle",
      ARTICLE_CONSTRAINTS.seoTitle
    );
    warnings.push(...seoTitle.warnings);
  }

  if (content.seoDescription) {
    const seoDesc = validateLength(
      content.seoDescription,
      "seoDescription",
      ARTICLE_CONSTRAINTS.seoDescription
    );
    warnings.push(...seoDesc.warnings);
  }

  // Validate Ukrainian language
  if (content.body && !isUkrainian(content.body)) {
    warnings.push("Тіло статті може бути не українською мовою");
  }

  // Generate content hash
  const contentForHash = JSON.stringify({
    title: content.title,
    body: content.body,
  });
  const contentHash = generateContentHash(contentForHash);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    contentHash,
  };
}

/**
 * Validate FAQ item
 */
export function validateFAQ(faq: FAQForValidation): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const question = validateLength(
    faq.question,
    "question",
    FAQ_CONSTRAINTS.question
  );
  errors.push(...question.errors);
  warnings.push(...question.warnings);

  const answer = validateLength(
    faq.answer,
    "answer",
    FAQ_CONSTRAINTS.answer
  );
  errors.push(...answer.errors);
  warnings.push(...answer.warnings);

  // Check for question mark
  if (faq.question && !faq.question.trim().endsWith("?")) {
    warnings.push("Питання повинно закінчуватися знаком питання");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate multiple FAQ items
 */
export function validateFAQs(faqs: FAQForValidation[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  if (!faqs || faqs.length === 0) {
    return {
      valid: false,
      errors: ["FAQ масив порожній"],
      warnings: [],
    };
  }

  faqs.forEach((faq, index) => {
    const result = validateFAQ(faq);
    allErrors.push(...result.errors.map((e) => `FAQ #${index + 1}: ${e}`));
    allWarnings.push(...result.warnings.map((w) => `FAQ #${index + 1}: ${w}`));
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Format validation result for logging
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push(`Valid: ${result.valid ? "✅" : "❌"}`);

  if (result.errors.length > 0) {
    lines.push("\nErrors:");
    result.errors.forEach((e) => lines.push(`  ❌ ${e}`));
  }

  if (result.warnings.length > 0) {
    lines.push("\nWarnings:");
    result.warnings.forEach((w) => lines.push(`  ⚠️ ${w}`));
  }

  if (result.contentHash) {
    lines.push(`\nContent Hash: ${result.contentHash}`);
  }

  return lines.join("\n");
}

// Test
async function main() {
  console.log("Testing Content Validator...\n");

  // Test tire content
  const tireContent: TireContentForValidation = {
    shortDescription:
      "Bridgestone Turanza 6 - преміальна літня шина для легкових автомобілів та SUV. Забезпечує відмінне зчеплення на мокрій дорозі та низький рівень шуму завдяки технології B-Silent.",
    fullDescription:
      "Bridgestone Turanza 6 представляє нове покоління преміальних літніх шин. Розроблена з використанням інноваційної технології ENLITEN, ця шина забезпечує оптимальний баланс між продуктивністю та екологічністю. Технологія B-Silent значно знижує рівень шуму в салоні, створюючи комфортну атмосферу для водія та пасажирів. Унікальний малюнок протектора забезпечує ефективне відведення води та чудове зчеплення на мокрій дорозі. Turanza 6 отримала найвищу оцінку A за зчеплення на мокрій поверхні згідно з EU-маркуванням.",
    keyBenefits: [
      "Відмінне зчеплення на мокрій дорозі (EU Label: A)",
      "Низький рівень шуму завдяки B-Silent",
      "Технологія ENLITEN для паливної ефективності",
    ],
    seoTitle: "Bridgestone Turanza 6 - Преміальні літні шини | Купити в Україні",
    seoDescription:
      "Bridgestone Turanza 6 - літні шини преміум-класу з відмінним зчепленням на мокрій дорозі та низьким рівнем шуму. Купити з доставкою по Україні.",
  };

  console.log("Validating tire content...");
  const tireResult = validateTireContent(tireContent);
  console.log(formatValidationResult(tireResult));

  // Test invalid content
  console.log("\n\nValidating invalid tire content...");
  const invalidTire: TireContentForValidation = {
    shortDescription: "Short",
    fullDescription: "",
    keyBenefits: ["One"],
    seoTitle: "Too short",
  };
  const invalidResult = validateTireContent(invalidTire);
  console.log(formatValidationResult(invalidResult));

  // Test FAQ
  console.log("\n\nValidating FAQ...");
  const faqs: FAQForValidation[] = [
    {
      question: "Для яких автомобілів підходить Bridgestone Turanza 6?",
      answer:
        "Bridgestone Turanza 6 підходить для широкого спектру легкових автомобілів та SUV. Вона особливо рекомендована для автомобілів преміум-класу та тих водіїв, які цінують комфорт та безпеку.",
    },
    {
      question: "Чи можна використовувати ці шини взимку",
      answer: "Ні, Turanza 6 - це літні шини.",
    },
  ];
  const faqResult = validateFAQs(faqs);
  console.log(formatValidationResult(faqResult));
}

main();
