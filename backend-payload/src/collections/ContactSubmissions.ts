import type { CollectionConfig } from 'payload';

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: {
    singular: 'Звернення',
    plural: 'Звернення',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'subject', 'status', 'createdAt'],
    group: 'Комунікація',
    description: 'Звернення з форми зворотнього зв\'язку',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          label: 'Ім\'я',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'status',
          label: 'Статус',
          type: 'select',
          defaultValue: 'new',
          options: [
            { label: 'Нове', value: 'new' },
            { label: 'В роботі', value: 'in-progress' },
            { label: 'Вирішено', value: 'resolved' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          label: 'Телефон',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'subject',
      label: 'Тема',
      type: 'select',
      required: true,
      options: [
        { label: 'Підбір шин', value: 'tyre-selection' },
        { label: 'Де купити', value: 'find-dealer' },
        { label: 'Гарантія', value: 'warranty' },
        { label: 'Інше', value: 'other' },
      ],
    },
    {
      name: 'message',
      label: 'Повідомлення',
      type: 'textarea',
      required: true,
    },
    {
      name: 'adminNotes',
      label: 'Нотатки менеджера',
      type: 'textarea',
      admin: {
        description: 'Внутрішні нотатки (не видно клієнту)',
      },
    },
  ],
};
