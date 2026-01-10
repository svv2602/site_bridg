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
    // Get Payload instance
    const payload = await getPayloadHMR({ config: configPromise });

    // Try to get user from cookies first (admin panel)
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      // Parse payload-token from cookie
      const tokenMatch = cookieHeader.match(/payload-token=([^;]+)/);
      if (tokenMatch) {
        const token = tokenMatch[1];
        try {
          // Use Payload's auth to verify
          const { user } = await payload.auth({ headers: request.headers });
          if (user) {
            return {
              authenticated: true,
              user: {
                id: String(user.id),
                email: user.email as string,
                role: (user.role as string) || "user",
              },
            };
          }
        } catch {
          // Cookie auth failed, try header
        }
      }
    }

    // Try Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        authenticated: false,
        error: "Missing or invalid Authorization header",
      };
    }

    const token = authHeader.replace("Bearer ", "");

    // Create a modified headers object with the token as a cookie
    // This allows Payload to verify the token
    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set("cookie", `payload-token=${token}`);

    try {
      const { user } = await payload.auth({ headers: modifiedHeaders });
      if (user) {
        return {
          authenticated: true,
          user: {
            id: String(user.id),
            email: user.email as string,
            role: (user.role as string) || "user",
          },
        };
      }
    } catch {
      // Auth failed
    }

    return {
      authenticated: false,
      error: "Invalid or expired token",
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
