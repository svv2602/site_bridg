/**
 * Users Collection
 *
 * Admin users with email/password auth and API key support.
 * Roles: admin (full access) and editor (content management).
 * API keys used by the content automation pipeline.
 *
 * Access: auth-required for all operations.
 */
import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Користувач',
    plural: 'Користувачі',
  },
  auth: {
    useAPIKey: true,  // Enable API key authentication for automation
  },
  admin: {
    useAsTitle: 'email',
    group: 'Налаштування',
    description: 'Адміністратори системи',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: 'editor',
      required: true,
    },
  ],
};
