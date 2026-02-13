/**
 * ContactSubmissions Collection
 *
 * Customer contact form submissions. Created publicly (no auth required).
 * Fields: name, phone, email, subject, message, status, adminNotes.
 * Status workflow: new -> in-progress -> resolved.
 *
 * Access: public create, auth-required read/update/delete.
 */
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
    read: ({ req }) => !!req.user,
    create: () => true,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => (req.user as { role?: string })?.role === 'admin',
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
          minLength: 2,
          maxLength: 100,
          validate: (value: string | null | undefined) => {
            if (!value || value.trim().length < 2) return 'Ім\'я повинно містити щонайменше 2 символи';
            if (value.length > 100) return 'Ім\'я не повинно перевищувати 100 символів';
            return true;
          },
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
          validate: (value: string | null | undefined) => {
            if (!value) return true; // required check handled separately
            // Accept digits, +, spaces, dashes, parentheses (10-20 chars)
            const phoneRegex = /^[+]?[\d\s()-]{10,20}$/;
            if (!phoneRegex.test(value)) {
              return 'Невірний формат телефону. Приклад: +380671234567';
            }
            return true;
          },
          admin: { width: '50%' },
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          validate: (value: string | null | undefined) => {
            if (!value) return true; // required check handled separately
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(value)) {
              return 'Невірний формат електронної пошти';
            }
            return true;
          },
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
      minLength: 10,
      maxLength: 5000,
      validate: (value: string | null | undefined) => {
        if (!value || value.trim().length < 10) return 'Повідомлення повинно містити щонайменше 10 символів';
        if (value.length > 5000) return 'Повідомлення не повинно перевищувати 5000 символів';
        return true;
      },
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
