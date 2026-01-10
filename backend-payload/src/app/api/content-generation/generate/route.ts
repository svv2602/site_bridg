/**
 * POST /api/content-generation/generate
 *
 * Note: Direct content generation from API is not currently supported
 * due to ESM compatibility issues with the content-automation module.
 *
 * Use the CLI instead: npm run automation:generate
 */

import { NextRequest, NextResponse } from "next/server";
import { validateAuth, isAdmin, unauthorizedResponse, forbiddenResponse } from "../auth";

export async function POST(request: NextRequest) {
  // Authenticate
  const auth = await validateAuth(request);
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }
  if (!isAdmin(auth)) {
    return forbiddenResponse("Admin access required");
  }

  // Parse request body to get modelSlug for the response
  const body = await request.json().catch(() => ({}));
  const { modelSlug } = body as { modelSlug?: string };

  // Return instructions for using the CLI
  return NextResponse.json(
    {
      success: false,
      error: "Direct content generation from API is not available. Use the CLI instead.",
      modelSlug,
      instructions: {
        message: "Content generation must be run via the CLI due to module compatibility.",
        commands: [
          "cd backend-payload",
          `npm run automation:generate -- --model=${modelSlug || "<model-slug>"}`,
          "# Or run for all models:",
          "npm run automation:generate",
        ],
        helpUrl: "/admin/automation",
      },
    },
    { status: 501 } // Not Implemented
  );
}
