/**
 * AuditLog Collection
 *
 * Records security-relevant events: who did what, when.
 * Used for compliance, debugging, and security monitoring.
 *
 * Events are immutable (no update/delete in admin UI).
 */
import type { CollectionConfig } from 'payload';

const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  labels: {
    singular: { uk: 'Запис аудиту' },
    plural: { uk: 'Журнал аудиту' },
  },
  admin: {
    group: 'System',
    useAsTitle: 'action',
    defaultColumns: ['action', 'actor', 'target', 'createdAt'],
    description: 'Immutable log of security and administrative events.',
  },
  access: {
    // Only admin can read audit logs
    read: ({ req }) => {
      if (!req.user) return false;
      return (req.user as { role?: string }).role === 'admin';
    },
    // Created programmatically only
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Login Success', value: 'login_success' },
        { label: 'Login Failed', value: 'login_failed' },
        { label: 'Create', value: 'create' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' },
        { label: 'Automation Run', value: 'automation_run' },
        { label: 'Automation Error', value: 'automation_error' },
        { label: 'Config Change', value: 'config_change' },
        { label: 'Access Denied', value: 'access_denied' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'actor',
      type: 'text',
      label: 'Actor (user email or system)',
      admin: { position: 'sidebar' },
    },
    {
      name: 'target',
      type: 'text',
      label: 'Target (collection/resource)',
    },
    {
      name: 'targetId',
      type: 'text',
      label: 'Target ID',
    },
    {
      name: 'details',
      type: 'json',
      label: 'Additional Details',
    },
    {
      name: 'ip',
      type: 'text',
      label: 'IP Address',
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
};

export default AuditLog;
