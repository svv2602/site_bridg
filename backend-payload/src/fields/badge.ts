import type { Field } from 'payload';

export const badgeFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'type',
        type: 'select',
        required: true,
        options: [
          { label: 'Winner', value: 'winner' },
          { label: 'Recommended', value: 'recommended' },
          { label: 'Top 3', value: 'top3' },
          { label: 'Best Category', value: 'best_category' },
          { label: 'Eco', value: 'eco' },
        ],
        admin: { width: '25%' },
      },
      {
        name: 'source',
        type: 'select',
        required: true,
        options: [
          { label: 'ADAC', value: 'adac' },
          { label: 'Auto Bild', value: 'autobild' },
          { label: 'TyreReviews', value: 'tyrereviews' },
          { label: 'TCS', value: 'tcs' },
          { label: 'EU Label', value: 'eu_label' },
        ],
        admin: { width: '25%' },
      },
      {
        name: 'year',
        type: 'number',
        required: true,
        admin: { width: '25%' },
      },
      {
        name: 'testType',
        type: 'select',
        options: [
          { label: 'Summer', value: 'summer' },
          { label: 'Winter', value: 'winter' },
          { label: 'All Season', value: 'allseason' },
        ],
        admin: { width: '25%' },
      },
    ],
  },
  {
    type: 'row',
    fields: [
      {
        name: 'category',
        type: 'text',
        admin: { width: '50%', description: 'e.g., wet_braking, snow_handling' },
      },
      {
        name: 'label',
        type: 'text',
        required: true,
        admin: { width: '50%', description: 'Display label in Ukrainian' },
      },
    ],
  },
];
