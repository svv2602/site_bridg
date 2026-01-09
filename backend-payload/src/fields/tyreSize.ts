import type { Field } from 'payload';

export const tyreSizeFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'width',
        type: 'number',
        required: true,
        admin: { width: '20%' },
      },
      {
        name: 'aspectRatio',
        type: 'number',
        required: true,
        admin: { width: '20%' },
      },
      {
        name: 'diameter',
        type: 'number',
        required: true,
        admin: { width: '20%' },
      },
      {
        name: 'loadIndex',
        type: 'text',
        admin: { width: '20%' },
      },
      {
        name: 'speedIndex',
        type: 'text',
        admin: { width: '20%' },
      },
    ],
  },
];
