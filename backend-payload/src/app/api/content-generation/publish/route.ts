/**
 * POST /api/content-generation/publish
 *
 * Publishes generated content to Payload CMS Tyres collection.
 */

import { NextRequest, NextResponse } from "next/server";
import { getPayloadHMR } from "@payloadcms/next/utilities";
import configPromise from "@payload-config";
import { validateAuth, isAdmin, unauthorizedResponse, forbiddenResponse } from "../auth";

// Dynamic import for content-automation functions
async function getModules() {
  try {
    const storageModule = await import(
      "../../../../content-automation/src/utils/storage.js"
    );
    const lexicalModule = await import(
      "../../../../content-automation/src/utils/markdown-to-lexical.js"
    );
    return { storage: storageModule, lexical: lexicalModule };
  } catch (error) {
    console.error("Failed to import modules:", error);
    throw error;
  }
}

// Fields that can be published
const PUBLISHABLE_FIELDS = [
  "shortDescription",
  "fullDescription",
  "seoTitle",
  "seoDescription",
  "keyBenefits",
  "faqs",
] as const;

type PublishableField = (typeof PUBLISHABLE_FIELDS)[number];

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
    const { modelSlug, fields } = body as {
      modelSlug?: string;
      fields?: string[];
    };

    if (!modelSlug) {
      return NextResponse.json(
        { success: false, error: "modelSlug is required" },
        { status: 400 }
      );
    }

    // Validate fields
    const fieldsToPublish: PublishableField[] = fields
      ? (fields.filter((f) =>
          PUBLISHABLE_FIELDS.includes(f as PublishableField)
        ) as PublishableField[])
      : [...PUBLISHABLE_FIELDS];

    if (fieldsToPublish.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to publish" },
        { status: 400 }
      );
    }

    // Load modules
    const { storage, lexical } = await getModules();

    // Load generated content
    const generatedContent = await storage.loadFromStorage(
      `generated/${modelSlug}`
    );

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

    // Get Payload instance
    const payload = await getPayloadHMR({ config: configPromise });

    // Find existing tyre
    const tyres = await payload.find({
      collection: "tyres",
      where: {
        slug: { equals: modelSlug },
      },
      limit: 1,
    });

    const existingTyre = tyres.docs[0];

    if (!existingTyre) {
      return NextResponse.json(
        {
          success: false,
          error: `Tyre not found: ${modelSlug}`,
          modelSlug,
        },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    const updatedFields: string[] = [];

    for (const field of fieldsToPublish) {
      switch (field) {
        case "shortDescription":
          if (generatedContent.shortDescription) {
            updateData.shortDescription = generatedContent.shortDescription;
            updatedFields.push("shortDescription");
          }
          break;

        case "fullDescription":
          if (generatedContent.fullDescription) {
            // Convert Markdown to Lexical
            const lexicalContent = lexical.markdownToLexical(
              generatedContent.fullDescription
            );
            updateData.fullDescription = lexicalContent;
            updatedFields.push("fullDescription");
          }
          break;

        case "seoTitle":
          if (generatedContent.seoTitle) {
            updateData.seoTitle = generatedContent.seoTitle;
            updatedFields.push("seoTitle");
          }
          break;

        case "seoDescription":
          if (generatedContent.seoDescription) {
            updateData.seoDescription = generatedContent.seoDescription;
            updatedFields.push("seoDescription");
          }
          break;

        case "keyBenefits":
          if (generatedContent.keyBenefits?.length) {
            updateData.keyBenefits = generatedContent.keyBenefits.map(
              (item: { benefit: string; icon?: string }) => ({
                benefit: item.benefit,
              })
            );
            updatedFields.push("keyBenefits");
          }
          break;

        case "faqs":
          if (generatedContent.faqs?.length) {
            updateData.faqs = generatedContent.faqs.map(
              (faq: { question: string; answer: string }) => ({
                question: faq.question,
                answer: faq.answer,
              })
            );
            updatedFields.push("faqs");
          }
          break;
      }
    }

    if (updatedFields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No content to publish",
          modelSlug,
        },
        { status: 400 }
      );
    }

    // Update tyre in Payload
    await payload.update({
      collection: "tyres",
      id: existingTyre.id,
      data: updateData,
    });

    console.log(
      `[publish] Updated ${modelSlug}: ${updatedFields.join(", ")}`
    );

    return NextResponse.json({
      success: true,
      modelSlug,
      tyreId: existingTyre.id,
      updatedFields,
      publishedAt: new Date().toISOString(),
      publishedBy: auth.user?.email,
    });
  } catch (error) {
    console.error("[publish] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Publish failed",
      },
      { status: 500 }
    );
  }
}
