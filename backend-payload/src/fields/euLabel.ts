import type { Field } from 'payload';

export const euLabelField: Field = {
  name: 'euLabel',
  type: 'group',
  label: 'EU Label',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'wetGrip',
          type: 'select',
          label: 'Wet Grip',
          options: ['A', 'B', 'C', 'D', 'E'],
          admin: { width: '25%' },
        },
        {
          name: 'fuelEfficiency',
          type: 'select',
          label: 'Fuel Efficiency',
          options: ['A', 'B', 'C', 'D', 'E'],
          admin: { width: '25%' },
        },
        {
          name: 'noiseDb',
          type: 'number',
          label: 'Noise (dB)',
          min: 60,
          max: 80,
          admin: { width: '25%' },
        },
        {
          name: 'noiseClass',
          type: 'select',
          label: 'Noise Class',
          options: ['A', 'B', 'C'],
          admin: { width: '25%' },
        },
      ],
    },
  ],
};
