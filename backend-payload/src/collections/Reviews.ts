import type { CollectionConfig } from 'payload';

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Відгук', plural: 'Відгуки' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'tyre', 'rating', 'authorName', 'isPublished', 'createdAt'],
    group: 'Контент',
    description: 'Відгуки користувачів про шини',
  },
  access: {
    read: () => true, // Public read for frontend
  },
  fields: [
    // Relationship to Tyre
    {
      name: 'tyre',
      type: 'relationship',
      relationTo: 'tyres',
      required: true,
      label: 'Шина',
      admin: { position: 'sidebar' },
    },
    // Author info
    {
      type: 'row',
      fields: [
        {
          name: 'authorName',
          type: 'text',
          required: true,
          label: "Ім'я автора",
          admin: { width: '50%' },
        },
        {
          name: 'authorCity',
          type: 'text',
          label: 'Місто',
          admin: { width: '50%' },
        },
      ],
    },
    // Rating
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      label: 'Оцінка (1-5)',
      admin: { step: 1 },
    },
    // Review content
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Заголовок',
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Текст відгуку',
      admin: { rows: 4 },
    },
    // Pros/Cons
    {
      type: 'row',
      fields: [
        {
          name: 'pros',
          type: 'array',
          label: 'Переваги',
          admin: { width: '50%' },
          fields: [
            {
              name: 'text',
              type: 'text',
              label: 'Перевага',
            },
          ],
        },
        {
          name: 'cons',
          type: 'array',
          label: 'Недоліки',
          admin: { width: '50%' },
          fields: [
            {
              name: 'text',
              type: 'text',
              label: 'Недолік',
            },
          ],
        },
      ],
    },
    // Vehicle & usage
    {
      type: 'row',
      fields: [
        {
          name: 'vehicleInfo',
          type: 'text',
          label: 'Автомобіль',
          admin: {
            width: '50%',
            placeholder: 'Toyota Camry 2020',
          },
        },
        {
          name: 'usagePeriod',
          type: 'text',
          label: 'Період використання',
          admin: {
            width: '50%',
            placeholder: '6 місяців',
          },
        },
      ],
    },
    // Status
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      label: 'Опубліковано',
      admin: { position: 'sidebar' },
    },
    // AI generated flag
    {
      name: 'isGenerated',
      type: 'checkbox',
      defaultValue: false,
      label: 'Згенеровано AI',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Автоматично встановлюється при генерації',
      },
    },
  ],
};
