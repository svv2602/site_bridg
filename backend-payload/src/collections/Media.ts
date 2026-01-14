import type { CollectionConfig } from 'payload';
import { removeBackgroundHook } from '../hooks/removeBackground';

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
        name: 'card',
        width: 768,
        height: 576,
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
    afterChange: [removeBackgroundHook],
  },
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
};
