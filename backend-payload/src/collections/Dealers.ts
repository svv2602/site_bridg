/**
 * Dealers Collection
 *
 * Authorized Bridgestone dealer locations with name, address, coordinates,
 * phone/email, services, opening hours, and active status.
 * Used for the "Where to buy" dealer locator on the frontend.
 *
 * Access: public read, auth-required write.
 */
import type { CollectionConfig } from 'payload';

export const Dealers: CollectionConfig = {
  slug: 'dealers',
  labels: {
    singular: 'Дилер',
    plural: 'Дилери',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'type'],
    group: 'Контент',
    description: 'Дилери та сервісні центри',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          index: true,
          options: [
            { label: 'Офіційний дилер', value: 'official' },
            { label: 'Партнер', value: 'partner' },
            { label: 'Сервіс', value: 'service' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'city',
          type: 'text',
          required: true,
          index: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'address',
      type: 'text',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'latitude',
          type: 'number',
          validate: (value: number | null | undefined) => {
            if (value === null || value === undefined) return true;
            if (value < -90 || value > 90) return 'Широта повинна бути від -90 до 90';
            return true;
          },
          admin: { width: '50%', step: 0.000001 },
        },
        {
          name: 'longitude',
          type: 'number',
          validate: (value: number | null | undefined) => {
            if (value === null || value === undefined) return true;
            if (value < -180 || value > 180) return 'Довгота повинна бути від -180 до 180';
            return true;
          },
          admin: { width: '50%', step: 0.000001 },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          type: 'text',
          admin: { width: '50%' },
        },
        {
          name: 'email',
          type: 'email',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'website',
      type: 'text',
      validate: (value: string | null | undefined) => {
        if (!value) return true;
        try {
          const url = new URL(value);
          if (!['http:', 'https:'].includes(url.protocol)) {
            return 'URL має починатися з http:// або https://';
          }
          return true;
        } catch {
          return 'Невалідний URL';
        }
      },
    },
    {
      name: 'workingHours',
      type: 'text',
      admin: {
        description: 'e.g., Пн-Пт: 9:00-18:00, Сб: 9:00-14:00',
      },
    },
    {
      name: 'services',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Шиномонтаж', value: 'tire-fitting' },
        { label: 'Розвал-сходження', value: 'alignment' },
        { label: 'Балансування', value: 'balancing' },
        { label: 'Зберігання шин', value: 'storage' },
        { label: 'Ремонт шин', value: 'repair' },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Активний',
      admin: {
        position: 'sidebar',
        description: 'Вимкніть для м\'якого деактивування дилера без видалення',
      },
    },
  ],
};
