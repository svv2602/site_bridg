# Phase 5: Frontend Integration

## Status
- [ ] Not Started
- [ ] In Progress
- [ ] Completed

**Started:** -
**Completed:** -

## Goal

Integrate generated content into frontend pages: FAQ sections, test results, seasonal hero.

## Prerequisites

- Phase 1-4 completed
- Badge, EuLabelBadge, TechnologyIcon components exist
- FuelCalculator component exists
- Comparison pages exist

---

## Tasks

### 5.1 Add FAQ Section to Tire Page

- [ ] Create `frontend/src/components/FAQSection.tsx`
- [ ] Add FAQ data type to `frontend/src/lib/data.ts`
- [ ] Integrate FAQ section into `/shyny/[slug]/page.tsx`
- [ ] Add Schema.org FAQPage structured data
- [ ] Style FAQ as accordion (expand/collapse)

**Files:**
- `frontend/src/components/FAQSection.tsx` (new)
- `frontend/src/app/shyny/[slug]/page.tsx` (update)
- `frontend/src/lib/data.ts` (update)

**FAQ Data Type:**
```typescript
interface FAQ {
  question: string;
  answer: string;
}

interface TyreModel {
  // ... existing fields
  faqs?: FAQ[];
}
```

**FAQSection Component:**
```tsx
// frontend/src/components/FAQSection.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  tireName: string;
}

export function FAQSection({ faqs, tireName }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">
        Часті питання про {tireName}
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-border rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-4 py-3 flex items-center justify-between text-left bg-card hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {openIndex === index && (
              <div className="px-4 py-3 bg-muted/20 border-t border-border">
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
```

**Schema.org FAQPage:**
```tsx
// Add to /shyny/[slug]/page.tsx
import { FAQSection } from '@/components/FAQSection';

// In generateMetadata or page component:
const faqSchema = tyre.faqs && tyre.faqs.length > 0 ? {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": tyre.faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
} : null;

// In page JSX:
{faqSchema && (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
  />
)}

{tyre.faqs && <FAQSection faqs={tyre.faqs} tireName={tyre.name} />}
```

**Verification:**
- [ ] FAQ section renders on tire page
- [ ] Accordion expands/collapses
- [ ] Schema.org JSON-LD present in page source
- [ ] Google Rich Results Test passes

---

### 5.2 Add Seasonal Hero to Homepage

- [ ] Create `frontend/src/components/SeasonalHero.tsx`
- [ ] Create API route `frontend/src/app/api/seasonal/route.ts`
- [ ] Update homepage to use seasonal content
- [ ] Add seasonal gradient backgrounds
- [ ] Show season-appropriate featured tires

**Files:**
- `frontend/src/components/SeasonalHero.tsx` (new)
- `frontend/src/app/api/seasonal/route.ts` (new)
- `frontend/src/app/page.tsx` (update)

**Seasonal Config (reference):**
```typescript
// From backend/content-automation/src/config/seasonal.ts
const seasonalConfig = {
  spring: {  // March-April
    heroTitle: 'Час переходити на літні шини',
    heroSubtitle: 'Температура стабільно вище +7°C — оптимальний час для заміни',
    featuredSeason: 'summer',
    gradient: 'from-orange-500 to-yellow-500'
  },
  autumn: {  // October-November
    heroTitle: 'Готуйтесь до зими завчасно',
    heroSubtitle: 'Перші заморозки вже близько — оберіть надійні зимові шини',
    featuredSeason: 'winter',
    gradient: 'from-blue-500 to-cyan-400'
  },
  default: {
    heroTitle: 'Шини Bridgestone',
    heroSubtitle: 'Офіційний представник в Україні',
    featuredSeason: null,
    gradient: 'from-zinc-800 to-zinc-900'
  }
};
```

**API Route:**
```typescript
// frontend/src/app/api/seasonal/route.ts
import { NextResponse } from 'next/server';

function getCurrentSeason(): 'spring' | 'autumn' | 'default' {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 4) return 'spring';
  if (month >= 10 && month <= 11) return 'autumn';
  return 'default';
}

const seasonalConfig = {
  spring: {
    heroTitle: 'Час переходити на літні шини',
    heroSubtitle: 'Температура стабільно вище +7°C — оптимальний час для заміни',
    featuredSeason: 'summer',
    gradient: 'from-orange-500 to-yellow-500',
    ctaText: 'Переглянути літні шини',
    ctaLink: '/passenger-tyres?season=summer'
  },
  autumn: {
    heroTitle: 'Готуйтесь до зими завчасно',
    heroSubtitle: 'Перші заморозки вже близько — оберіть надійні зимові шини',
    featuredSeason: 'winter',
    gradient: 'from-blue-500 to-cyan-400',
    ctaText: 'Переглянути зимові шини',
    ctaLink: '/passenger-tyres?season=winter'
  },
  default: {
    heroTitle: 'Шини Bridgestone',
    heroSubtitle: 'Офіційний представник в Україні',
    featuredSeason: null,
    gradient: 'from-zinc-800 to-zinc-900',
    ctaText: 'Переглянути каталог',
    ctaLink: '/passenger-tyres'
  }
};

export async function GET() {
  const season = getCurrentSeason();
  return NextResponse.json(seasonalConfig[season]);
}
```

**SeasonalHero Component:**
```tsx
// frontend/src/components/SeasonalHero.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SeasonalData {
  heroTitle: string;
  heroSubtitle: string;
  featuredSeason: string | null;
  gradient: string;
  ctaText: string;
  ctaLink: string;
}

export function SeasonalHero() {
  const [data, setData] = useState<SeasonalData | null>(null);

  useEffect(() => {
    fetch('/api/seasonal')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    // Default fallback while loading
    return (
      <section className="bg-gradient-to-br from-zinc-800 to-zinc-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Шини Bridgestone
          </h1>
          <p className="text-xl text-zinc-300">
            Офіційний представник в Україні
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-gradient-to-br ${data.gradient} py-20`}>
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {data.heroTitle}
        </h1>
        <p className="text-xl text-white/90 mb-8">
          {data.heroSubtitle}
        </p>
        <Link
          href={data.ctaLink}
          className="inline-block bg-white text-zinc-900 px-8 py-3 rounded-lg font-semibold hover:bg-zinc-100 transition-colors"
        >
          {data.ctaText}
        </Link>
      </div>
    </section>
  );
}
```

**Verification:**
- [ ] API route returns correct seasonal data
- [ ] Hero changes based on current month
- [ ] Gradient colors match season
- [ ] CTA links to correct filtered catalog

---

### 5.3 Add Test Results Section to Tire Page

- [ ] Create `frontend/src/components/TestResultCard.tsx`
- [ ] Create `frontend/src/components/TestResultsSection.tsx`
- [ ] Add TestResult type to `frontend/src/lib/data.ts`
- [ ] Integrate into `/shyny/[slug]/page.tsx`
- [ ] Add source logos (ADAC, AutoBild)

**Files:**
- `frontend/src/components/TestResultCard.tsx` (new)
- `frontend/src/components/TestResultsSection.tsx` (new)
- `frontend/src/lib/data.ts` (update)
- `frontend/src/app/shyny/[slug]/page.tsx` (update)
- `frontend/public/images/logos/` (add logos)

**TestResult Type:**
```typescript
// frontend/src/lib/data.ts
interface TestResult {
  id: string;
  source: 'adac' | 'autobild' | 'tyrereviews' | 'tcs';
  testType: 'summer' | 'winter' | 'allseason';
  year: number;
  testedSize: string;
  position: number;
  totalTested: number;
  rating: string;
  ratingNumeric: number;
  articleSlug?: string;
  sourceUrl?: string;
}

interface TyreModel {
  // ... existing fields
  testResults?: TestResult[];
}
```

**TestResultCard Component:**
```tsx
// frontend/src/components/TestResultCard.tsx
import Image from 'next/image';
import Link from 'next/link';

interface TestResultCardProps {
  result: TestResult;
}

const sourceLogos: Record<string, string> = {
  adac: '/images/logos/adac.svg',
  autobild: '/images/logos/autobild.svg',
  tyrereviews: '/images/logos/tyrereviews.svg',
  tcs: '/images/logos/tcs.svg'
};

const testTypeLabels: Record<string, string> = {
  summer: 'Літні шини',
  winter: 'Зимові шини',
  allseason: 'Всесезонні шини'
};

export function TestResultCard({ result }: TestResultCardProps) {
  const isGood = result.ratingNumeric <= 2.5;

  return (
    <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card">
      {/* Source Logo */}
      <div className="flex-shrink-0 w-16">
        <Image
          src={sourceLogos[result.source]}
          alt={result.source.toUpperCase()}
          width={60}
          height={40}
          className="object-contain"
        />
      </div>

      {/* Test Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold">
          {testTypeLabels[result.testType]} {result.year}
        </div>
        <div className="text-sm text-muted-foreground">
          Розмір: {result.testedSize}
        </div>
      </div>

      {/* Position */}
      <div className="text-center px-4">
        <div className="text-2xl font-bold">
          {result.position}
          <span className="text-sm font-normal text-muted-foreground">
            /{result.totalTested}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">місце</div>
      </div>

      {/* Rating */}
      <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
        isGood
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
      }`}>
        {result.rating}
      </div>

      {/* Link */}
      {result.articleSlug && (
        <Link
          href={`/advice/${result.articleSlug}`}
          className="text-primary hover:underline text-sm whitespace-nowrap"
        >
          Детальніше →
        </Link>
      )}
    </div>
  );
}
```

**TestResultsSection Component:**
```tsx
// frontend/src/components/TestResultsSection.tsx
import { TestResultCard } from './TestResultCard';

interface TestResultsSectionProps {
  results: TestResult[];
  tireName: string;
}

export function TestResultsSection({ results, tireName }: TestResultsSectionProps) {
  if (!results || results.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">
        Результати незалежних тестів
      </h2>
      <p className="text-muted-foreground mb-6">
        {tireName} у тестах провідних автомобільних організацій
      </p>

      <div className="space-y-3">
        {results.map((result) => (
          <TestResultCard key={result.id} result={result} />
        ))}
      </div>
    </section>
  );
}
```

**Verification:**
- [ ] Test results section renders when data exists
- [ ] Source logos display correctly
- [ ] Position and rating styled appropriately
- [ ] Links to articles work

---

### 5.4 Download/Create Source Logos

- [ ] Download or create ADAC logo (`/images/logos/adac.svg`)
- [ ] Download or create AutoBild logo (`/images/logos/autobild.svg`)
- [ ] Download or create TyreReviews logo (`/images/logos/tyrereviews.svg`)
- [ ] Download or create TCS logo (`/images/logos/tcs.svg`)

**Directory:**
```
frontend/public/images/logos/
├── adac.svg
├── autobild.svg
├── tyrereviews.svg
└── tcs.svg
```

**Note:** Use official logos or create simple text-based placeholders. Ensure proper licensing.

**Verification:**
- [ ] All logos exist in correct directory
- [ ] Logos render correctly at 60x40px
- [ ] Dark mode compatibility (if needed)

---

### 5.5 Update Strapi API Integration for New Fields

- [ ] Update `frontend/src/lib/api/strapi.ts` to fetch FAQ
- [ ] Update `frontend/src/lib/api/strapi.ts` to fetch test results
- [ ] Add fallback to mock data if fields missing
- [ ] Update transformStrapiData function

**Files:**
- `frontend/src/lib/api/strapi.ts` (update)

**Updates to strapi.ts:**
```typescript
// Add to populate query
const tyrePopulate = {
  populate: {
    sizes: true,
    euLabel: true,
    usage: true,
    technologies: true,
    badges: true,      // Added in Phase 2
    faqs: true,        // New
    testResults: true  // New
  }
};

// Update transform function
function transformStrapiTyre(strapiTyre: any): TyreModel {
  return {
    // ... existing fields
    faqs: strapiTyre.attributes.faqs || [],
    testResults: strapiTyre.attributes.testResults || [],
  };
}
```

**Verification:**
- [ ] FAQ data fetched from Strapi
- [ ] Test results fetched from Strapi
- [ ] Falls back gracefully when data missing

---

## Completion Checklist

Before marking this phase complete:

1. [ ] All 5 tasks completed
2. [ ] FAQ section working with Schema.org
3. [ ] Seasonal hero changes by month
4. [ ] Test results display on tire page
5. [ ] All logos present
6. [ ] Strapi integration updated
7. [ ] Visual testing on desktop and mobile
8. [ ] Commit changes:
   ```bash
   git add .
   git commit -m "feat(frontend): add FAQ, seasonal hero, test results sections

   - Add FAQSection component with Schema.org FAQPage
   - Add SeasonalHero with dynamic content API
   - Add TestResultsSection and TestResultCard
   - Add test source logos
   - Update Strapi API integration"
   ```
9. [ ] Update PROGRESS.md
