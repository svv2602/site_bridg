/**
 * Authentication helper for content generation API
 *
 * Validates Payload JWT tokens and checks user roles.
 */

import { NextRequest, NextResponse } from "next/server";
import { getPayloadHMR } from "@payloadcms/next/utilities";
import configPromise from "@payload-config";

export interface AuthResult {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  error?: string;
}

/**
 * Extract and validate Payload JWT token
 */
export async function validateAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        authenticated: false,
        error: "Missing or invalid Authorization header",
      };
    }

    const token = authHeader.replace("Bearer ", "");

    // Get Payload instance
    const payload = await getPayloadHMR({ config: configPromise });

    // Verify token using Payload's JWT verification
    const { user } = await payload.verifyToken({ token }).catch(() => ({ user: null }));

    if (!user) {
      return {
        authenticated: false,
        error: "Invalid or expired token",
      };
    }

    return {
      authenticated: true,
      user: {
        id: user.id as string,
        email: user.email as string,
        role: (user.role as string) || "user",
      },
    };
  } catch (error) {
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
}

/**
 * Check if user has admin role
 */
export function isAdmin(authResult: AuthResult): boolean {
  return authResult.authenticated && authResult.user?.role === "admin";
}

/**
 * Middleware wrapper for authenticated endpoints
 */
export function withAuth(
  handler: (request: NextRequest, auth: AuthResult) => Promise<NextResponse>,
  requireAdmin: boolean = false
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const auth = await validateAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    if (requireAdmin && !isAdmin(auth)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    return handler(request, auth);
  };
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(message: string = "Forbidden"): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}
