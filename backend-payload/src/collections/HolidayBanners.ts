/**
 * HolidayBanners Collection
 *
 * Recurring holiday announcement banners that appear above the hero section.
 * Uses month+day (no year) so holidays repeat annually.
 * Display window: holidayDate ± showDaysBefore/showDaysAfter.
 *
 * Access: public read, auth-required write.
 */
import type { CollectionConfig } from 'payload';

export const HolidayBanners: CollectionConfig = {
  slug: 'holiday-banners',
  labels: {
    singular: 'Святковий банер',
    plural: 'Святкові банери',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'isActive', 'priority', 'holidayMonth', 'holidayDay'],
    group: 'Контент',
    description:
      'Святкові банери, що показуються автоматично за розкладом (місяць+день). Вищий пріоритет = показується першим.',
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
          label: 'Назва свята',
          type: 'text',
          required: true,
          admin: {
            width: '40%',
            description: 'Наприклад: Новий рік, 8 березня, День Незалежності',
          },
        },
        {
          name: 'isActive',
          label: 'Активний',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '20%' },
        },
        {
          name: 'priority',
          label: 'Пріоритет',
          type: 'number',
          defaultValue: 50,
          min: 1,
          max: 100,
          admin: {
            width: '40%',
            description: 'Вищий = показується першим (1–100)',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Дата та відображення',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'holidayMonth',
              label: 'Місяць',
              type: 'select',
              required: true,
              options: [
                { label: 'Січень', value: '1' },
                { label: 'Лютий', value: '2' },
                { label: 'Березень', value: '3' },
                { label: 'Квітень', value: '4' },
                { label: 'Травень', value: '5' },
                { label: 'Червень', value: '6' },
                { label: 'Липень', value: '7' },
                { label: 'Серпень', value: '8' },
                { label: 'Вересень', value: '9' },
                { label: 'Жовтень', value: '10' },
                { label: 'Листопад', value: '11' },
                { label: 'Грудень', value: '12' },
              ],
              admin: { width: '25%' },
            },
            {
              name: 'holidayDay',
              label: 'День',
              type: 'number',
              required: true,
              min: 1,
              max: 31,
              admin: { width: '25%' },
            },
            {
              name: 'showDaysBefore',
              label: 'Показувати днів ДО',
              type: 'number',
              defaultValue: 7,
              min: 0,
              max: 30,
              admin: { width: '25%' },
            },
            {
              name: 'showDaysAfter',
              label: 'Показувати днів ПІСЛЯ',
              type: 'number',
              defaultValue: 1,
              min: 0,
              max: 14,
              admin: { width: '25%' },
            },
          ],
        },
        {
          name: 'displayOn',
          label: 'Де показувати',
          type: 'select',
          defaultValue: 'all-pages',
          options: [
            { label: 'Тільки головна', value: 'homepage' },
            { label: 'Всі сторінки', value: 'all-pages' },
            { label: 'Конкретні сторінки', value: 'specific-pages' },
          ],
        },
        {
          name: 'specificPages',
          label: 'Конкретні сторінки',
          type: 'array',
          admin: {
            condition: (_, siblingData) => siblingData?.displayOn === 'specific-pages',
            description: 'Шляхи сторінок, наприклад: /passenger-tyres, /advice',
          },
          fields: [
            {
              name: 'path',
              label: 'Шлях',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Контент банера',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'emoji',
              label: 'Емодзі',
              type: 'text',
              admin: {
                width: '15%',
                description: 'Напр. 🎄',
              },
            },
            {
              name: 'title',
              label: 'Заголовок',
              type: 'text',
              required: true,
              admin: {
                width: '45%',
                description: 'Напр. "З Новим Роком!"',
              },
            },
            {
              name: 'subtitle',
              label: 'Підзаголовок',
              type: 'text',
              admin: {
                width: '40%',
                description: 'Напр. "Знижки на зимові шини"',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'link',
              label: 'Посилання',
              type: 'text',
              admin: {
                width: '50%',
                description: 'URL для кнопки CTA',
              },
            },
            {
              name: 'linkText',
              label: 'Текст посилання',
              type: 'text',
              admin: {
                width: '50%',
                description: 'Текст кнопки CTA',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Зображення та стиль',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'bannerImage',
              label: 'Фон (десктоп)',
              type: 'upload',
              relationTo: 'media',
              admin: { width: '50%' },
            },
            {
              name: 'bannerImageMobile',
              label: 'Фон (мобільний)',
              type: 'upload',
              relationTo: 'media',
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'backgroundColor',
              label: 'Клас фону',
              type: 'text',
              defaultValue: 'bg-primary',
              admin: {
                width: '50%',
                description: 'Tailwind клас, напр. bg-primary, bg-red-600',
              },
            },
            {
              name: 'textColor',
              label: 'Клас тексту',
              type: 'text',
              defaultValue: 'text-white',
              admin: {
                width: '50%',
                description: 'Tailwind клас, напр. text-white, text-stone-900',
              },
            },
          ],
        },
      ],
    },
  ],
};
