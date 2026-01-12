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
      name: 'tyres',
      type: 'relationship',
      relationTo: 'tyres',
      hasMany: true,
    },
  ],
};
