/**
 * CategoryPages Collection
 *
 * CMS-managed content for category pages (vehicle types + seasons).
 * 6 pages total: passenger-tyres, suv-4x4-tyres, lcv-tyres, summer, winter, allseason.
 *
 * Access: public read, admin-only create/delete.
 */
import type { CollectionConfig } from 'payload';

const ICON_OPTIONS = [
  { label: 'Car', value: 'car' },
  { label: 'Shield', value: 'shield' },
  { label: 'Zap', value: 'zap' },
  { label: 'Star', value: 'star' },
  { label: 'Mountain', value: 'mountain' },
  { label: 'Truck', value: 'truck' },
  { label: 'Weight', value: 'weight' },
  { label: 'Gauge', value: 'gauge' },
  { label: 'Snowflake', value: 'snowflake' },
  { label: 'Thermometer', value: 'thermometer' },
  { label: 'Cloud', value: 'cloud' },
  { label: 'Sun', value: 'sun' },
];

export const CategoryPages: CollectionConfig = {
  slug: 'category-pages',
  labels: {
    singular: 'Сторінка категорії',
    plural: 'Сторінки категорій',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'pageType', 'updatedAt'],
    group: 'Контент',
    description: 'Контент для сторінок категорій (легкові, SUV, LCV, літні, зимові, всесезонні).',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    // SIDEBAR
    {
      name: 'slug',
      label: 'URL slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Наприклад: passenger-tyres, summer',
      },
    },
    {
      name: 'pageType',
      label: 'Тип сторінки',
      type: 'select',
      required: true,
      options: [
        { label: 'Тип авто', value: 'vehicle' },
        { label: 'Сезон', value: 'season' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'vehicleType',
      label: 'Тип авто',
      type: 'select',
      options: [
        { label: 'Легкові', value: 'passenger' },
        { label: 'SUV / 4x4', value: 'suv' },
        { label: 'LCV (фургони)', value: 'van' },
      ],
      admin: {
        position: 'sidebar',
        condition: (data) => data?.pageType === 'vehicle',
      },
    },
    {
      name: 'season',
      label: 'Сезон',
      type: 'select',
      options: [
        { label: 'Літні', value: 'summer' },
        { label: 'Зимові', value: 'winter' },
        { label: 'Всесезонні', value: 'allseason' },
      ],
      admin: {
        position: 'sidebar',
        condition: (data) => data?.pageType === 'season',
      },
    },

    // SEO
    {
      type: 'collapsible',
      label: 'SEO',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'seoTitle',
          label: 'SEO заголовок',
          type: 'text',
          maxLength: 70,
          admin: {
            description: 'Заголовок для <title> та Open Graph (до 70 символів)',
          },
        },
        {
          name: 'seoDescription',
          label: 'SEO опис',
          type: 'textarea',
          maxLength: 170,
          admin: {
            description: 'Meta description (до 170 символів)',
          },
        },
      ],
    },

    // HERO
    {
      type: 'collapsible',
      label: 'Hero секція',
      fields: [
        {
          name: 'title',
          label: 'Заголовок (H1)',
          type: 'text',
          required: true,
        },
        {
          name: 'subtitle',
          label: 'Підзаголовок',
          type: 'text',
        },
        {
          name: 'heroDescription',
          label: 'Опис у Hero',
          type: 'textarea',
        },
        {
          name: 'heroImage',
          label: 'Hero зображення',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'generateHeroImage',
          type: 'ui',
          admin: {
            components: {
              Field: '/src/components/GenerateCategoryHeroButton',
            },
          },
        },
        {
          name: 'heroImageAlt',
          label: 'Alt тексту зображення',
          type: 'text',
        },
        {
          name: 'breadcrumbLabel',
          label: 'Breadcrumb текст',
          type: 'text',
          admin: {
            description: 'Текст для хлібних крихт (наприклад: "Шини для легкових авто")',
          },
        },
        // Hero Overlay (vehicle pages only)
        {
          type: 'group',
          name: 'heroOverlay',
          label: 'Overlay на Hero зображенні',
          admin: {
            condition: (data) => data?.pageType === 'vehicle',
          },
          fields: [
            {
              name: 'icon',
              label: 'Іконка',
              type: 'select',
              options: ICON_OPTIONS,
            },
            {
              name: 'iconBg',
              label: 'Колір фону іконки',
              type: 'text',
              admin: {
                description: 'Tailwind клас, напр. bg-blue-500/15',
              },
            },
            {
              name: 'iconText',
              label: 'Колір іконки',
              type: 'text',
              admin: {
                description: 'Tailwind клас, напр. text-blue-500',
              },
            },
            {
              name: 'title',
              label: 'Заголовок overlay',
              type: 'text',
            },
            {
              name: 'description',
              label: 'Опис overlay',
              type: 'text',
            },
          ],
        },
      ],
    },

    // FEATURES
    {
      name: 'features',
      label: 'Характеристики',
      type: 'array',
      maxRows: 6,
      admin: {
        description: 'Переваги/характеристики для Hero секції (до 6)',
      },
      fields: [
        {
          name: 'icon',
          label: 'Іконка',
          type: 'select',
          required: true,
          options: ICON_OPTIONS,
        },
        {
          name: 'title',
          label: 'Заголовок',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          label: 'Опис',
          type: 'text',
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'colorBg',
              label: 'Колір фону',
              type: 'text',
              admin: {
                width: '50%',
                description: 'Tailwind клас, напр. bg-blue-500/15',
              },
            },
            {
              name: 'colorText',
              label: 'Колір тексту',
              type: 'text',
              admin: {
                width: '50%',
                description: 'Tailwind клас, напр. text-blue-500',
              },
            },
          ],
        },
      ],
    },

    // SEASON SECTION (vehicle pages only)
    {
      type: 'collapsible',
      label: 'Секція сезонів',
      admin: {
        initCollapsed: true,
        condition: (data) => data?.pageType === 'vehicle',
      },
      fields: [
        {
          name: 'seasonSectionDescription',
          label: 'Опис секції сезонів',
          type: 'textarea',
        },
        {
          name: 'seasonDescriptionSummer',
          label: 'Опис літніх шин',
          type: 'textarea',
        },
        {
          name: 'seasonDescriptionWinter',
          label: 'Опис зимових шин',
          type: 'textarea',
        },
        {
          name: 'seasonDescriptionAllseason',
          label: 'Опис всесезонних шин',
          type: 'textarea',
        },
        {
          name: 'seasonInitialCount',
          label: 'Початкова к-ть моделей у сезоні',
          type: 'number',
          defaultValue: 3,
        },
      ],
    },

    // FEATURED MODELS (vehicle pages only)
    {
      type: 'collapsible',
      label: 'Популярні моделі',
      admin: {
        initCollapsed: true,
        condition: (data) => data?.pageType === 'vehicle',
      },
      fields: [
        {
          name: 'featuredTitle',
          label: 'Заголовок секції',
          type: 'text',
        },
        {
          name: 'featuredCount',
          label: 'Кількість моделей',
          type: 'number',
          defaultValue: 6,
        },
        {
          name: 'filterPopular',
          label: 'Тільки популярні',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },

    // REVIEWS (vehicle pages only)
    {
      type: 'collapsible',
      label: 'Відгуки',
      admin: {
        initCollapsed: true,
        condition: (data) => data?.pageType === 'vehicle',
      },
      fields: [
        {
          name: 'reviewsVehicleType',
          label: 'Тип авто для відгуків',
          type: 'select',
          options: [
            { label: 'Легкові', value: 'passenger' },
            { label: 'SUV', value: 'suv' },
            { label: 'LCV', value: 'van' },
          ],
        },
        {
          name: 'reviewsTitle',
          label: 'Заголовок секції відгуків',
          type: 'text',
        },
        {
          name: 'reviewsLimit',
          label: 'Кількість відгуків',
          type: 'number',
          defaultValue: 6,
        },
        {
          name: 'reviewsShowAllLink',
          label: 'Показати посилання "Всі відгуки"',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },

    // CTA
    {
      type: 'collapsible',
      label: 'CTA секція',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'ctaTitle',
          label: 'Заголовок CTA',
          type: 'text',
        },
        {
          name: 'ctaDescription',
          label: 'Опис CTA',
          type: 'textarea',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'ctaPrimaryLabel',
              label: 'Основна кнопка',
              type: 'text',
              admin: { width: '50%' },
            },
            {
              name: 'ctaPrimaryHref',
              label: 'Посилання основної кнопки',
              type: 'text',
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'ctaSecondaryLabel',
              label: 'Додаткова кнопка',
              type: 'text',
              admin: { width: '50%' },
            },
            {
              name: 'ctaSecondaryHref',
              label: 'Посилання додаткової кнопки',
              type: 'text',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
  ],
};
