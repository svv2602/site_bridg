/**
 * POST /api/content-generation/generate
 *
 * Generates content for a tire model using AI.
 */

import { NextRequest, NextResponse } from "next/server";
import { validateAuth, isAdmin, unauthorizedResponse, forbiddenResponse } from "../auth";

// Import from content-automation module
// Note: These imports will work once the module is properly linked
let generateFullTyreContent: Function;
let scrapeModelContent: Function;

// Dynamic import for content-automation functions
async function getGenerators() {
  try {
    const contentModule = await import(
      "../../../../content-automation/src/processors/content/index.js"
    );
    generateFullTyreContent = contentModule.generateFullTyreContent;

    const scraperModule = await import(
      "../../../../content-automation/src/scrapers/tyre-content.js"
    );
    scrapeModelContent = scraperModule.scrapeTyreContent;
  } catch (error) {
    console.error("Failed to import content-automation:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  // Authenticate
  const auth = await validateAuth(request);
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }
  if (!isAdmin(auth)) {
    return forbiddenResponse("Admin access required");
  }

  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { modelSlug, scrape = true, regenerate = false } = body as {
      modelSlug?: string;
      scrape?: boolean;
      regenerate?: boolean;
    };

    if (!modelSlug) {
      return NextResponse.json(
        { success: false, error: "modelSlug is required" },
        { status: 400 }
      );
    }

    // Load generators
    await getGenerators();

    // Step 1: Scrape raw content if requested
    if (scrape) {
      console.log(`[generate] Scraping content for: ${modelSlug}`);
      try {
        await scrapeModelContent(modelSlug);
      } catch (scrapeError) {
        console.warn(`[generate] Scraping failed (may use cached):`, scrapeError);
        // Continue anyway - might have cached data
      }
    }

    // Step 2: Generate content
    console.log(`[generate] Generating content for: ${modelSlug}`);
    const result = await generateFullTyreContent(modelSlug, {
      skipCache: regenerate,
      regenerateDescription: regenerate,
      regenerateSEO: regenerate,
      regenerateFAQ: regenerate,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.errors.join("; "),
          modelSlug,
        },
        { status: 500 }
      );
    }

    // Generate unique ID for this generation
    const generationId = `gen_${Date.now()}_${modelSlug}`;

    return NextResponse.json({
      success: true,
      generationId,
      modelSlug,
      status: result.cached ? "cached" : "completed",
      cached: result.cached,
      costs: result.costs,
      preview: result.content
        ? {
            shortDescription: result.content.shortDescription,
            seoTitle: result.content.seoTitle,
            keyBenefitsCount: result.content.keyBenefits?.length || 0,
            faqsCount: result.content.faqs?.length || 0,
          }
        : null,
    });
  } catch (error) {
    console.error("[generate] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Content generation failed",
      },
      { status: 500 }
    );
  }
}
