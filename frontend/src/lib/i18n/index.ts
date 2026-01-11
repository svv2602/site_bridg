/**
 * i18n module for Bridgestone Ukraine website
 *
 * Currently supports only Ukrainian (uk).
 * Prepared for future multi-language support.
 *
 * @example
 * import { t, uk } from '@/lib/i18n';
 *
 * // Using t() helper
 * const title = t('common.home'); // "Головна"
 *
 * // Direct access to translations
 * const seasons = uk.seasons; // { summer: "...", winter: "...", ... }
 */

export { uk, t, getSection } from "./uk";
export type { Translations, TranslationKey } from "./uk";

// Future: Add more languages here
// export { en } from "./en";
// export { pl } from "./pl";

// Current locale (can be dynamic in the future)
export const currentLocale = "uk" as const;
export const availableLocales = ["uk"] as const;
export type Locale = (typeof availableLocales)[number];
