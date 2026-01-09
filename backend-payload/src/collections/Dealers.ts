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
          admin: { width: '50%', step: 0.000001 },
        },
        {
          name: 'longitude',
          type: 'number',
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
  ],
};
