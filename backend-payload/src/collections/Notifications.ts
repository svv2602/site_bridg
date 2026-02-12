/**
 * Notifications Collection
 *
 * Stores automation notifications for the admin panel.
 * Created programmatically by the content-automation pipeline.
 */
import type { CollectionConfig } from 'payload';

const Notifications: CollectionConfig = {
  slug: 'notifications',
  labels: {
    singular: { uk: 'Повідомлення' },
    plural: { uk: 'Повідомлення' },
  },
  admin: {
    group: 'System',
    useAsTitle: 'title',
    defaultColumns: ['type', 'title', 'read', 'createdAt'],
    description: 'Автоматичні повідомлення від системи автоматизації контенту.',
  },
  access: {
    // Any authenticated user can read notifications
    read: ({ req }) => !!req.user,
    // Public create — automation uses API key auth
    create: () => true,
    // Authenticated users can update (mark as read)
    update: ({ req }) => !!req.user,
    // Only admin can delete
    delete: ({ req }) => {
      if (!req.user) return false;
      return (req.user as { role?: string }).role === 'admin';
    },
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Новий контент', value: 'new_content' },
        { label: 'Помилка', value: 'error' },
        { label: 'Тижневий звіт', value: 'weekly_summary' },
        { label: 'Інформація', value: 'info' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'bodyHtml',
      type: 'textarea',
      admin: { description: 'Original HTML body from automation' },
    },
    {
      name: 'data',
      type: 'json',
      label: 'Additional Data',
    },
    {
      name: 'buttons',
      type: 'json',
      label: 'Action Buttons',
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'readAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'readBy',
      type: 'text',
      label: 'Read by (user email)',
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
};

export default Notifications;
