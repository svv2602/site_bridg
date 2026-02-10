import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getPayloadTyres,
  getPayloadTyreBySlug,
  getPayloadFeaturedTyres,
  searchPayloadTyres,
  getPayloadArticles,
  getPayloadArticlesPaginated,
  getPayloadArticleTags,
  getPayloadArticleBySlug,
  getPayloadDealers,
  getPayloadTechnologies,
  getPayloadVehicleFitments,
  getPayloadVehicleFitmentByCarParams,
  getSeasonalContent,
  transformPayloadTyre,
  transformPayloadArticle,
  type PayloadTyre,
  type PayloadArticle,
  type PayloadDealer,
  type PayloadTechnology,
  type PayloadVehicleFitment,
  type PayloadSeasonalContent,
} from "./payload";

// --- Mock Fixtures ---

function makePayloadResponse<T>(docs: T[], overrides?: Record<string, unknown>) {
  return {
    docs,
    totalDocs: docs.length,
    limit: 100,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    ...overrides,
  };
}

const mockTyre: PayloadTyre = {
  id: "1",
  slug: "turanza-t005",
  name: "Turanza T005",
  brand: "bridgestone",
  season: "summer",
  vehicleTypes: ["passenger"],
  isNew: true,
  isPopular: true,
  isPublished: true,
  shortDescription: "Premium touring tyre",
  image: { id: "img1", url: "/media/turanza.jpg", alt: "Turanza" },
  euLabel: { wetGrip: "A", fuelEfficiency: "B", noiseDb: 70 },
  sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }],
  usage: { city: 80, highway: 60, offroad: 0, winter: 0 },
  technologies: [{ id: "t1", slug: "enliten", name: "ENLITEN", description: "Lightweight" }],
  badges: [{ type: "test-winner", source: "ADAC", year: 2024, label: "ADAC Winner" }],
  keyBenefits: [{ benefit: "Long tread life" }],
  faqs: [{ question: "Is it good?", answer: "Yes" }],
  testResults: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockArticle: PayloadArticle = {
  id: "a1",
  slug: "winter-tips",
  title: "Winter Driving Tips",
  previewText: "How to drive safely in winter",
  tags: [{ tag: "winter" }, { tag: "safety" }],
  readingTimeMinutes: 5,
  createdAt: "2024-01-15T00:00:00.000Z",
  updatedAt: "2024-01-15T00:00:00.000Z",
};

const mockDealer: PayloadDealer = {
  id: "d1",
  name: "AutoKyiv",
  type: "official",
  city: "Kyiv",
  address: "Khreschatyk 1",
  latitude: 50.45,
  longitude: 30.52,
  phone: "+380441234567",
};

const mockTechnology: PayloadTechnology = {
  id: "t1",
  slug: "enliten",
  name: "ENLITEN",
  description: "Lightweight tech",
};

const mockFitment: PayloadVehicleFitment = {
  id: "f1",
  make: "Toyota",
  model: "Camry",
  yearFrom: 2020,
  yearTo: 2024,
  recommendedSizes: [{ width: 215, aspectRatio: 55, diameter: 17 }],
};

const mockSeasonalContent: PayloadSeasonalContent = {
  id: "sc1",
  name: "Winter 2024",
  isActive: true,
  startDate: "2024-10-01T00:00:00.000Z",
  endDate: "2025-03-31T00:00:00.000Z",
  featuredSeason: "winter",
  heroTitle: "Зимові шини Bridgestone",
  heroSubtitle: "Безпека взимку",
  ctaText: "Зимові моделі",
  ctaLink: "/passenger-tyres/winter",
  gradient: "from-blue-800 to-blue-900",
  promoText: "Акція",
};

// --- Global fetch mock ---

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

function mockFetchSuccess<T>(data: T) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function mockFetchError(status: number) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve({ errors: [{ message: "Error" }] }),
  });
}

function mockFetchNetworkError() {
  (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
    new Error("Network error")
  );
}

function getLastFetchUrl(): string {
  const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
  return calls[calls.length - 1][0] as string;
}

// ============================================================
// Tests
// ============================================================

describe("payload.ts API Client", () => {
  // --- getPayloadTyres ---
  describe("getPayloadTyres", () => {
    it("returns parsed tyre docs on success", async () => {
      mockFetchSuccess(makePayloadResponse([mockTyre]));
      const result = await getPayloadTyres();
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("turanza-t005");
    });

    it("builds query params for season and vehicleType", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await getPayloadTyres({ season: "winter", vehicleType: "suv" });
      const url = getLastFetchUrl();
      expect(url).toContain("where%5Bseason%5D%5Bequals%5D=winter");
      expect(url).toContain("where%5BvehicleTypes%5D%5Bcontains%5D=suv");
    });

    it("passes limit and page parameters", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await getPayloadTyres({ limit: 10, page: 2 });
      const url = getLastFetchUrl();
      expect(url).toContain("limit=10");
      expect(url).toContain("page=2");
    });

    it("sets depth=2 for relationship population", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await getPayloadTyres();
      const url = getLastFetchUrl();
      expect(url).toContain("depth=2");
    });

    it("throws on API error (non-ok response)", async () => {
      mockFetchError(500);
      await expect(getPayloadTyres()).rejects.toThrow("Payload API error: 500");
    });

    it("throws on network error", async () => {
      mockFetchNetworkError();
      await expect(getPayloadTyres()).rejects.toThrow("Network error");
    });
  });

  // --- getPayloadTyreBySlug ---
  describe("getPayloadTyreBySlug", () => {
    it("returns the first matching tyre", async () => {
      mockFetchSuccess(makePayloadResponse([mockTyre]));
      const result = await getPayloadTyreBySlug("turanza-t005");
      expect(result).not.toBeNull();
      expect(result!.slug).toBe("turanza-t005");
    });

    it("returns null when no docs match", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      const result = await getPayloadTyreBySlug("nonexistent");
      expect(result).toBeNull();
    });

    it("encodes slug in URL", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await getPayloadTyreBySlug("tyre with spaces");
      const url = getLastFetchUrl();
      expect(url).toContain("tyre%20with%20spaces");
    });

    it("throws on 404 response", async () => {
      mockFetchError(404);
      await expect(getPayloadTyreBySlug("missing")).rejects.toThrow("Payload API error: 404");
    });
  });

  // --- getPayloadFeaturedTyres ---
  describe("getPayloadFeaturedTyres", () => {
    it("returns featured tyres with default limit of 4", async () => {
      mockFetchSuccess(makePayloadResponse([mockTyre]));
      const result = await getPayloadFeaturedTyres();
      expect(result).toHaveLength(1);
      const url = getLastFetchUrl();
      expect(url).toContain("limit=4");
      expect(url).toContain("isPopular");
    });

    it("accepts custom limit", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await getPayloadFeaturedTyres(8);
      const url = getLastFetchUrl();
      expect(url).toContain("limit=8");
    });
  });

  // --- searchPayloadTyres ---
  describe("searchPayloadTyres", () => {
    it("returns filtered tyres by size", async () => {
      const tyreWithSize: PayloadTyre = {
        ...mockTyre,
        sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }],
      };
      const tyreWithoutSize: PayloadTyre = {
        ...mockTyre,
        id: "2",
        slug: "other-tyre",
        sizes: [{ width: 225, aspectRatio: 45, diameter: 18 }],
      };
      mockFetchSuccess(makePayloadResponse([tyreWithSize, tyreWithoutSize]));

      const result = await searchPayloadTyres({ width: 205, aspectRatio: 55, diameter: 16 });
      expect(result.tyres).toHaveLength(1);
      expect(result.tyres[0].slug).toBe("turanza-t005");
      expect(result.total).toBe(1);
    });

    it("returns all tyres when no size filter is specified", async () => {
      mockFetchSuccess(makePayloadResponse([mockTyre]));
      const result = await searchPayloadTyres({});
      expect(result.tyres).toHaveLength(1);
    });

    it("passes season parameter", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await searchPayloadTyres({ season: "winter" });
      const url = getLastFetchUrl();
      expect(url).toContain("where%5Bseason%5D%5Bequals%5D=winter");
    });

    it("throws on server error", async () => {
      mockFetchError(500);
      await expect(searchPayloadTyres({})).rejects.toThrow();
    });
  });

  // --- getPayloadArticles ---
  describe("getPayloadArticles", () => {
    it("returns article docs on success", async () => {
      mockFetchSuccess(makePayloadResponse([mockArticle]));
      const result = await getPayloadArticles();
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("winter-tips");
    });

    it("throws on network error", async () => {
      mockFetchNetworkError();
      await expect(getPayloadArticles()).rejects.toThrow();
    });
  });

  // --- getPayloadArticlesPaginated ---
  describe("getPayloadArticlesPaginated", () => {
    it("returns paginated result without filters", async () => {
      mockFetchSuccess(makePayloadResponse([mockArticle], {
        totalDocs: 1,
        totalPages: 1,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      }));
      const result = await getPayloadArticlesPaginated({ limit: 9, page: 1 });
      expect(result.articles).toHaveLength(1);
      expect(result.totalDocs).toBe(1);
      expect(result.page).toBe(1);
    });

    it("filters articles by tag (client-side)", async () => {
      const article1 = { ...mockArticle, tags: [{ tag: "winter" }] };
      const article2: PayloadArticle = {
        ...mockArticle,
        id: "a2",
        slug: "summer-guide",
        title: "Summer Guide",
        previewText: "Summer info",
        tags: [{ tag: "summer" }],
        createdAt: "2024-02-01T00:00:00.000Z",
        updatedAt: "2024-02-01T00:00:00.000Z",
      };
      mockFetchSuccess(makePayloadResponse([article1, article2]));
      const result = await getPayloadArticlesPaginated({ tag: "winter" });
      expect(result.articles).toHaveLength(1);
      expect(result.articles[0].slug).toBe("winter-tips");
    });

    it("filters articles by search text (client-side)", async () => {
      const article1 = { ...mockArticle };
      const article2: PayloadArticle = {
        ...mockArticle,
        id: "a2",
        slug: "unrelated",
        title: "Unrelated Article",
        previewText: "Something else",
        tags: [],
        createdAt: "2024-02-01T00:00:00.000Z",
        updatedAt: "2024-02-01T00:00:00.000Z",
      };
      mockFetchSuccess(makePayloadResponse([article1, article2]));
      const result = await getPayloadArticlesPaginated({ search: "winter" });
      expect(result.articles).toHaveLength(1);
      expect(result.articles[0].title).toBe("Winter Driving Tips");
    });

    it("paginates client-side filtered results", async () => {
      // Create 3 articles with same tag, ask for limit=2 page=2
      const articles = [1, 2, 3].map(i => ({
        ...mockArticle,
        id: `a${i}`,
        slug: `article-${i}`,
        title: `Article ${i}`,
        tags: [{ tag: "winter" }],
      }));
      mockFetchSuccess(makePayloadResponse(articles));
      const result = await getPayloadArticlesPaginated({ tag: "winter", limit: 2, page: 2 });
      expect(result.articles).toHaveLength(1); // 3rd article on page 2
      expect(result.totalDocs).toBe(3);
      expect(result.totalPages).toBe(2);
      expect(result.hasPrevPage).toBe(true);
      expect(result.hasNextPage).toBe(false);
    });
  });

  // --- getPayloadArticleTags ---
  describe("getPayloadArticleTags", () => {
    it("returns unique sorted tags from all articles", async () => {
      const a1 = { ...mockArticle, tags: [{ tag: "winter" }, { tag: "safety" }] };
      const a2: PayloadArticle = {
        ...mockArticle,
        id: "a2",
        slug: "article-2",
        title: "Article 2",
        previewText: "Text",
        tags: [{ tag: "safety" }, { tag: "summer" }],
        createdAt: "2024-02-01T00:00:00.000Z",
        updatedAt: "2024-02-01T00:00:00.000Z",
      };
      // getPayloadArticleTags calls getPayloadArticles which calls getPayloadArticlesPaginated
      mockFetchSuccess(makePayloadResponse([a1, a2]));
      const tags = await getPayloadArticleTags();
      expect(tags).toEqual(["safety", "summer", "winter"]);
    });
  });

  // --- getPayloadArticleBySlug ---
  describe("getPayloadArticleBySlug", () => {
    it("returns article when found", async () => {
      mockFetchSuccess(makePayloadResponse([mockArticle]));
      const result = await getPayloadArticleBySlug("winter-tips");
      expect(result?.slug).toBe("winter-tips");
    });

    it("returns null when not found", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      const result = await getPayloadArticleBySlug("nonexistent");
      expect(result).toBeNull();
    });

    it("uses depth=2 for full population", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await getPayloadArticleBySlug("test");
      expect(getLastFetchUrl()).toContain("depth=2");
    });
  });

  // --- getPayloadDealers ---
  describe("getPayloadDealers", () => {
    it("returns dealers on success", async () => {
      mockFetchSuccess(makePayloadResponse([mockDealer]));
      const result = await getPayloadDealers();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("AutoKyiv");
    });

    it("passes city filter parameter", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await getPayloadDealers({ city: "Kyiv" });
      const url = getLastFetchUrl();
      expect(url).toContain("where%5Bcity%5D%5Bequals%5D=Kyiv");
    });

    it("passes type filter parameter", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await getPayloadDealers({ type: "official" });
      const url = getLastFetchUrl();
      expect(url).toContain("where%5Btype%5D%5Bequals%5D=official");
    });

    it("defaults to limit 200", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await getPayloadDealers();
      expect(getLastFetchUrl()).toContain("limit=200");
    });

    it("throws on server error", async () => {
      mockFetchError(500);
      await expect(getPayloadDealers()).rejects.toThrow("Payload API error: 500");
    });
  });

  // --- getPayloadTechnologies ---
  describe("getPayloadTechnologies", () => {
    it("returns technologies on success", async () => {
      mockFetchSuccess(makePayloadResponse([mockTechnology]));
      const result = await getPayloadTechnologies();
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("enliten");
    });

    it("uses limit=100", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await getPayloadTechnologies();
      expect(getLastFetchUrl()).toContain("limit=100");
    });

    it("throws on network error", async () => {
      mockFetchNetworkError();
      await expect(getPayloadTechnologies()).rejects.toThrow();
    });
  });

  // --- getPayloadVehicleFitments ---
  describe("getPayloadVehicleFitments", () => {
    it("returns fitments on success", async () => {
      mockFetchSuccess(makePayloadResponse([mockFitment]));
      const result = await getPayloadVehicleFitments();
      expect(result).toHaveLength(1);
      expect(result[0].make).toBe("Toyota");
    });

    it("passes make filter", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await getPayloadVehicleFitments({ make: "Toyota" });
      expect(getLastFetchUrl()).toContain("where%5Bmake%5D%5Bequals%5D=Toyota");
    });

    it("passes model filter", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await getPayloadVehicleFitments({ model: "Camry" });
      expect(getLastFetchUrl()).toContain("where%5Bmodel%5D%5Bequals%5D=Camry");
    });

    it("passes year range filter for yearFrom/yearTo", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await getPayloadVehicleFitments({ year: 2022 });
      const url = getLastFetchUrl();
      expect(url).toContain("yearFrom");
      expect(url).toContain("yearTo");
      expect(url).toContain("2022");
    });

    it("uses limit=100", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      await getPayloadVehicleFitments();
      expect(getLastFetchUrl()).toContain("limit=100");
    });
  });

  // --- getPayloadVehicleFitmentByCarParams ---
  describe("getPayloadVehicleFitmentByCarParams", () => {
    it("returns first matching fitment", async () => {
      mockFetchSuccess(makePayloadResponse([mockFitment]));
      const result = await getPayloadVehicleFitmentByCarParams("Toyota", "Camry", 2022);
      expect(result).not.toBeNull();
      expect(result!.make).toBe("Toyota");
    });

    it("returns null when no fitment matches", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      const result = await getPayloadVehicleFitmentByCarParams("Unknown", "Model", 2020);
      expect(result).toBeNull();
    });
  });

  // --- getSeasonalContent ---
  describe("getSeasonalContent", () => {
    it("returns CMS data when available (promoTitle/promoSubtitle)", async () => {
      mockFetchSuccess(makePayloadResponse([mockSeasonalContent]));
      const result = await getSeasonalContent();
      expect(result.promoTitle).toBe("Зимові шини Bridgestone");
      expect(result.promoSubtitle).toBe("Безпека взимку");
      expect(result.featuredSeason).toBe("winter");
      expect(result.ctaText).toBe("Зимові моделі");
      expect(result.gradient).toBe("from-blue-800 to-blue-900");
    });

    it("includes date-range parameters in query URL", async () => {
      mockFetchSuccess(makePayloadResponse([mockSeasonalContent]));
      await getSeasonalContent();
      const url = getLastFetchUrl();
      expect(url).toContain("startDate");
      expect(url).toContain("less_than_equal");
      expect(url).toContain("endDate");
      expect(url).toContain("greater_than_equal");
      expect(url).toContain("sort=-startDate");
    });

    it("returns fallback content when CMS returns no docs", async () => {
      mockFetchSuccess(makePayloadResponse([]));
      const result = await getSeasonalContent();
      expect(result.promoTitle).toBeTruthy();
      expect(result.promoSubtitle).toBeTruthy();
      expect(result.ctaText).toBeTruthy();
      expect(result.ctaLink).toBeTruthy();
    });

    it("returns fallback content on network error", async () => {
      mockFetchNetworkError();
      const result = await getSeasonalContent();
      expect(result.promoSubtitle).toBeTruthy();
      expect(result.gradient).toBe("from-stone-800 to-stone-900");
    });

    it("returns fallback content on API error", async () => {
      mockFetchError(500);
      const result = await getSeasonalContent();
      expect(result.promoTitle).toBeTruthy();
    });
  });

  // --- transformPayloadTyre ---
  describe("transformPayloadTyre", () => {
    it("transforms tyre data with all fields", () => {
      const result = transformPayloadTyre(mockTyre);
      expect(result.slug).toBe("turanza-t005");
      expect(result.name).toBe("Turanza T005");
      expect(result.brand).toBe("bridgestone");
      expect(result.season).toBe("summer");
      expect(result.isNew).toBe(true);
      expect(result.isPopular).toBe(true);
      expect(result.sizes).toHaveLength(1);
      expect(result.technologies).toEqual(["enliten"]);
      expect(result.keyBenefits).toEqual(["Long tread life"]);
      expect(result.faqs).toEqual([{ question: "Is it good?", answer: "Yes" }]);
      expect(result.badges).toHaveLength(1);
    });

    it("converts usage numbers to booleans", () => {
      const result = transformPayloadTyre(mockTyre);
      expect(result.usage).toEqual({
        city: true,
        highway: true,
        offroad: false,
        winter: false,
      });
    });

    it("generates correct image URL for relative paths", () => {
      const result = transformPayloadTyre(mockTyre);
      expect(result.imageUrl).toContain("/media/turanza.jpg");
    });

    it("uses absolute URL for images that already have http", () => {
      const tyreWithAbsUrl: PayloadTyre = {
        ...mockTyre,
        image: { id: "img1", url: "https://cdn.example.com/img.jpg" },
      };
      const result = transformPayloadTyre(tyreWithAbsUrl);
      expect(result.imageUrl).toBe("https://cdn.example.com/img.jpg");
    });

    it("uses placeholder when no image", () => {
      const tyreNoImage: PayloadTyre = { ...mockTyre, image: undefined };
      const result = transformPayloadTyre(tyreNoImage);
      expect(result.imageUrl).toBe("/images/tire-placeholder.svg");
    });

    it("handles missing usage gracefully", () => {
      const tyreNoUsage: PayloadTyre = { ...mockTyre, usage: undefined };
      const result = transformPayloadTyre(tyreNoUsage);
      expect(result.usage).toEqual({});
    });

    it("handles missing technologies", () => {
      const tyreNoTech: PayloadTyre = { ...mockTyre, technologies: undefined };
      const result = transformPayloadTyre(tyreNoTech);
      expect(result.technologies).toEqual([]);
    });

    it("defaults brand to bridgestone when undefined", () => {
      const tyreNoBrand: PayloadTyre = { ...mockTyre, brand: undefined };
      const result = transformPayloadTyre(tyreNoBrand);
      expect(result.brand).toBe("bridgestone");
    });

    it("parses string id to number", () => {
      const result = transformPayloadTyre(mockTyre);
      expect(typeof result.id).toBe("number");
    });
  });

  // --- transformPayloadArticle ---
  describe("transformPayloadArticle", () => {
    it("transforms article data correctly", () => {
      const result = transformPayloadArticle(mockArticle);
      expect(result.slug).toBe("winter-tips");
      expect(result.title).toBe("Winter Driving Tips");
      expect(result.previewText).toBe("How to drive safely in winter");
      expect(result.tags).toEqual(["winter", "safety"]);
      expect(result.readingTimeMinutes).toBe(5);
      expect(result.publishedAt).toBe("2024-01-15T00:00:00.000Z");
    });

    it("handles missing tags", () => {
      const articleNoTags: PayloadArticle = { ...mockArticle, tags: undefined };
      const result = transformPayloadArticle(articleNoTags);
      expect(result.tags).toEqual([]);
    });

    it("defaults readingTimeMinutes to 5 when missing", () => {
      const articleNoTime: PayloadArticle = { ...mockArticle, readingTimeMinutes: undefined };
      const result = transformPayloadArticle(articleNoTime);
      expect(result.readingTimeMinutes).toBe(5);
    });

    it("passes body as content", () => {
      const articleWithBody: PayloadArticle = { ...mockArticle, body: { root: { children: [] } } };
      const result = transformPayloadArticle(articleWithBody);
      expect(result.content).toEqual({ root: { children: [] } });
    });
  });
});
