// Schema.org structured data generators for SEO

import type { TyreModel, Dealer, Article, Season, FAQ } from "./data";

const seasonLabels: Record<Season, string> = {
  summer: "Літні шини",
  winter: "Зимові шини",
  allseason: "Всесезонні шини",
};

// Product schema for tyre models
export function generateProductSchema(tyre: TyreModel, baseUrl: string = "https://bridgestone.ua") {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tyre.name,
    description: tyre.shortDescription,
    brand: {
      "@type": "Brand",
      name: "Bridgestone",
    },
    category: `${seasonLabels[tyre.season]} > Шини`,
    url: `${baseUrl}/shyny/${tyre.slug}`,
    offers: {
      "@type": "AggregateOffer",
      availability: "https://schema.org/InStock",
      priceCurrency: "UAH",
    },
    ...(tyre.euLabel && {
      additionalProperty: [
        tyre.euLabel.wetGrip && {
          "@type": "PropertyValue",
          name: "Зчеплення на мокрій дорозі",
          value: tyre.euLabel.wetGrip,
        },
        tyre.euLabel.fuelEfficiency && {
          "@type": "PropertyValue",
          name: "Економія пального",
          value: tyre.euLabel.fuelEfficiency,
        },
        tyre.euLabel.noiseDb && {
          "@type": "PropertyValue",
          name: "Рівень шуму",
          value: `${tyre.euLabel.noiseDb} dB`,
        },
      ].filter(Boolean),
    }),
  };
}

// LocalBusiness schema for dealers
export function generateLocalBusinessSchema(dealer: Dealer, baseUrl: string = "https://bridgestone.ua") {
  return {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    name: dealer.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: dealer.address,
      addressLocality: dealer.city,
      addressCountry: "UA",
    },
    ...(dealer.latitude && dealer.longitude && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: dealer.latitude,
        longitude: dealer.longitude,
      },
    }),
    ...(dealer.phone && { telephone: dealer.phone }),
    ...(dealer.website && { url: dealer.website }),
    ...(dealer.workingHours && { openingHours: dealer.workingHours }),
    parentOrganization: {
      "@type": "Organization",
      name: "Bridgestone Ukraine",
      url: baseUrl,
    },
  };
}

// Article schema for blog posts
export function generateArticleSchema(article: Article, baseUrl: string = "https://bridgestone.ua") {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.previewText,
    url: `${baseUrl}/advice/${article.slug}`,
    ...(article.publishedAt && { datePublished: article.publishedAt }),
    author: {
      "@type": "Organization",
      name: "Bridgestone Ukraine",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Bridgestone Ukraine",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/images/logo.png`,
      },
    },
  };
}

// BreadcrumbList schema
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// FAQPage schema for FAQ sections
export function generateFAQSchema(faqs: FAQ[]) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Organization schema for the main site
export function generateOrganizationSchema(baseUrl: string = "https://bridgestone.ua") {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Bridgestone Ukraine",
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    sameAs: [
      "https://www.facebook.com/BridgestoneUkraine",
      "https://www.instagram.com/bridgestone_ukraine",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+380-800-123-456",
      contactType: "customer service",
      availableLanguage: ["Ukrainian"],
    },
  };
}

// Helper to render JSON-LD script tag content
export function jsonLdScript(schema: object): string {
  return JSON.stringify(schema);
}
