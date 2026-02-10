"use client";

import { useEffect } from "react";
import analytics from "@/lib/analytics";

/**
 * Client component that fires a tyre_view analytics event on mount.
 * Used in the server-rendered tyre detail page.
 */
export function TrackTyreView({ slug, name, season }: { slug: string; name: string; season: string }) {
  useEffect(() => {
    analytics.trackTyreView({ slug, name, season });
  }, [slug, name, season]);

  return null;
}

/**
 * Client component that fires a dealer_search analytics event on mount.
 * Used in the server-rendered dealers page.
 */
export function TrackDealerSearch() {
  useEffect(() => {
    analytics.trackCTAClick("dealer_search", "/dealers");
  }, []);

  return null;
}

/**
 * Client component that fires a comparison_view analytics event on mount.
 * Rendered on comparison detail pages.
 */
export function TrackComparisonView({ tyreNames }: { tyreNames: string[] }) {
  useEffect(() => {
    analytics.trackCTAClick("comparison_view", tyreNames.join(" vs "));
  }, [tyreNames]);

  return null;
}
