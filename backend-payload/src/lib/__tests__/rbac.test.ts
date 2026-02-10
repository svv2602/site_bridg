/**
 * Tests for RBAC (Role-Based Access Control) helpers.
 */
import { describe, it, expect } from 'vitest';
import {
  isAdmin,
  isEditor,
  hasMinRole,
  requireRole,
  requireRoleForEndpoint,
} from '../rbac';

describe('isAdmin', () => {
  it('should return true for admin role', () => {
    expect(isAdmin({ role: 'admin' })).toBe(true);
  });

  it('should return false for editor role', () => {
    expect(isAdmin({ role: 'editor' })).toBe(false);
  });

  it('should return false for null user', () => {
    expect(isAdmin(null)).toBe(false);
  });

  it('should return false for undefined user', () => {
    expect(isAdmin(undefined)).toBe(false);
  });

  it('should return false for user without role', () => {
    expect(isAdmin({ email: 'test@test.com' })).toBe(false);
  });

  it('should return false for non-object user', () => {
    expect(isAdmin('admin')).toBe(false);
    expect(isAdmin(42)).toBe(false);
  });
});

describe('isEditor', () => {
  it('should return true for editor role', () => {
    expect(isEditor({ role: 'editor' })).toBe(true);
  });

  it('should return false for admin role', () => {
    expect(isEditor({ role: 'admin' })).toBe(false);
  });

  it('should return false for null user', () => {
    expect(isEditor(null)).toBe(false);
  });

  it('should return false for user without role', () => {
    expect(isEditor({})).toBe(false);
  });
});

describe('hasMinRole', () => {
  it('should allow admin when minRole is admin', () => {
    expect(hasMinRole({ role: 'admin' }, 'admin')).toBe(true);
  });

  it('should deny editor when minRole is admin', () => {
    expect(hasMinRole({ role: 'editor' }, 'admin')).toBe(false);
  });

  it('should allow admin when minRole is editor', () => {
    expect(hasMinRole({ role: 'admin' }, 'editor')).toBe(true);
  });

  it('should allow editor when minRole is editor', () => {
    expect(hasMinRole({ role: 'editor' }, 'editor')).toBe(true);
  });

  it('should deny null user', () => {
    expect(hasMinRole(null, 'editor')).toBe(false);
  });

  it('should deny user without role', () => {
    expect(hasMinRole({ email: 'test@test.com' }, 'editor')).toBe(false);
  });
});

describe('requireRole', () => {
  it('should return a function', () => {
    const check = requireRole('admin');
    expect(typeof check).toBe('function');
  });

  it('should correctly check admin requirement', () => {
    const checkAdmin = requireRole('admin');
    expect(checkAdmin({ role: 'admin' })).toBe(true);
    expect(checkAdmin({ role: 'editor' })).toBe(false);
    expect(checkAdmin(null)).toBe(false);
  });

  it('should correctly check editor requirement', () => {
    const checkEditor = requireRole('editor');
    expect(checkEditor({ role: 'admin' })).toBe(true);
    expect(checkEditor({ role: 'editor' })).toBe(true);
    expect(checkEditor(null)).toBe(false);
  });
});

describe('requireRoleForEndpoint', () => {
  it('should return null when user has required role', () => {
    const result = requireRoleForEndpoint({ role: 'admin' }, 'admin');
    expect(result).toBeNull();
  });

  it('should return 403 Response when user lacks required role', async () => {
    const result = requireRoleForEndpoint({ role: 'editor' }, 'admin');
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);

    const body = await result!.json();
    expect(body.error).toBe('Доступ заборонено. Недостатньо прав.');
  });

  it('should return 403 for null user', async () => {
    const result = requireRoleForEndpoint(null, 'editor');
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it('should use custom message when provided', async () => {
    const result = requireRoleForEndpoint({ role: 'editor' }, 'admin', 'Custom denied');
    expect(result).not.toBeNull();

    const body = await result!.json();
    expect(body.error).toBe('Custom denied');
  });

  it('should allow admin for editor-level endpoints', () => {
    const result = requireRoleForEndpoint({ role: 'admin' }, 'editor');
    expect(result).toBeNull();
  });

  it('should allow editor for editor-level endpoints', () => {
    const result = requireRoleForEndpoint({ role: 'editor' }, 'editor');
    expect(result).toBeNull();
  });
});
