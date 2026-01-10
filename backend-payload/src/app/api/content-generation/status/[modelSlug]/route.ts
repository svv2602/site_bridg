/**
 * GET /api/content-generation/status/:modelSlug
 *
 * Returns content generation status for a tire model.
 */

import { NextRequest, NextResponse } from "next/server";
import { getPayloadHMR } from "@payloadcms/next/utilities";
import configPromise from "@payload-config";
import { validateAuth, unauthorizedResponse } from "../../auth";

// Dynamic import for content-automation functions
async function getStorageModule() {
  try {
    const storageModule = await import(
      "../../../../../content-automation/src/utils/storage.js"
    );
    return storageModule;
  } catch (error) {
    console.error("Failed to import storage module:", error);
    throw error;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ modelSlug: string }> }
) {
  // Authenticate
  const auth = await validateAuth(request);
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const { modelSlug } = await params;

    if (!modelSlug) {
      return NextResponse.json(
        { success: false, error: "modelSlug is required" },
        { status: 400 }
      );
    }

    // Load storage module
    const storage = await getStorageModule();

    // Check for raw data
    const rawContent = await storage.loadFromStorage(`raw/${modelSlug}`);
    const hasRawData = Array.isArray(rawContent) && rawContent.length > 0;
    const rawDataDate = hasRawData && rawContent[0]?.scrapedAt
      ? rawContent[0].scrapedAt
      : null;

    // Check for generated content
    const generatedContent = await storage.loadFromStorage(`generated/${modelSlug}`);
    const hasGeneratedContent = !!generatedContent;
    const generatedDate = generatedContent?.metadata?.generatedAt || null;

    // Get current content from Payload
    const payload = await getPayloadHMR({ config: configPromise });

    const tyres = await payload.find({
      collection: "tyres",
      where: {
        slug: { equals: modelSlug },
      },
      limit: 1,
    });

    const currentTyre = tyres.docs[0] || null;

    // Determine if content is published
    const isPublished = currentTyre
      ? !!(
          currentTyre.shortDescription ||
          currentTyre.fullDescription ||
          (currentTyre.faqs as Array<unknown>)?.length
        )
      : false;

    // Build current content summary
    const currentContent = currentTyre
      ? {
          name: currentTyre.name,
          shortDescription: currentTyre.shortDescription
            ? (currentTyre.shortDescription as string).slice(0, 100) + "..."
            : null,
          hasFullDescription: !!currentTyre.fullDescription,
          seoTitle: currentTyre.seoTitle,
          seoDescription: currentTyre.seoDescription,
          keyBenefitsCount: (currentTyre.keyBenefits as Array<unknown>)?.length || 0,
          faqsCount: (currentTyre.faqs as Array<unknown>)?.length || 0,
        }
      : null;

    return NextResponse.json({
      success: true,
      modelSlug,
      tyreId: currentTyre?.id || null,
      tyreExists: !!currentTyre,
      hasRawData,
      hasGeneratedContent,
      isPublished,
      rawDataDate,
      generatedDate,
      currentContent,
      generatedPreview: hasGeneratedContent
        ? {
            shortDescription: generatedContent.shortDescription?.slice(0, 100) + "...",
            seoTitle: generatedContent.seoTitle,
            keyBenefitsCount: generatedContent.keyBenefits?.length || 0,
            faqsCount: generatedContent.faqs?.length || 0,
            costs: generatedContent.metadata?.cost || 0,
          }
        : null,
    });
  } catch (error) {
    console.error("[status] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Status check failed",
      },
      { status: 500 }
    );
  }
}
