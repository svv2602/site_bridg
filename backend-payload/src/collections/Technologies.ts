/**
 * Technologies Collection
 *
 * Bridgestone proprietary tyre technologies (e.g., ENLITEN, NanoPro-Tech).
 * Referenced by Tyres collection via many-to-many relationship.
 * Fields: name, slug, description, icon.
 *
 * Access: public read, auth-required write.
 */
import type { CollectionConfig } from 'payload';

export const Technologies: CollectionConfig = {
  slug: 'technologies',
  labels: {
    singular: 'Технологія',
    plural: 'Технології',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Каталог',
    description: 'Технології Bridgestone',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Опис технології',
      admin: {
        components: {
          Field: '/src/fields/CKEditorField',
        },
      },
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Icon name from Lucide icons (e.g., leaf, shield, volume-2)',
      },
    },
    {
      // NOTE: Relation direction is one-directional — Tyres reference Technologies
      // (via the `technologies` field on the Tyres collection), but this `tyres` field
      // is NOT automatically populated. It must be manually maintained or queried
      // via a reverse lookup (e.g., fetch tyres where technologies contains this ID).
      //
      // The frontend technology detail page already queries tyres by technology slug
      // using the Tyres API, so this field is mostly informational for the admin UI.
      // If automatic sync is needed, add an afterChange hook on the Tyres collection
      // to update this field whenever a tyre's technologies list changes.
      name: 'tyres',
      type: 'relationship',
      relationTo: 'tyres',
      hasMany: true,
    },
  ],
};
