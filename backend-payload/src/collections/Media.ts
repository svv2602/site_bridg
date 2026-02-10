/**
 * Media Collection
 *
 * Uploaded images with auto-generated sizes (thumbnail, mobile, card, tablet, hero).
 * Supports AI image generation fields (prompt, type, season, size) and
 * background removal via rembg. Empty enum fields sanitized before save
 * (PostgreSQL does not accept empty strings for enum columns).
 *
 * Access: public read, auth-required write.
 */
import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload';
import { removeBackgroundHook } from '../hooks/removeBackground';

// PostgreSQL enums cannot accept empty strings - convert them to undefined (NULL)
const sanitizeEnumFields: CollectionBeforeChangeHook = ({ data }) => {
  const enumFields = ['generationType', 'generationSeason', 'generationSize'];
  for (const field of enumFields) {
    if (data[field] === '') {
      data[field] = undefined;
    }
  }
  return data;
};

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Медіа',
    plural: 'Медіа',
  },
  admin: {
    group: 'Налаштування',
    description: 'Зображення та файли',
    components: {
      edit: {
        beforeDocumentControls: ['/src/components/RegenerateImageSection'],
      },
    },
  },
  upload: {
    staticDir: 'media',
    focalPoint: true,
    crop: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'mobile',
        width: 480,
        height: 360,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 576,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: 768,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
    ],
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'removeBackground',
      type: 'checkbox',
      label: 'Видалити фон',
      defaultValue: false,
      admin: {
        description: 'Автоматично видалити білий фон (для фото шин)',
      },
    },
    {
      name: 'backgroundRemoved',
      type: 'checkbox',
      label: 'Фон видалено',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Встановлюється автоматично після обробки',
      },
    },
    // AI Image Generation fields
    {
      name: 'generationPrompt',
      type: 'textarea',
      label: 'Промпт генерації',
      admin: {
        description: 'Промпт, який використовувався для генерації (зберігається автоматично)',
        rows: 8,
      },
    },
    {
      name: 'generationType',
      type: 'select',
      label: 'Тип зображення',
      options: [
        { label: 'Hero (широкий банер)', value: 'hero' },
        { label: 'Content (контент статті)', value: 'content' },
        { label: 'Product (продуктове фото)', value: 'product' },
        { label: 'Lifestyle (лайфстайл)', value: 'lifestyle' },
      ],
      admin: {
        description: 'Тип зображення для генерації промпта',
      },
    },
    {
      name: 'generationSeason',
      type: 'select',
      label: 'Сезон',
      options: [
        { label: 'Літо', value: 'summer' },
        { label: 'Зима', value: 'winter' },
        { label: 'Всесезон', value: 'allseason' },
      ],
      admin: {
        condition: (data) => ['hero', 'lifestyle'].includes(data?.generationType),
        description: 'Сезон для hero/lifestyle зображень',
      },
    },
    {
      name: 'generationSize',
      type: 'select',
      label: 'Розмір генерації',
      options: [
        { label: '1024x1024 (квадрат)', value: '1024x1024' },
        { label: '1792x1024 (широкий)', value: '1792x1024' },
        { label: '1024x1792 (вертикальний)', value: '1024x1792' },
      ],
      defaultValue: '1024x1024',
      admin: {
        description: 'Розмір зображення для генерації',
      },
    },
  ],
  hooks: {
    beforeChange: [sanitizeEnumFields],
    afterChange: [removeBackgroundHook],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => (req.user as { role?: string })?.role === 'admin',
  },
};
