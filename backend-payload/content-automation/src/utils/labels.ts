/**
 * Shared label utilities for content automation.
 *
 * Centralizes display-label mappings used across article-pipeline and article-planner.
 */

/**
 * Get human-readable label for a test source.
 */
export function getSourceLabel(source: string): string {
  switch (source) {
    case "adac":
      return "ADAC";
    case "autobild":
      return "Auto Bild";
    case "tyrereviews":
      return "TyreReviews";
    default:
      return source;
  }
}
