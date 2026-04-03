/**
 * SiteSettings Global
 *
 * Company contact data, address, social links, and working hours.
 * Editable from the admin panel — replaces hardcoded frontend constants.
 *
 * Access: public read, auth-required update.
 */
import type { GlobalConfig } from 'payload';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3010';
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Налаштування сайту',
  admin: {
    group: 'Налаштування',
    description: 'Контактні дані, адреса, соцмережі та графік роботи',
  },
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  hooks: {
    afterChange: [
      ({ req }) => {
        // Revalidate frontend cache so contact changes appear immediately
        if (!REVALIDATION_SECRET) return;
        const url = `${FRONTEND_URL}/api/revalidate`;
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: REVALIDATION_SECRET, global: 'site-settings' }),
        })
          .then((res) => {
            if (res.ok) req.payload.logger.info('[Revalidate] site-settings → layout cache cleared');
            else req.payload.logger.error(`[Revalidate] site-settings failed (${res.status})`);
          })
          .catch((err) => {
            req.payload.logger.error(`[Revalidate] site-settings error: ${err}`);
          });
      },
    ],
  },
  fields: [
    // --- Контакти ---
    {
      type: 'collapsible',
      label: 'Контакти',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'phoneDisplay',
              label: 'Телефон (відображення)',
              type: 'text',
              admin: {
                width: '50%',
                description: 'Наприклад: 0 800 123 456',
              },
            },
            {
              name: 'phoneHref',
              label: 'Телефон (href)',
              type: 'text',
              admin: {
                width: '50%',
                description: 'Наприклад: tel:+380800123456',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'emailSupport',
              label: 'Email підтримки',
              type: 'email',
              admin: { width: '33%' },
            },
            {
              name: 'emailPrivacy',
              label: 'Email конфіденційності',
              type: 'email',
              admin: { width: '33%' },
            },
            {
              name: 'emailInfo',
              label: 'Email загальний',
              type: 'email',
              admin: { width: '33%' },
            },
          ],
        },
      ],
    },
    // --- Адреса ---
    {
      type: 'collapsible',
      label: 'Адреса',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'city',
              label: 'Місто',
              type: 'text',
              admin: { width: '33%' },
            },
            {
              name: 'addressFull',
              label: 'Повна адреса',
              type: 'text',
              admin: {
                width: '34%',
                description: 'Наприклад: м. Київ, вул. Прикладна, 10',
              },
            },
            {
              name: 'country',
              label: 'Країна (код)',
              type: 'text',
              admin: {
                width: '33%',
                description: 'ISO 3166-1 alpha-2, наприклад: UA',
              },
            },
          ],
        },
      ],
    },
    // --- Соцмережі ---
    {
      type: 'collapsible',
      label: 'Соцмережі',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'facebook',
          label: 'Facebook',
          type: 'text',
          admin: { description: 'URL сторінки у Facebook' },
        },
        {
          name: 'instagram',
          label: 'Instagram',
          type: 'text',
          admin: { description: 'URL сторінки в Instagram' },
        },
        {
          name: 'telegram',
          label: 'Telegram',
          type: 'text',
          admin: { description: 'URL каналу/бота в Telegram' },
        },
        {
          name: 'website',
          label: 'Глобальний сайт Bridgestone',
          type: 'text',
          admin: { description: 'URL глобального сайту Bridgestone' },
        },
      ],
    },
    // --- Графік роботи ---
    {
      type: 'collapsible',
      label: 'Графік роботи',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'workingHours',
          label: 'Графік роботи',
          type: 'text',
          admin: {
            description: 'Наприклад: Пн-Пт 9:00-18:00',
          },
        },
      ],
    },
  ],
};
