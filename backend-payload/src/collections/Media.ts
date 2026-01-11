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
  },
  upload: {
    staticDir: 'media',
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
  ],
  hooks: {
    afterChange: [removeBackgroundHook],
  },
  access: {
    read: () => true,
  },
};
