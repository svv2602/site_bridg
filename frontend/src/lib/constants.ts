// Centralized site constants — single source of truth for hardcoded values
// Used across components, schemas, metadata, and pages

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bridgestone.ua';
export const SITE_NAME = 'Bridgestone Україна';
export const SITE_NAME_EN = 'Bridgestone Ukraine';
export const SITE_DESCRIPTION = 'Офіційний представник Bridgestone в Україні. Шини для легкових авто, SUV та комерційного транспорту.';

// Contact information
export const PHONE_DISPLAY = '0 800 123 456';
export const PHONE_HREF = 'tel:+380800123456';
export const PHONE_SCHEMA = '+380-800-123-456';
export const EMAIL_SUPPORT = 'support@bridgestone.ua';
export const EMAIL_PRIVACY = 'privacy@bridgestone.ua';
export const EMAIL_INFO = 'info@bridgestone.ua';

// Address
export const ADDRESS_CITY = 'Київ';
export const ADDRESS_FULL = 'м. Київ, вул. Прикладна, 10';
export const ADDRESS_COUNTRY = 'UA';

// Social links
export const SOCIAL_LINKS = {
  website: 'https://www.bridgestone.com',
  facebook: 'https://www.facebook.com/BridgestoneUkraine',
  instagram: 'https://www.instagram.com/bridgestone_ukraine',
  telegram: 'https://t.me/bridgestone_ua',
} as const;

// Assets
export const LOGO_URL_WHITE = '/bridgestone-logo-white.svg';
export const OG_IMAGE = '/og-image.webp';

// Cookie consent
export const COOKIES_CONSENT_STORAGE_KEY = 'bridgestone_cookies_consent';
