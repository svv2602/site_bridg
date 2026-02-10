// Centralized site constants — single source of truth for hardcoded values
// Used across components, schemas, metadata, and pages

import { getSiteSettings, type SiteSettings } from '@/lib/api/payload';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bridgestone.ua';
export const SITE_NAME = 'Bridgestone Україна';
export const SITE_NAME_EN = 'Bridgestone Ukraine';
export const SITE_DESCRIPTION = 'Офіційний представник Bridgestone в Україні. Шини для легкових авто, SUV та комерційного транспорту.';

// Contact information (defaults — overridden by CMS via getSiteSettingsWithDefaults)
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

// Merged settings: CMS data over hardcoded defaults
export interface MergedSiteSettings {
  phoneDisplay: string;
  phoneHref: string;
  phoneSchema: string;
  emailSupport: string;
  emailPrivacy: string;
  emailInfo: string;
  city: string;
  addressFull: string;
  country: string;
  socialLinks: {
    website: string;
    facebook: string;
    instagram: string;
    telegram: string;
  };
  workingHours: string;
}

/**
 * Fetch site settings from CMS and merge over hardcoded defaults.
 * Safe to call from any Server Component — returns defaults if CMS unavailable.
 */
export async function getSiteSettingsWithDefaults(): Promise<MergedSiteSettings> {
  let cms: SiteSettings | null = null;
  try {
    cms = await getSiteSettings();
  } catch {
    // CMS unavailable — use defaults
  }

  return {
    phoneDisplay: cms?.phoneDisplay || PHONE_DISPLAY,
    phoneHref: cms?.phoneHref || PHONE_HREF,
    phoneSchema: cms?.phoneHref
      ? cms.phoneHref.replace('tel:', '').replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '+$1-$2-$3-$4')
      : PHONE_SCHEMA,
    emailSupport: cms?.emailSupport || EMAIL_SUPPORT,
    emailPrivacy: cms?.emailPrivacy || EMAIL_PRIVACY,
    emailInfo: cms?.emailInfo || EMAIL_INFO,
    city: cms?.city || ADDRESS_CITY,
    addressFull: cms?.addressFull || ADDRESS_FULL,
    country: cms?.country || ADDRESS_COUNTRY,
    socialLinks: {
      website: cms?.website || SOCIAL_LINKS.website,
      facebook: cms?.facebook || SOCIAL_LINKS.facebook,
      instagram: cms?.instagram || SOCIAL_LINKS.instagram,
      telegram: cms?.telegram || SOCIAL_LINKS.telegram,
    },
    workingHours: cms?.workingHours || 'Пн-Пт 9:00-18:00',
  };
}
