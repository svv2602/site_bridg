import type { CollectionConfig } from 'payload';

export const VehicleFitments: CollectionConfig = {
  slug: 'vehicle-fitments',
  admin: {
    useAsTitle: 'model',
    defaultColumns: ['make', 'model', 'yearFrom', 'yearTo'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'make',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'model',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'yearFrom',
          type: 'number',
          admin: { width: '50%' },
        },
        {
          name: 'yearTo',
          type: 'number',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'recommendedSizes',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'width',
              type: 'number',
              required: true,
              admin: { width: '33%' },
            },
            {
              name: 'aspectRatio',
              type: 'number',
              required: true,
              admin: { width: '33%' },
            },
            {
              name: 'diameter',
              type: 'number',
              required: true,
              admin: { width: '33%' },
            },
          ],
        },
      ],
    },
  ],
};
