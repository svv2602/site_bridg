import type { Field } from 'payload';

export const usageField: Field = {
  name: 'usage',
  type: 'group',
  label: 'Usage Scenarios',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'city',
          type: 'number',
          label: 'City',
          min: 0,
          max: 100,
          admin: { width: '25%', description: '0-100%' },
        },
        {
          name: 'highway',
          type: 'number',
          label: 'Highway',
          min: 0,
          max: 100,
          admin: { width: '25%', description: '0-100%' },
        },
        {
          name: 'offroad',
          type: 'number',
          label: 'Offroad',
          min: 0,
          max: 100,
          admin: { width: '25%', description: '0-100%' },
        },
        {
          name: 'winter',
          type: 'number',
          label: 'Winter',
          min: 0,
          max: 100,
          admin: { width: '25%', description: '0-100%' },
        },
      ],
    },
  ],
};
