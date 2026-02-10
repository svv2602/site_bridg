import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackGA4Event, trackGA4PageView, trackFBEvent, trackFBPageView } from "./analytics";
import analytics from "./analytics";

describe("GA4 tracking", () => {
  beforeEach(() => {
    // Reset mocks
    window.gtag = undefined;
    window.fbq = undefined;
  });

  it("calls gtag when available", () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    trackGA4Event("tyre_search", { search_term: "205/55 R16" });
    expect(mockGtag).toHaveBeenCalledWith("event", "tyre_search", {
      search_term: "205/55 R16",
    });
  });

  it("does not throw when gtag is not available", () => {
    expect(() => trackGA4Event("tyre_view")).not.toThrow();
  });

  it("tracks page view", () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    trackGA4PageView("/shyny/turanza-t005");
    expect(mockGtag).toHaveBeenCalledWith("config", undefined, {
      page_path: "/shyny/turanza-t005",
    });
  });
});

describe("Meta Pixel tracking", () => {
  beforeEach(() => {
    window.gtag = undefined;
    window.fbq = undefined;
  });

  it("calls fbq when available", () => {
    const mockFbq = vi.fn();
    window.fbq = mockFbq;

    trackFBEvent("ViewContent", { content_name: "Turanza T005" });
    expect(mockFbq).toHaveBeenCalledWith("track", "ViewContent", {
      content_name: "Turanza T005",
    });
  });

  it("does not throw when fbq is not available", () => {
    expect(() => trackFBEvent("Search")).not.toThrow();
  });

  it("tracks page view", () => {
    const mockFbq = vi.fn();
    window.fbq = mockFbq;

    trackFBPageView();
    expect(mockFbq).toHaveBeenCalledWith("track", "PageView");
  });
});

describe("analytics convenience methods", () => {
  beforeEach(() => {
    window.gtag = vi.fn();
    window.fbq = vi.fn();
  });

  it("trackTyreSearch sends events to both GA4 and FB", () => {
    analytics.trackTyreSearch({ width: 205, aspectRatio: 55, diameter: 16 });

    expect(window.gtag).toHaveBeenCalledWith("event", "tyre_search", expect.objectContaining({
      width: 205,
      aspectRatio: 55,
      diameter: 16,
    }));

    expect(window.fbq).toHaveBeenCalledWith("track", "Search", expect.objectContaining({
      content_category: "tyres",
    }));
  });

  it("trackTyreView sends events", () => {
    analytics.trackTyreView({ slug: "turanza-t005", name: "Turanza T005", season: "summer" });

    expect(window.gtag).toHaveBeenCalledWith("event", "tyre_view", expect.objectContaining({
      item_id: "turanza-t005",
    }));
  });

  it("trackDealerClick sends events", () => {
    analytics.trackDealerClick({ id: "1", name: "Test Dealer", city: "Kyiv" });

    expect(window.gtag).toHaveBeenCalledWith("event", "dealer_click", expect.objectContaining({
      dealer_name: "Test Dealer",
    }));
  });

  it("trackFormSubmit sends events", () => {
    analytics.trackFormSubmit("contact");

    expect(window.gtag).toHaveBeenCalledWith("event", "form_submit", {
      form_name: "contact",
    });

    expect(window.fbq).toHaveBeenCalledWith("track", "Lead", {
      content_name: "contact",
    });
  });

  it("trackCTAClick sends GA4 event only", () => {
    analytics.trackCTAClick("hero_cta", "/passenger-tyres");

    expect(window.gtag).toHaveBeenCalledWith("event", "cta_click", {
      cta_name: "hero_cta",
      destination: "/passenger-tyres",
    });
  });
});
