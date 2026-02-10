/**
 * Role-Based Access Control (RBAC) Helpers
 *
 * Provides role-checking utilities for Payload CMS v3 endpoints.
 *
 * Roles:
 *   - admin: Full access — manage users, run automation, delete content
 *   - editor: Content management — create/edit content, regenerate images/reviews
 */

export type UserRole = 'admin' | 'editor';

/** Shape of the user object attached to Payload requests */
interface PayloadUser {
  id?: string | number;
  email?: string;
  role?: UserRole;
}

/**
 * Check if the user has the admin role.
 */
export function isAdmin(user: unknown): boolean {
  if (!user || typeof user !== 'object') return false;
  return (user as PayloadUser).role === 'admin';
}

/**
 * Check if the user has the editor role.
 */
export function isEditor(user: unknown): boolean {
  if (!user || typeof user !== 'object') return false;
  return (user as PayloadUser).role === 'editor';
}

/**
 * Check if the user has at least the given minimum role level.
 * Role hierarchy: admin > editor
 */
export function hasMinRole(user: unknown, minRole: UserRole): boolean {
  if (!user || typeof user !== 'object') return false;
  const userRole = (user as PayloadUser).role;
  if (!userRole) return false;

  if (minRole === 'editor') {
    return userRole === 'editor' || userRole === 'admin';
  }
  // minRole === 'admin'
  return userRole === 'admin';
}

/**
 * Create a role-checking function bound to a specific minimum role.
 * Returns a function that checks whether a user meets the role requirement.
 */
export function requireRole(minRole: UserRole): (user: unknown) => boolean {
  return (user: unknown) => hasMinRole(user, minRole);
}

/**
 * Check role requirements on a Payload endpoint request.
 * Returns a 403 Response if the user doesn't have the required role, or null if allowed.
 *
 * Usage in a Payload endpoint handler:
 * ```ts
 * const forbidden = requireRoleForEndpoint(req.user, 'admin');
 * if (forbidden) return forbidden;
 * ```
 */
export function requireRoleForEndpoint(
  user: unknown,
  minRole: UserRole,
  message = 'Доступ заборонено. Недостатньо прав.',
): Response | null {
  if (!hasMinRole(user, minRole)) {
    return Response.json(
      { error: message },
      { status: 403 },
    );
  }
  return null;
}
