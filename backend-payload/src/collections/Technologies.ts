import type { CollectionConfig } from 'payload';

export const Technologies: CollectionConfig = {
  slug: 'technologies',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
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
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Icon name from Lucide icons (e.g., leaf, shield, volume-2)',
      },
    },
    {
      name: 'tyres',
      type: 'relationship',
      relationTo: 'tyres',
      hasMany: true,
    },
  ],
};
