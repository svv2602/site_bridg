/**
 * Tests for audit-log helper.
 */
import { describe, it, expect, vi } from 'vitest';
import { auditLog } from '../audit-log';

describe('auditLog', () => {
  it('should call payload.create with correct collection and data', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: '1' });
    const mockPayload = { create: createMock };

    await auditLog(mockPayload as any, {
      action: 'config_change',
      actor: 'admin@bridgestone.ua',
      target: 'scheduler',
      details: { enabled: true },
    });

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({
      collection: 'audit-log',
      data: {
        action: 'config_change',
        actor: 'admin@bridgestone.ua',
        target: 'scheduler',
        targetId: undefined,
        details: { enabled: true },
        ip: undefined,
      },
    });
  });

  it('should default actor to "system" when not provided', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: '1' });
    const mockPayload = { create: createMock };

    await auditLog(mockPayload as any, {
      action: 'automation_run',
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actor: 'system',
        }),
      })
    );
  });

  it('should default details to empty object when not provided', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: '1' });
    const mockPayload = { create: createMock };

    await auditLog(mockPayload as any, {
      action: 'login_success',
      actor: 'user@test.com',
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          details: {},
        }),
      })
    );
  });

  it('should not throw when payload.create fails', async () => {
    const createMock = vi.fn().mockRejectedValue(new Error('DB error'));
    const mockPayload = { create: createMock };

    // Should not throw
    await auditLog(mockPayload as any, {
      action: 'login_failed',
      actor: 'unknown',
    });
  });

  it('should include IP when provided', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: '1' });
    const mockPayload = { create: createMock };

    await auditLog(mockPayload as any, {
      action: 'access_denied',
      actor: 'hacker@evil.com',
      ip: '192.168.1.1',
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ip: '192.168.1.1',
        }),
      })
    );
  });

  it('should include all audit actions', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: '1' });
    const mockPayload = { create: createMock };

    const actions = [
      'login_success', 'login_failed', 'create', 'update',
      'delete', 'automation_run', 'automation_error', 'config_change', 'access_denied',
    ] as const;

    for (const action of actions) {
      await auditLog(mockPayload as any, { action });
    }

    expect(createMock).toHaveBeenCalledTimes(actions.length);
  });
});
