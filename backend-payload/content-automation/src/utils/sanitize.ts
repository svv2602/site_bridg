/**
 * HTML Sanitizer
 *
 * Sanitizes LLM-generated HTML content to prevent XSS attacks.
 * Allows only safe tags used in tire descriptions and articles.
 */

import sanitizeHtmlLib from "sanitize-html";

/**
 * Allowed HTML tags for generated content.
 * Permits standard formatting and structure but blocks script, iframe, form, etc.
 */
const ALLOWED_TAGS = [
  // Headings
  "h1", "h2", "h3", "h4", "h5", "h6",
  // Block elements
  "p", "div", "blockquote", "pre", "code",
  // Lists
  "ul", "ol", "li",
  // Inline formatting
  "b", "strong", "i", "em", "u", "s", "sub", "sup", "mark", "small",
  // Links and media
  "a", "img",
  // Tables
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  // Other
  "br", "hr", "span",
];

/**
 * Allowed attributes per tag.
 */
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "width", "height"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
  span: ["class"],
  div: ["class"],
  pre: ["class"],
  code: ["class"],
};

/**
 * Sanitize HTML content by stripping dangerous tags and attributes.
 *
 * @param html - Raw HTML string (potentially from LLM output)
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  return sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    // Only allow safe URL schemes in href/src
    allowedSchemes: ["http", "https", "mailto"],
    // Strip all tags not in allowlist (don't escape them)
    disallowedTagsMode: "discard",
    // Allow relative URLs
    allowProtocolRelative: false,
  });
}
