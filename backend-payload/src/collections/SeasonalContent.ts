/**
 * SeasonalContent Collection
 *
 * Season-specific homepage content (hero banners, promotions, CTAs).
 * Only one entry per season can be active at a time — enforced via
 * beforeChange hook that deactivates other entries of the same season.
 *
 * Access: public read, auth-required write.
 */
import type { CollectionConfig } from 'payload';

export const SeasonalContent: CollectionConfig = {
  slug: 'seasonal-content',
  labels: {
    singular: 'Сезонний контент',
    plural: 'Сезонний контент',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'isActive', 'featuredSeason', 'startDate', 'endDate'],
    group: 'Налаштування',
    description:
      'Сезонний промо-контент на головній. Видимість визначається полями startDate/endDate автоматично (isActive + дата в діапазоні).',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          label: 'Назва',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
            description: 'Наприклад: winter-2025, summer-2025',
          },
        },
        {
          name: 'isActive',
          label: 'Активний',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '50%',
            description: 'Тільки один сезонний контент може бути активним',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          label: 'Дата початку',
          type: 'date',
          required: true,
          admin: {
            width: '50%',
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'endDate',
          label: 'Дата закінчення',
          type: 'date',
          required: true,
          admin: {
            width: '50%',
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
          validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => {
            if (value && siblingData?.startDate) {
              const end = new Date(value as string);
              const start = new Date(siblingData.startDate as string);
              if (end <= start) {
                return 'Дата закінчення повинна бути після дати початку';
              }
            }
            return true;
          },
        },
      ],
    },
    {
      name: 'featuredSeason',
      label: 'Рекомендований сезон',
      type: 'select',
      required: true,
      options: [
        { label: 'Зимові шини', value: 'winter' },
        { label: 'Літні шини', value: 'summer' },
        { label: 'Всесезонні шини', value: 'allseason' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Hero секція',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'heroTitle',
          label: 'Промо-заголовок сезону',
          type: 'text',
          required: true,
          admin: {
            description: 'НЕ H1 — показується у промо-картці на головній сторінці',
          },
        },
        {
          name: 'heroSubtitle',
          label: 'Промо-підзаголовок сезону',
          type: 'text',
          admin: {
            description: 'Додатковий текст у промо-картці',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'ctaText',
              label: 'Текст кнопки',
              type: 'text',
              required: true,
              admin: { width: '50%' },
            },
            {
              name: 'ctaLink',
              label: 'Посилання кнопки',
              type: 'text',
              required: true,
              admin: {
                width: '50%',
                description: 'Наприклад: /passenger-tyres?season=winter',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Додаткові налаштування',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'gradient',
          label: 'Градієнт фону',
          type: 'text',
          defaultValue: 'from-stone-800 to-stone-900',
          admin: {
            description: 'Tailwind CSS градієнт класи',
          },
        },
        {
          name: 'promoText',
          label: 'Промо текст',
          type: 'textarea',
          admin: {
            description: 'Додатковий промо-текст для сезонної кампанії',
            components: {
              Field: '/src/fields/CKEditorField',
            },
          },
        },
      ],
    },
  ],
};
