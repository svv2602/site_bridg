/**
 * Audit Log Helper
 *
 * Provides a simple API to record audit events.
 * Events are stored in the AuditLog Payload collection.
 */

import type { Payload } from 'payload';

export type AuditAction =
  | 'login_success'
  | 'login_failed'
  | 'create'
  | 'update'
  | 'delete'
  | 'automation_run'
  | 'automation_error'
  | 'config_change'
  | 'access_denied';

export interface AuditEvent {
  action: AuditAction;
  actor?: string; // user email or 'system'
  target?: string; // collection or resource name
  targetId?: string;
  details?: Record<string, unknown>;
  ip?: string;
}

/**
 * Record an audit event.
 *
 * @example
 * await auditLog(payload, {
 *   action: 'config_change',
 *   actor: req.user?.email,
 *   target: 'scheduler',
 *   details: { enabled: true, cronExpression: '0 3 * * 0' },
 * });
 */
export async function auditLog(
  payload: Payload,
  event: AuditEvent,
): Promise<void> {
  try {
    await payload.create({
      collection: 'audit-log',
      data: {
        action: event.action,
        actor: event.actor || 'system',
        target: event.target,
        targetId: event.targetId,
        details: event.details || {},
        ip: event.ip,
      },
    });
  } catch (error) {
    // Audit log write should never crash the main operation
    console.error('[AuditLog] Failed to write audit event:', error);
  }
}
