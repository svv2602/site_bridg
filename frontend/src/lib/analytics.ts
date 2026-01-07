// Analytics utilities for GA4 and Meta Pixel

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// GA4 Event types
type GA4EventName =
  | "tyre_search"
  | "tyre_view"
  | "dealer_click"
  | "phone_click"
  | "form_submit"
  | "cta_click";

interface GA4EventParams {
  [key: string]: string | number | boolean | undefined;
}

// Meta Pixel Event types
type FBEventName =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "Contact"
  | "Lead"
  | "CustomizeProduct";

interface FBEventParams {
  content_name?: string;
  content_category?: string;
  content_type?: string;
  content_ids?: string[];
  search_string?: string;
  value?: number;
  currency?: string;
  [key: string]: string | number | string[] | undefined;
}

// GA4 Functions
export function trackGA4Event(eventName: GA4EventName, params?: GA4EventParams) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

export function trackGA4PageView(url: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

// Meta Pixel Functions
export function trackFBEvent(eventName: FBEventName, params?: FBEventParams) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params);
  }
}

export function trackFBPageView() {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
}

// Combined tracking functions for convenience
export const analytics = {
  // Track tyre search
  trackTyreSearch(searchParams: {
    width?: number;
    aspectRatio?: number;
    diameter?: number;
    make?: string;
    model?: string;
  }) {
    const searchString = Object.values(searchParams).filter(Boolean).join(" ");

    trackGA4Event("tyre_search", {
      search_term: searchString,
      ...searchParams,
    });

    trackFBEvent("Search", {
      search_string: searchString,
      content_category: "tyres",
    });
  },

  // Track tyre view
  trackTyreView(tyre: { slug: string; name: string; season: string }) {
    trackGA4Event("tyre_view", {
      item_id: tyre.slug,
      item_name: tyre.name,
      item_category: tyre.season,
    });

    trackFBEvent("ViewContent", {
      content_name: tyre.name,
      content_type: "tyre",
      content_ids: [tyre.slug],
      content_category: tyre.season,
    });
  },

  // Track dealer click
  trackDealerClick(dealer: { id: string; name: string; city: string }) {
    trackGA4Event("dealer_click", {
      dealer_id: dealer.id,
      dealer_name: dealer.name,
      dealer_city: dealer.city,
    });

    trackFBEvent("Contact", {
      content_name: dealer.name,
      content_category: "dealer",
    });
  },

  // Track phone click
  trackPhoneClick(phone: string, context: string) {
    trackGA4Event("phone_click", {
      phone_number: phone,
      click_context: context,
    });

    trackFBEvent("Contact", {
      content_name: "phone_call",
      content_category: context,
    });
  },

  // Track form submit
  trackFormSubmit(formName: string) {
    trackGA4Event("form_submit", {
      form_name: formName,
    });

    trackFBEvent("Lead", {
      content_name: formName,
    });
  },

  // Track CTA click
  trackCTAClick(ctaName: string, destination: string) {
    trackGA4Event("cta_click", {
      cta_name: ctaName,
      destination: destination,
    });
  },
};

export default analytics;
