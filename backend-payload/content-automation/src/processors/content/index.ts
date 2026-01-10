/**
 * Content Generation Pipeline
 *
 * Main entry point for content generation.
 * Combines all generators into a unified API.
 */

// Re-export individual generators
export {
  generateTireDescription,
  generateTireDescriptionFromStorage,
  type TireDescriptionInput,
} from "./tire-description.js";

export {
  generateTireSEO,
  generateTireSEOFromContent,
  type TireSEOInput,
  type SEOOutput,
} from "./tire-seo.js";

export {
  generateTireFAQ,
  generateFAQSchema,
  type TireFAQInput,
  type FAQ,
  type FAQOutput,
} from "./tire-faq.js";

export {
  generateArticle,
  generateSeasonalArticle,
  type ArticleInput,
  type ArticleType,
} from "./article-generator.js";

export {
  generateArticleImage,
  generateHeroImage,
  generateContentImages,
  generateTireProductImage,
  generateArticleImageSet,
  type ImageType,
  type ArticleImageInput,
} from "./article-images.js";

import { generateTireDescription, type TireDescriptionInput } from "./tire-description.js";
import { generateTireSEO } from "./tire-seo.js";
import { generateTireFAQ, generateFAQSchema, type TireFAQInput, type FAQ } from "./tire-faq.js";
import { markdownToLexical } from "../../utils/markdown-to-lexical.js";
import { loadFromStorage, saveToStorage } from "../../utils/storage.js";
import type { RawTyreContent, GeneratedTyreContent } from "../../types/content.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("ContentPipeline");

/**
 * Options for full content generation
 */
export interface GenerationOptions {
  provider?: string;
  model?: string;
  regenerateDescription?: boolean;
  regenerateSEO?: boolean;
  regenerateFAQ?: boolean;
  skipCache?: boolean;
}

/**
 * Pipeline result
 */
export interface PipelineResult {
  success: boolean;
  content?: GeneratedTyreContent;
  cached: boolean;
  errors: string[];
  costs: {
    description: number;
    seo: number;
    faq: number;
    total: number;
  };
}

/**
 * Generate full tire content (description, SEO, FAQ)
 */
export async function generateFullTyreContent(
  modelSlug: string,
  options?: GenerationOptions
): Promise<PipelineResult> {
  const errors: string[] = [];
  const costs = { description: 0, seo: 0, faq: 0, total: 0 };

  logger.info(`Starting full content generation for: ${modelSlug}`);

  try {
    // Check for existing generated content
    if (!options?.skipCache) {
      const cached = await loadFromStorage<GeneratedTyreContent>(`generated/${modelSlug}`);
      if (cached) {
        const needsRegeneration =
          options?.regenerateDescription ||
          options?.regenerateSEO ||
          options?.regenerateFAQ;

        if (!needsRegeneration) {
          logger.info(`Using cached content for: ${modelSlug}`);
          return {
            success: true,
            content: cached,
            cached: true,
            errors: [],
            costs,
          };
        }
      }
    }

    // Load raw content
    const rawContent = await loadFromStorage<RawTyreContent[]>(`raw/${modelSlug}`);
    if (!rawContent || rawContent.length === 0) {
      throw new Error(`No raw content found for: ${modelSlug}`);
    }

    const firstSource = rawContent[0];

    // Build input from raw content
    const descriptionInput: TireDescriptionInput = {
      modelSlug,
      modelName: firstSource.modelName,
      season: firstSource.season || "summer",
      technologies: firstSource.technologies,
      euLabel: firstSource.euLabel
        ? {
            wetGrip: firstSource.euLabel.wetGrip,
            fuelEfficiency: firstSource.euLabel.fuelEfficiency,
            noiseDb: firstSource.euLabel.noiseLevel,
          }
        : undefined,
      rawContent,
    };

    // 1. Generate description
    logger.info(`Generating description for: ${modelSlug}`);
    const descResult = await generateTireDescription(descriptionInput, {
      provider: options?.provider,
      model: options?.model,
    });
    costs.description = descResult.metadata.cost;

    // 2. Generate SEO
    logger.info(`Generating SEO for: ${modelSlug}`);
    const seoResult = await generateTireSEO(
      {
        modelSlug,
        modelName: firstSource.modelName,
        season: firstSource.season || "summer",
        shortDescription: descResult.content.shortDescription,
        keyBenefits: descResult.content.highlights,
      },
      {
        provider: options?.provider,
        model: options?.model,
      }
    );
    costs.seo = seoResult.metadata.cost;

    // 3. Generate FAQ
    logger.info(`Generating FAQ for: ${modelSlug}`);
    const faqInput: TireFAQInput = {
      modelSlug,
      modelName: firstSource.modelName,
      season: firstSource.season || "summer",
      technologies: firstSource.technologies,
      euLabel: descriptionInput.euLabel,
    };

    const faqResult = await generateTireFAQ(faqInput, {
      provider: options?.provider,
      model: options?.model,
    });
    costs.faq = faqResult.metadata.cost;

    // 4. Convert to Lexical
    const fullDescriptionLexical = markdownToLexical(descResult.content.fullDescription);

    // 5. Build final content
    const content: GeneratedTyreContent = {
      modelSlug,
      shortDescription: descResult.content.shortDescription,
      fullDescription: descResult.content.fullDescription,
      fullDescriptionLexical,
      seoTitle: seoResult.seo.seoTitle,
      seoDescription: seoResult.seo.seoDescription,
      seoKeywords: seoResult.seo.seoKeywords,
      keyBenefits: descResult.content.highlights.map((benefit) => ({ benefit })),
      faqs: faqResult.faqs,
      metadata: {
        generatedAt: new Date().toISOString(),
        provider: descResult.metadata.provider,
        model: descResult.metadata.model,
        promptTokens:
          descResult.metadata.promptTokens +
          (seoResult.metadata as { promptTokens?: number }).promptTokens || 0,
        completionTokens:
          descResult.metadata.completionTokens +
          (seoResult.metadata as { completionTokens?: number }).completionTokens || 0,
        cost: costs.description + costs.seo + costs.faq,
        sources: rawContent.map((r) => r.sourceUrl),
      },
    };

    // 6. Save to storage
    await saveToStorage(`generated/${modelSlug}`, content);

    costs.total = costs.description + costs.seo + costs.faq;

    logger.info(`Content generation complete for: ${modelSlug}`, {
      costs,
    });

    return {
      success: true,
      content,
      cached: false,
      errors: [],
      costs,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Content generation failed for: ${modelSlug}`, { error: errorMessage });
    errors.push(errorMessage);

    return {
      success: false,
      cached: false,
      errors,
      costs,
    };
  }
}

/**
 * Generate content for multiple tires
 */
export async function generateBatchTyreContent(
  modelSlugs: string[],
  options?: GenerationOptions & { concurrency?: number }
): Promise<Map<string, PipelineResult>> {
  const results = new Map<string, PipelineResult>();
  const concurrency = options?.concurrency || 1;

  logger.info(`Starting batch content generation for ${modelSlugs.length} tires`, {
    concurrency,
  });

  // Process in batches
  for (let i = 0; i < modelSlugs.length; i += concurrency) {
    const batch = modelSlugs.slice(i, i + concurrency);

    const batchResults = await Promise.all(
      batch.map((slug) => generateFullTyreContent(slug, options))
    );

    batch.forEach((slug, index) => {
      results.set(slug, batchResults[index]);
    });

    // Small delay between batches
    if (i + concurrency < modelSlugs.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Summary
  const successful = [...results.values()].filter((r) => r.success).length;
  const totalCost = [...results.values()].reduce((sum, r) => sum + r.costs.total, 0);

  logger.info(`Batch generation complete`, {
    total: modelSlugs.length,
    successful,
    failed: modelSlugs.length - successful,
    totalCost: totalCost.toFixed(4),
  });

  return results;
}

/**
 * Get content generation status for a tire
 */
export async function getContentStatus(
  modelSlug: string
): Promise<{
  hasRawContent: boolean;
  hasGeneratedContent: boolean;
  generatedAt?: string;
  sources?: string[];
}> {
  const rawContent = await loadFromStorage<RawTyreContent[]>(`raw/${modelSlug}`);
  const generatedContent = await loadFromStorage<GeneratedTyreContent>(
    `generated/${modelSlug}`
  );

  return {
    hasRawContent: !!rawContent && rawContent.length > 0,
    hasGeneratedContent: !!generatedContent,
    generatedAt: generatedContent?.metadata.generatedAt,
    sources: generatedContent?.metadata.sources,
  };
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Content Generation Pipeline

Usage:
  npx tsx processors/content/index.ts <command> [options]

Commands:
  generate <slug>     Generate content for a single tire
  batch <slugs...>    Generate content for multiple tires
  status <slug>       Check content status

Examples:
  npx tsx processors/content/index.ts generate turanza-6
  npx tsx processors/content/index.ts batch turanza-6 blizzak-lm005
  npx tsx processors/content/index.ts status turanza-6
`);
    return;
  }

  const command = args[0];

  switch (command) {
    case "generate": {
      const slug = args[1];
      if (!slug) {
        console.error("Error: model slug required");
        return;
      }

      console.log(`\nGenerating content for: ${slug}\n`);
      const result = await generateFullTyreContent(slug);

      if (result.success) {
        console.log("✅ Generation successful!");
        console.log(`\nCached: ${result.cached}`);
        console.log(`Costs: $${result.costs.total.toFixed(4)}`);
        console.log(`  - Description: $${result.costs.description.toFixed(4)}`);
        console.log(`  - SEO: $${result.costs.seo.toFixed(4)}`);
        console.log(`  - FAQ: $${result.costs.faq.toFixed(4)}`);
      } else {
        console.error("❌ Generation failed:");
        result.errors.forEach((e) => console.error(`  - ${e}`));
      }
      break;
    }

    case "batch": {
      const slugs = args.slice(1);
      if (slugs.length === 0) {
        console.error("Error: at least one model slug required");
        return;
      }

      console.log(`\nGenerating content for ${slugs.length} tires...\n`);
      const results = await generateBatchTyreContent(slugs);

      console.log("\n=== Results ===");
      for (const [slug, result] of results) {
        const status = result.success ? "✅" : "❌";
        console.log(`${status} ${slug}: $${result.costs.total.toFixed(4)}`);
      }
      break;
    }

    case "status": {
      const slug = args[1];
      if (!slug) {
        console.error("Error: model slug required");
        return;
      }

      const status = await getContentStatus(slug);
      console.log(`\nContent status for: ${slug}`);
      console.log(`  Raw content: ${status.hasRawContent ? "✅" : "❌"}`);
      console.log(`  Generated: ${status.hasGeneratedContent ? "✅" : "❌"}`);
      if (status.generatedAt) {
        console.log(`  Generated at: ${status.generatedAt}`);
      }
      if (status.sources) {
        console.log(`  Sources: ${status.sources.length}`);
      }
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
  }
}

if (process.argv[1]?.includes("content/index.ts")) {
  main();
}
