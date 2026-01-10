/**
 * GET /api/content-generation/preview/:modelSlug
 *
 * Returns preview of generated content with comparison to current content.
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

    // Load generated content
    const generatedContent = await storage.loadFromStorage(`generated/${modelSlug}`);

    if (!generatedContent) {
      return NextResponse.json(
        {
          success: false,
          error: "No generated content found",
          modelSlug,
        },
        { status: 404 }
      );
    }

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

    // Build comparison
    const current = currentTyre
      ? {
          shortDescription: currentTyre.shortDescription || "",
          fullDescription:
            typeof currentTyre.fullDescription === "object"
              ? "[Lexical content]"
              : currentTyre.fullDescription || "",
          seoTitle: currentTyre.seoTitle || "",
          seoDescription: currentTyre.seoDescription || "",
          keyBenefitsCount: (currentTyre.keyBenefits as Array<unknown>)?.length || 0,
          faqsCount: (currentTyre.faqs as Array<unknown>)?.length || 0,
        }
      : null;

    // Determine what changed
    const diff = {
      hasChanges: true,
      fields: [] as string[],
    };

    if (current) {
      if (current.shortDescription !== generatedContent.shortDescription) {
        diff.fields.push("shortDescription");
      }
      if (generatedContent.fullDescription) {
        diff.fields.push("fullDescription");
      }
      if (current.seoTitle !== generatedContent.seoTitle) {
        diff.fields.push("seoTitle");
      }
      if (current.seoDescription !== generatedContent.seoDescription) {
        diff.fields.push("seoDescription");
      }
      if (
        current.keyBenefitsCount !== (generatedContent.keyBenefits?.length || 0)
      ) {
        diff.fields.push("keyBenefits");
      }
      if (current.faqsCount !== (generatedContent.faqs?.length || 0)) {
        diff.fields.push("faqs");
      }

      diff.hasChanges = diff.fields.length > 0;
    }

    return NextResponse.json({
      success: true,
      modelSlug,
      generated: {
        shortDescription: generatedContent.shortDescription,
        fullDescription: generatedContent.fullDescription,
        seoTitle: generatedContent.seoTitle,
        seoDescription: generatedContent.seoDescription,
        seoKeywords: generatedContent.seoKeywords,
        keyBenefits: generatedContent.keyBenefits,
        faqs: generatedContent.faqs,
        metadata: generatedContent.metadata,
      },
      current,
      diff,
      tyreId: currentTyre?.id || null,
    });
  } catch (error) {
    console.error("[preview] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Preview failed",
      },
      { status: 500 }
    );
  }
}
