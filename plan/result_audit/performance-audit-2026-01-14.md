# Performance Audit Report
## Bridgestone Ukraine Website
**Date:** 2026-01-14
**Auditor:** Claude (Performance Engineer)
**Framework:** Next.js 16.1.1, React 19, Tailwind CSS v4

---

## Executive Summary

Website has solid architectural foundation with Next.js App Router and modern tooling. However, several optimization opportunities exist that could significantly improve Core Web Vitals:

| Area | Current State | Priority | Impact |
|------|---------------|----------|--------|
| Image Optimization | PNG files, no WebP/AVIF | HIGH | LCP -30-40% |
| JavaScript Bundle | framer-motion loaded eagerly | HIGH | TBT -20-30% |
| CSS Size | 1587 lines, no code splitting | MEDIUM | FCP -10-15% |
| API Caching | 60s revalidation | MEDIUM | TTFB -20-40% |
| Third-party Scripts | After-interactive loading | LOW | Already optimized |

**Expected overall improvement:** 25-40% better LCP, 20-30% better TBT/INP

---

## 1. Core Web Vitals Analysis

### 1.1 Largest Contentful Paint (LCP)

**Current Issues:**

| Issue | Location | Impact |
|-------|----------|--------|
| Hero images in PNG format | `/public/images/hero/*.png` | +150-200ms |
| No AVIF/WebP srcset | `SeasonalHero.tsx` | +100-150ms |
| Large image file sizes (125-186KB) | Hero images | +200-300ms on 3G |

**Technical Details:**
```
turanza-hero.png:            PNG 463x463, 127KB
blizzak-hero.png:            PNG 463x463, 153KB
turanza-all-season-hero.png: PNG 463x463, 186KB
```

**Solutions:**
1. Convert to WebP/AVIF format (expected: 30-50KB each)
2. Add responsive srcset for different viewport sizes
3. Consider using `next/image` with built-in optimization

**Expected Impact:** LCP improvement of 300-500ms

### 1.2 Cumulative Layout Shift (CLS)

**Current State:** Generally good

**Positive Findings:**
- Fixed height containers for card content (`h-[3.5rem]`, `h-[2.5rem]`)
- Image containers use `fill` with aspect ratio preservation
- Font loading via `next/font` prevents FOUT

**Minor Issues:**
| Issue | Location | CLS Impact |
|-------|----------|------------|
| Dynamic season badge loading | `SeasonalHero.tsx:74-85` | ~0.02 |
| Carousel initialization | `ProductCarousel.tsx` | ~0.01 |

### 1.3 Interaction to Next Paint (INP)

**Current Issues:**

| Issue | Component | Impact |
|-------|-----------|--------|
| framer-motion animations on page load | Multiple components | +50-100ms |
| Embla carousel initialization | `ProductCarousel.tsx` | +30-50ms |
| Google Maps API loading | `DealersMap.tsx` | +100-200ms |

---

## 2. Network Waterfall Analysis

### 2.1 Critical Rendering Path

```
Document
├── CSS (globals.css via Tailwind)  [Render-blocking]
├── JavaScript chunks               [Deferred]
│   ├── Main bundle (~200KB gzip)
│   ├── framer-motion (~40KB gzip)
│   ├── embla-carousel (~15KB gzip)
│   ├── lucide-react icons (~20KB)
│   └── @react-google-maps (~30KB)
├── Fonts (Geist Sans/Mono)         [next/font optimized]
└── Images
    └── Hero PNG (~150KB average)   [LCP candidate]
```

### 2.2 Resource Loading Priorities

| Resource | Priority | Recommendation |
|----------|----------|----------------|
| Hero image | fetchpriority="high" | Already has `priority` prop |
| Analytics | afterInteractive | Correct |
| Google Maps | dynamic import | Good, but loads all at once |
| framer-motion | eager | Should be lazy-loaded |

---

## 3. Render-Blocking Resources

### 3.1 CSS Analysis

**File:** `src/app/globals.css`
**Size:** 1587 lines

**Issues:**
| Issue | Lines | Impact |
|-------|-------|--------|
| Unused hero-dark styles on non-hero pages | 459-548 | +5KB |
| Unused prose styles on non-article pages | 1152-1527 | +15KB |
| Animation keyframes always loaded | 355-425 | +2KB |

**Solution:** Implement CSS code splitting or move page-specific styles to components

### 3.2 JavaScript Analysis

**Issue:** No dynamic imports for heavy components

```typescript
// Current (eager loading)
import { motion } from 'framer-motion';

// Recommended (lazy loading)
const motion = dynamic(() => import('framer-motion').then(m => m.motion), {
  ssr: false
});
```

---

## 4. JavaScript Execution Time

### 4.1 Bundle Analysis

| Package | Est. Size (gzip) | Used In | Lazy-loadable |
|---------|------------------|---------|---------------|
| framer-motion | ~40KB | 9 components | YES |
| embla-carousel | ~15KB | ProductCarousel | YES |
| @react-google-maps | ~30KB | DealersMap | Already dynamic |
| lucide-react | ~20KB | All pages | Partial (tree-shaking) |

### 4.2 Component-level Analysis

**High-cost components:**

1. **SeasonalHero** - Uses framer-motion for entrance animations
   - Location: `src/components/SeasonalHero.tsx:66-156`
   - Impact: ~50ms main thread blocking

2. **AnimatedSection** - Wraps many elements with motion.div
   - Location: `src/components/AnimatedSection.tsx`
   - Impact: ~30ms per instance

3. **ProductCarousel** - Embla + autoplay initialization
   - Location: `src/components/ProductCarousel.tsx`
   - Impact: ~40ms initialization

---

## 5. CSS Coverage Analysis

### 5.1 Estimated Unused CSS

| Category | Lines | Est. Unused on Home |
|----------|-------|---------------------|
| Dark theme variants | ~200 | 0% (needed) |
| Hero styles (adaptive) | ~100 | 30% |
| Prose/article styles | ~350 | 100% |
| Button variants | ~100 | 50% |
| Form styles | ~50 | 80% |

**Total estimated unused on homepage:** ~35-40%

### 5.2 CSS Variables Overhead

```css
/* 67 CSS custom properties defined in :root */
/* Most are used, but some redundancy exists */

--stone-50 through --stone-950 (11 vars)
--color-stone-50 through --color-stone-950 (11 more vars - duplicates)
```

---

## 6. Image Optimization

### 6.1 Hero Images

| Image | Current | Optimal | Savings |
|-------|---------|---------|---------|
| turanza-hero.png | 127KB | ~25KB (AVIF) | 80% |
| blizzak-hero.png | 153KB | ~30KB (AVIF) | 80% |
| turanza-all-season-hero.png | 186KB | ~35KB (AVIF) | 81% |

**Recommended Format Stack:**
```html
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.png" alt="...">
</picture>
```

### 6.2 Product Images

**Current Implementation:** `next/image` with proper `sizes` attribute

```typescript
// TyreCard.tsx:94
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
```

**Issue:** External images from ProKoleso are not optimized
```typescript
// next.config.ts - external domains
{
  protocol: 'https',
  hostname: 'prokoleso.ua',
  pathname: '/storage/**',
}
```

**Recommendation:** Consider proxying through Next.js Image Optimization API

### 6.3 Logo Images

| Image | Format | Size | Recommendation |
|-------|--------|------|----------------|
| adac.svg | SVG | ~2KB | OK |
| autobild.svg | SVG | ~3KB | OK |
| tcs.svg | SVG | ~2KB | OK |
| tyrereviews.svg | SVG | ~2KB | OK |

---

## 7. Font Loading Strategy

### 7.1 Current Implementation

```typescript
// layout.tsx:13-21
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

**Issues:**
| Issue | Impact | Priority |
|-------|--------|----------|
| No Cyrillic subset for Ukrainian text | Fallback fonts for Ukrainian | HIGH |
| Both fonts loaded on all pages | +~50KB | MEDIUM |

### 7.2 Recommendations

```typescript
// Add Cyrillic subset
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"], // Add cyrillic
  display: "swap",
});
```

**Alternative:** Use system font stack for Cyrillic:
```css
font-family: var(--font-geist-sans), "Segoe UI", Roboto, sans-serif;
```

---

## 8. Third-Party Scripts

### 8.1 Analytics Implementation

**File:** `src/components/Analytics.tsx`

**Current (Good):**
```typescript
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
  strategy="afterInteractive"  // Correct strategy
/>
```

**Consent-aware loading:** Yes, respects cookie consent

### 8.2 Google Maps API

**File:** `src/components/DealersMap.tsx`

**Current:**
```typescript
const { isLoaded, loadError } = useJsApiLoader({
  id: "google-map-script",
  googleMapsApiKey: apiKey || "",
});
```

**Issue:** Maps API loads entire library even for placeholder
**Recommendation:** Use `loading="lazy"` iframe approach for non-interactive maps

---

## 9. Caching Strategy

### 9.1 API Caching

**Current Implementation:**
```typescript
// payload.ts:167
next: { revalidate: 60 }, // 60 second cache
```

**Issues:**
| Endpoint | Current TTL | Recommended TTL |
|----------|-------------|-----------------|
| Tyres | 60s | 3600s (1 hour) |
| Articles | 60s | 1800s (30 min) |
| Dealers | 60s | 3600s (1 hour) |
| Technologies | 60s | 86400s (24 hours) |

### 9.2 Static Generation

**Current:** Most pages use dynamic data fetching
**Recommendation:** Enable ISR with longer revalidation periods

```typescript
// Example for tyre pages
export const revalidate = 3600; // 1 hour
```

### 9.3 CDN Configuration

**Current:** No CDN headers configured
**Recommendation:** Add Cache-Control headers for static assets

```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/images/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
      ]
    }
  ]
}
```

---

## 10. Mobile vs Desktop Differences

### 10.1 Responsive Images

**Current:** Same image served to all devices
```typescript
// SeasonalHero.tsx:168
sizes="(max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
```

**Issue:** Mobile downloads larger images than needed

### 10.2 JavaScript Loading

**Current:** Same bundles for mobile and desktop
**Recommendation:** Consider reducing animations on mobile

```typescript
// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;
```

**Already implemented in CSS:**
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations disabled */
}
```

### 10.3 Touch Interactions

**Current:** Hover effects on mobile may cause 300ms delay
**Recommendation:** Add `touch-action: manipulation` where needed (already done in carousel)

---

## Problems and Solutions Table

| # | Problem | Metric Affected | Technical Cause | Solution | Expected Impact |
|---|---------|-----------------|-----------------|----------|-----------------|
| 1 | Hero images in PNG format | LCP | Unoptimized image format | Convert to WebP/AVIF, add srcset | LCP -300-500ms |
| 2 | framer-motion loaded eagerly | TBT, INP | No code splitting | Dynamic import with ssr:false | TBT -50-100ms |
| 3 | No Cyrillic font subset | CLS | Latin-only subset for Ukrainian text | Add cyrillic subset to next/font | CLS -0.05 |
| 4 | Short API cache TTL (60s) | TTFB | Aggressive revalidation | Increase to 1-24 hours based on data type | TTFB -200-400ms |
| 5 | Large CSS file always loaded | FCP | No CSS code splitting | Move prose/hero styles to components | FCP -50-100ms |
| 6 | External images not optimized | LCP | Bypass Next.js optimizer | Proxy through Image Optimization API | LCP -100-200ms |
| 7 | Embla carousel loaded eagerly | TBT | Import on page load | Dynamic import, load on viewport | TBT -40ms |
| 8 | No CDN caching headers | TTFB | Missing Cache-Control | Add headers in next.config.ts | TTFB -50-100ms |
| 9 | Google Maps full library load | TBT | Heavy API bundle | Consider Maps Embed API for simple views | TBT -100ms |
| 10 | AnimatedSection everywhere | INP | Motion wrapper overhead | Use CSS animations for simple effects | INP -30ms |

---

## Quick Wins (Can implement in 1-2 days)

### 1. Image Format Optimization
```bash
# Convert PNG to WebP/AVIF
npx sharp-cli frontend/public/images/hero/*.png -o webp -q 85
npx sharp-cli frontend/public/images/hero/*.png -o avif -q 80
```

**Effort:** 2 hours
**Impact:** HIGH (LCP -30%)

### 2. Increase API Cache TTL
```typescript
// payload.ts - change revalidation time
next: { revalidate: 3600 }, // 1 hour instead of 60s
```

**Effort:** 30 minutes
**Impact:** MEDIUM (TTFB -20%)

### 3. Add Cyrillic Font Subset
```typescript
// layout.tsx
subsets: ["latin", "cyrillic"],
```

**Effort:** 15 minutes
**Impact:** LOW-MEDIUM (eliminates fallback fonts)

### 4. Add CDN Cache Headers
```typescript
// next.config.ts
async headers() {
  return [{
    source: '/:all*(svg|jpg|png|webp|avif)',
    headers: [{
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable'
    }]
  }]
}
```

**Effort:** 30 minutes
**Impact:** MEDIUM (repeat visits faster)

### 5. Lazy Load framer-motion
```typescript
// SeasonalHero.tsx
'use client';
import dynamic from 'next/dynamic';

const MotionDiv = dynamic(
  () => import('framer-motion').then(m => m.motion.div),
  { ssr: false }
);
```

**Effort:** 2 hours (need to update 9 files)
**Impact:** HIGH (TBT -30%)

---

## Strategic Improvements (1-2 weeks)

### 1. CSS Code Splitting Architecture

**Current Problem:** 1587 lines loaded on every page

**Solution:** Component-level CSS modules or CSS-in-JS for page-specific styles

```
globals.css (base: ~500 lines)
├── components/
│   ├── Hero.module.css (~200 lines)
│   ├── Prose.module.css (~350 lines)
│   └── Forms.module.css (~100 lines)
```

**Effort:** 1 week
**Impact:** FCP -10-15%

### 2. Implement ISR with Longer Cache

```typescript
// pages with static content
export const revalidate = 86400; // 24 hours for static pages

// pages with semi-dynamic content
export const revalidate = 3600; // 1 hour for product pages
```

**Effort:** 2-3 days
**Impact:** TTFB -40%

### 3. Image CDN / Optimization Proxy

**Option A:** Cloudflare Image Resizing
**Option B:** Next.js Image Optimization with external loader

```typescript
// next.config.ts
images: {
  loader: 'custom',
  loaderFile: './image-loader.ts',
}
```

**Effort:** 3-5 days
**Impact:** LCP -20%

### 4. Replace framer-motion with CSS Animations

For simple fade/slide animations:

```css
/* CSS-only alternative */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-slide {
  animation: fadeSlideUp 0.5s ease-out forwards;
}
```

**Effort:** 1 week
**Impact:** Bundle size -40KB, TBT -50ms

### 5. Google Maps Lazy Loading

```typescript
// Only load Maps API when user interacts
const [showMap, setShowMap] = useState(false);

return showMap ? (
  <DealersMap dealers={dealers} />
) : (
  <button onClick={() => setShowMap(true)}>
    Show dealers on map
  </button>
);
```

**Effort:** 1 day
**Impact:** Initial page load -100ms TBT

---

## Monitoring Recommendations

### 1. Set Up Real User Monitoring (RUM)

```typescript
// Add web-vitals reporting
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

onLCP(console.log);
onCLS(console.log);
onINP(console.log);
```

### 2. Performance Budgets

| Metric | Budget | Current Est. |
|--------|--------|--------------|
| LCP | < 2.5s | ~3.5s |
| CLS | < 0.1 | ~0.05 |
| INP | < 200ms | ~250ms |
| Total JS | < 200KB | ~320KB |
| Total CSS | < 50KB | ~45KB |

### 3. CI/CD Integration

```yaml
# Add Lighthouse CI
- name: Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --config=lighthouserc.json
```

---

## Priority Roadmap

### Phase 1 (This Week) - Quick Wins
1. Convert hero images to WebP/AVIF
2. Add Cyrillic font subset
3. Increase API cache TTL
4. Add CDN cache headers

### Phase 2 (Next 2 Weeks) - Bundle Optimization
1. Lazy load framer-motion
2. Lazy load embla-carousel
3. Implement Google Maps lazy loading
4. Review and remove unused CSS

### Phase 3 (Month 2) - Architecture
1. CSS code splitting
2. ISR with longer cache
3. Image CDN integration
4. Replace framer-motion with CSS for simple animations

---

## Appendix: Files Analyzed

| File | Purpose | Issues Found |
|------|---------|--------------|
| `next.config.ts` | Build config | Missing cache headers |
| `layout.tsx` | Root layout | Missing cyrillic subset |
| `globals.css` | Global styles | Large, no splitting |
| `Analytics.tsx` | Third-party | Well optimized |
| `SeasonalHero.tsx` | Hero section | PNG images, framer-motion |
| `ProductCarousel.tsx` | Product carousel | Eager embla load |
| `DealersMap.tsx` | Google Maps | Full API load |
| `TyreCard.tsx` | Product card | Well optimized |
| `payload.ts` | API client | Short cache TTL |

---

*Report generated by Claude Performance Audit Tool*
