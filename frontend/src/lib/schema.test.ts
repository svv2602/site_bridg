import { describe, it, expect } from "vitest";
import {
  generateProductSchema,
  generateLocalBusinessSchema,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  generateAggregateRatingSchema,
  generateReviewSchema,
  generateProductSchemaWithReviews,
  jsonLdScript,
} from "./schema";
import type { TyreModel, Dealer, Article, FAQ } from "./data";

// ---- fixtures ----

const baseTyre: TyreModel = {
  slug: "turanza-t005",
  name: "Turanza T005",
  brand: "bridgestone",
  season: "summer",
  vehicleTypes: ["passenger"],
  shortDescription: "Premium touring tyre",
  sizes: [{ width: 205, aspectRatio: 55, diameter: 16 }],
  usage: { city: true, highway: true },
};

const tyreWithEuLabel: TyreModel = {
  ...baseTyre,
  euLabel: { wetGrip: "A", fuelEfficiency: "B", noiseDb: 70 },
};

const dealer: Dealer = {
  id: "1",
  name: "AutoKyiv",
  type: "official",
  city: "Kyiv",
  address: "Khreschatyk 1",
  latitude: 50.45,
  longitude: 30.52,
  phone: "+380441234567",
  website: "https://autokyiv.ua",
  workingHours: "Mo-Fr 09:00-18:00",
};

const article: Article = {
  slug: "winter-tips",
  title: "Winter Driving Tips",
  previewText: "How to drive safely in winter",
  publishedAt: "2026-01-15T10:00:00Z",
};

const faqs: FAQ[] = [
  { question: "What size?", answer: "Check your sidewall." },
  { question: "How often to rotate?", answer: "Every 10,000 km." },
];

// ---- Product schema ----

describe("generateProductSchema", () => {
  it("generates valid Product schema", () => {
    const schema = generateProductSchema(baseTyre);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Product");
    expect(schema.name).toBe("Turanza T005");
    expect(schema.description).toBe("Premium touring tyre");
    expect(schema.brand.name).toBe("Bridgestone");
    expect(schema.url).toBe("https://bridgestone.org.ua/shyny/turanza-t005");
  });

  it("uses custom baseUrl", () => {
    const schema = generateProductSchema(baseTyre, "https://example.com");
    expect(schema.url).toBe("https://example.com/shyny/turanza-t005");
  });

  it("includes EU label additional properties", () => {
    const schema = generateProductSchema(tyreWithEuLabel);
    expect(schema.additionalProperty).toBeDefined();
    expect(schema.additionalProperty).toHaveLength(3);
    expect(schema.additionalProperty![0].value).toBe("A");
    expect(schema.additionalProperty![2].value).toBe("70 dB");
  });

  it("excludes additionalProperty when no euLabel", () => {
    const schema = generateProductSchema(baseTyre);
    expect(schema.additionalProperty).toBeUndefined();
  });

  it("includes season in category", () => {
    const schema = generateProductSchema(baseTyre);
    expect(schema.category).toContain("Літні шини");
  });

  it("handles winter season", () => {
    const winterTyre = { ...baseTyre, season: "winter" as const };
    const schema = generateProductSchema(winterTyre);
    expect(schema.category).toContain("Зимові шини");
  });
});

// ---- LocalBusiness schema ----

describe("generateLocalBusinessSchema", () => {
  it("generates valid AutoPartsStore schema", () => {
    const schema = generateLocalBusinessSchema(dealer);

    expect(schema["@type"]).toBe("AutoPartsStore");
    expect(schema.name).toBe("AutoKyiv");
    expect(schema.address.streetAddress).toBe("Khreschatyk 1");
    expect(schema.address.addressLocality).toBe("Kyiv");
    expect(schema.address.addressCountry).toBe("UA");
  });

  it("includes geo coordinates when present", () => {
    const schema = generateLocalBusinessSchema(dealer);
    expect(schema.geo).toBeDefined();
    expect(schema.geo!.latitude).toBe(50.45);
    expect(schema.geo!.longitude).toBe(30.52);
  });

  it("excludes geo when coordinates are missing", () => {
    const dealerNoGeo: Dealer = { ...dealer, latitude: undefined, longitude: undefined };
    const schema = generateLocalBusinessSchema(dealerNoGeo);
    expect(schema.geo).toBeUndefined();
  });

  it("includes optional fields when present", () => {
    const schema = generateLocalBusinessSchema(dealer);
    expect(schema.telephone).toBe("+380441234567");
    expect(schema.url).toBe("https://autokyiv.ua");
    expect(schema.openingHours).toBe("Mo-Fr 09:00-18:00");
  });

  it("excludes optional fields when missing", () => {
    const minimalDealer: Dealer = {
      id: "2",
      name: "Basic",
      type: "partner",
      city: "Lviv",
      address: "Main St 1",
    };
    const schema = generateLocalBusinessSchema(minimalDealer);
    expect(schema.telephone).toBeUndefined();
    expect(schema.url).toBeUndefined();
    expect(schema.openingHours).toBeUndefined();
  });

  it("includes parent organization", () => {
    const schema = generateLocalBusinessSchema(dealer);
    expect(schema.parentOrganization.name).toBe("Bridgestone Ukraine");
  });
});

// ---- Article schema ----

describe("generateArticleSchema", () => {
  it("generates valid Article schema", () => {
    const schema = generateArticleSchema(article);

    expect(schema["@type"]).toBe("Article");
    expect(schema.headline).toBe("Winter Driving Tips");
    expect(schema.description).toBe("How to drive safely in winter");
    expect(schema.url).toBe("https://bridgestone.org.ua/blog/winter-tips");
  });

  it("includes datePublished when available", () => {
    const schema = generateArticleSchema(article);
    expect(schema.datePublished).toBe("2026-01-15T10:00:00Z");
  });

  it("excludes datePublished when not available", () => {
    const noDatedArticle: Article = { ...article, publishedAt: undefined };
    const schema = generateArticleSchema(noDatedArticle);
    expect(schema.datePublished).toBeUndefined();
  });

  it("has author and publisher", () => {
    const schema = generateArticleSchema(article);
    expect(schema.author.name).toBe("Bridgestone Ukraine");
    expect(schema.publisher.name).toBe("Bridgestone Ukraine");
    expect(schema.publisher.logo.url).toContain("logo.png");
  });
});

// ---- Breadcrumb schema ----

describe("generateBreadcrumbSchema", () => {
  it("generates breadcrumb list with correct positions", () => {
    const items = [
      { name: "Home", url: "https://bridgestone.org.ua" },
      { name: "Tyres", url: "https://bridgestone.org.ua/shyny" },
      { name: "Turanza T005", url: "https://bridgestone.org.ua/shyny/turanza-t005" },
    ];
    const schema = generateBreadcrumbSchema(items);

    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[1].position).toBe(2);
    expect(schema.itemListElement[2].position).toBe(3);
    expect(schema.itemListElement[2].name).toBe("Turanza T005");
  });

  it("handles empty items array", () => {
    const schema = generateBreadcrumbSchema([]);
    expect(schema.itemListElement).toHaveLength(0);
  });
});

// ---- FAQ schema ----

describe("generateFAQSchema", () => {
  it("generates FAQPage schema", () => {
    const schema = generateFAQSchema(faqs);

    expect(schema).not.toBeNull();
    expect(schema!["@type"]).toBe("FAQPage");
    expect(schema!.mainEntity).toHaveLength(2);
    expect(schema!.mainEntity[0]["@type"]).toBe("Question");
    expect(schema!.mainEntity[0].name).toBe("What size?");
    expect(schema!.mainEntity[0].acceptedAnswer.text).toBe("Check your sidewall.");
  });

  it("returns null for empty faqs array", () => {
    expect(generateFAQSchema([])).toBeNull();
  });

  it("returns null for null/undefined input", () => {
    expect(generateFAQSchema(null as unknown as FAQ[])).toBeNull();
    expect(generateFAQSchema(undefined as unknown as FAQ[])).toBeNull();
  });
});

// ---- Organization schema ----

describe("generateOrganizationSchema", () => {
  it("generates valid Organization schema", () => {
    const schema = generateOrganizationSchema();

    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("Bridgestone Україна");
    expect(schema.url).toBe("https://bridgestone.org.ua");
    expect(schema.sameAs).toContain("https://www.facebook.com/BridgestoneUkraine");
    expect(schema.contactPoint.contactType).toBe("customer service");
  });

  it("uses custom baseUrl", () => {
    const schema = generateOrganizationSchema("https://test.com");
    expect(schema.url).toBe("https://test.com");
  });
});

// ---- AggregateRating schema ----

describe("generateAggregateRatingSchema", () => {
  it("generates rating schema with correct values", () => {
    const schema = generateAggregateRatingSchema({ totalCount: 42, averageRating: 4.3 });

    expect(schema).not.toBeNull();
    expect(schema!["@type"]).toBe("AggregateRating");
    expect(schema!.ratingValue).toBe(4.3);
    expect(schema!.reviewCount).toBe(42);
    expect(schema!.bestRating).toBe(5);
    expect(schema!.worstRating).toBe(1);
  });

  it("returns null for zero reviews", () => {
    expect(generateAggregateRatingSchema({ totalCount: 0, averageRating: 0 })).toBeNull();
  });

  it("returns null for null input", () => {
    expect(generateAggregateRatingSchema(null as unknown as { totalCount: number; averageRating: number })).toBeNull();
  });
});

// ---- Review schema ----

describe("generateReviewSchema", () => {
  const review = {
    id: 1,
    authorName: "Ivan",
    rating: 5,
    title: "Great tyre",
    content: "Very good grip on wet roads",
    createdAt: "2026-01-20",
  };

  it("generates valid Review schema", () => {
    const schema = generateReviewSchema(review);

    expect(schema["@type"]).toBe("Review");
    expect(schema.reviewRating.ratingValue).toBe(5);
    expect(schema.author.name).toBe("Ivan");
    expect(schema.reviewBody).toBe("Very good grip on wet roads");
    expect(schema.name).toBe("Great tyre");
    expect(schema.datePublished).toBe("2026-01-20");
  });

  it("excludes datePublished when createdAt is missing", () => {
    const noDateReview = { ...review, createdAt: undefined };
    const schema = generateReviewSchema(noDateReview);
    expect(schema.datePublished).toBeUndefined();
  });
});

// ---- ProductSchemaWithReviews ----

describe("generateProductSchemaWithReviews", () => {
  const reviews = [
    { id: 1, authorName: "A", rating: 5, title: "T1", content: "C1" },
    { id: 2, authorName: "B", rating: 4, title: "T2", content: "C2" },
  ];
  const stats = { totalCount: 2, averageRating: 4.5 };

  it("includes aggregateRating and reviews", () => {
    const schema = generateProductSchemaWithReviews(baseTyre, reviews, stats);

    expect(schema.aggregateRating).toBeDefined();
    expect(schema.aggregateRating!.ratingValue).toBe(4.5);
    expect(schema.review).toHaveLength(2);
  });

  it("limits reviews to 5", () => {
    const manyReviews = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      authorName: `User${i}`,
      rating: 4,
      title: `Title${i}`,
      content: `Content${i}`,
    }));
    const manyStats = { totalCount: 10, averageRating: 4.0 };
    const schema = generateProductSchemaWithReviews(baseTyre, manyReviews, manyStats);
    expect(schema.review).toHaveLength(5);
  });

  it("excludes reviews section when empty", () => {
    const schema = generateProductSchemaWithReviews(baseTyre, [], stats);
    expect(schema.review).toBeUndefined();
  });

  it("excludes aggregateRating when zero reviews in stats", () => {
    const schema = generateProductSchemaWithReviews(baseTyre, [], { totalCount: 0, averageRating: 0 });
    expect(schema.aggregateRating).toBeUndefined();
  });

  it("includes image when imageUrl is present", () => {
    const tyreWithImage = { ...baseTyre, imageUrl: "/images/turanza.jpg" };
    const schema = generateProductSchemaWithReviews(tyreWithImage, [], stats);
    expect(schema.image).toBe("https://bridgestone.org.ua/images/turanza.jpg");
  });

  it("handles absolute image URLs", () => {
    const tyreWithAbsImage = { ...baseTyre, imageUrl: "https://cdn.example.com/img.jpg" };
    const schema = generateProductSchemaWithReviews(tyreWithAbsImage, [], stats);
    expect(schema.image).toBe("https://cdn.example.com/img.jpg");
  });
});

// ---- jsonLdScript helper ----

describe("jsonLdScript", () => {
  it("serializes schema to JSON string", () => {
    const schema = { "@type": "Product", name: "Test" };
    const result = jsonLdScript(schema);
    expect(result).toBe('{"@type":"Product","name":"Test"}');
  });
});
