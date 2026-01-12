import type { CollectionConfig } from 'payload';
import {
  lexicalEditor,
  UploadFeature,
} from '@payloadcms/richtext-lexical';
import {
  lexicalToHtml,
  htmlToLexical,
  hasHtmlChanged,
} from '../utils/lexical-html-sync';
import { euLabelField } from '../fields/euLabel';
import { tyreSizeFields } from '../fields/tyreSize';
import { usageField } from '../fields/usage';
import { badgeFields } from '../fields/badge';

export const Tyres: CollectionConfig = {
  slug: 'tyres',
  labels: {
    singular: 'Шина',
    plural: 'Шини',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'season', 'isNew', 'updatedAt'],
    group: 'Каталог',
    description: 'Моделі шин Bridgestone',
  },
  access: {
    read: () => true,
  },
  fields: [
    // Sidebar
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'seoTitle',
      type: 'text',
      maxLength: 70,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      maxLength: 170,
      admin: {
        position: 'sidebar',
      },
    },
    // Main content
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'season',
          type: 'select',
          required: true,
          options: [
            { label: 'Літня', value: 'summer' },
            { label: 'Зимова', value: 'winter' },
            { label: 'Всесезонна', value: 'allseason' },
          ],
          admin: { width: '25%' },
        },
        {
          name: 'isNew',
          type: 'checkbox',
          label: 'New',
          defaultValue: false,
          admin: { width: '25%' },
        },
        {
          name: 'isPopular',
          type: 'checkbox',
          label: 'Popular',
          defaultValue: false,
          admin: { width: '25%' },
        },
        {
          name: 'isPublished',
          type: 'checkbox',
          label: 'Published',
          defaultValue: false,
          admin: {
            width: '25%',
            description: 'Показувати на сайті',
          },
        },
      ],
    },
    {
      name: 'vehicleTypes',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: 'Легкові', value: 'passenger' },
        { label: 'SUV', value: 'suv' },
        { label: 'Van', value: 'van' },
        { label: 'Sport', value: 'sport' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    // AI Content Regeneration Button
    {
      name: 'regenerateContent',
      type: 'ui',
      admin: {
        components: {
          Field: '/src/components/RegenerateContentButton',
        },
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 350,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Візуальний редактор',
          fields: [
            {
              name: 'fullDescription',
              type: 'richText',
              label: ' ',
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  UploadFeature({
                    collections: {
                      media: {
                        fields: [
                          {
                            name: 'caption',
                            type: 'text',
                            label: 'Підпис',
                          },
                        ],
                      },
                    },
                  }),
                ],
              }),
              admin: {
                description: 'Виділіть текст для форматування. "/" - вставити блок.',
              },
            },
          ],
        },
        {
          label: 'HTML код',
          fields: [
            {
              name: 'fullDescriptionHtml',
              type: 'code',
              label: ' ',
              admin: {
                language: 'html',
                description: 'Пріоритетне поле. Якщо заповнене - використовується замість візуального.',
              },
            },
          ],
        },
      ],
    },
    // EU Label
    euLabelField,
    // Sizes
    {
      name: 'sizes',
      type: 'array',
      label: 'Available Sizes',
      fields: tyreSizeFields,
    },
    // Usage
    usageField,
    // Technologies
    {
      name: 'technologies',
      type: 'relationship',
      relationTo: 'technologies',
      hasMany: true,
    },
    // Badges
    {
      name: 'badges',
      type: 'array',
      label: 'Test Awards & Badges',
      fields: badgeFields,
      admin: {
        description: 'Awards from independent tests (ADAC, AutoBild, etc.)',
      },
    },
    // Key Benefits
    {
      name: 'keyBenefits',
      type: 'array',
      label: 'Key Benefits',
      fields: [
        {
          name: 'benefit',
          type: 'text',
          required: true,
        },
      ],
    },
    // FAQs (for generated content)
    {
      name: 'faqs',
      type: 'array',
      label: 'FAQ',
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
        },
      ],
    },
    // Test Results
    {
      name: 'testResults',
      type: 'array',
      label: 'Test Results',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'source',
              type: 'select',
              options: ['adac', 'autobild', 'tyrereviews', 'tcs'],
              admin: { width: '25%' },
            },
            {
              name: 'testType',
              type: 'select',
              options: ['summer', 'winter', 'allseason'],
              admin: { width: '25%' },
            },
            {
              name: 'year',
              type: 'number',
              admin: { width: '25%' },
            },
            {
              name: 'testedSize',
              type: 'text',
              admin: { width: '25%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'position',
              type: 'number',
              admin: { width: '25%' },
            },
            {
              name: 'totalTested',
              type: 'number',
              admin: { width: '25%' },
            },
            {
              name: 'rating',
              type: 'text',
              admin: { width: '25%' },
            },
            {
              name: 'ratingNumeric',
              type: 'number',
              admin: { width: '25%' },
            },
          ],
        },
        {
          name: 'articleSlug',
          type: 'text',
          admin: {
            description: 'Link to related article',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // Auto-generate slug from name if not provided
        if (data?.name && !data?.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        }

        // Sync Lexical ↔ HTML
        const oldHtml = originalDoc?.fullDescriptionHtml;
        const newHtml = data?.fullDescriptionHtml;
        const oldLexical = originalDoc?.fullDescription;
        const newLexical = data?.fullDescription;

        // If HTML changed → update Lexical
        if (hasHtmlChanged(oldHtml, newHtml) && newHtml) {
          data.fullDescription = htmlToLexical(newHtml);
        }
        // Else if Lexical changed or HTML is empty → update HTML from Lexical
        else if (newLexical?.root?.children?.length > 0) {
          data.fullDescriptionHtml = lexicalToHtml(newLexical);
        }

        return data;
      },
    ],
  },
};
