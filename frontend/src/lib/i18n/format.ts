/**
 * Ukrainian locale formatting utilities.
 *
 * Centralizes all locale-specific formatting so that
 * components don't hardcode "uk-UA" strings everywhere.
 */

const LOCALE = "uk-UA";

/**
 * Format a number using Ukrainian locale grouping (e.g. 15 000).
 *
 * @example formatNumber(15000) // "15 000"
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return value.toLocaleString(LOCALE, options);
}

/**
 * Format a currency amount in Ukrainian hryvnias (UAH).
 *
 * @example formatCurrency(1500) // "1 500 ₴"
 */
export function formatCurrency(value: number): string {
  return `${formatNumber(value)} \u20B4`;
}

/**
 * Format a date using Ukrainian locale.
 *
 * @example formatDate(new Date()) // "10 лютого 2026 р."
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString(LOCALE, options);
}

/**
 * Format a short date (day.month.year).
 *
 * @example formatDateShort(new Date()) // "10.02.2026"
 */
export function formatDateShort(date: Date | string | number): string {
  return formatDate(date, { year: "numeric", month: "2-digit", day: "2-digit" });
}
