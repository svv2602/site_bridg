# UI Component Standards

This document defines the UI patterns and standards for consistent component behavior across the Bridgestone Ukraine website.

## Card Components

### Hover Effects with Lift Animation

When cards have `hover:-translate-y-1` (lift on hover), the parent grid **must** have `pt-2` to prevent clipping under section headers.

```tsx
// CORRECT: Grid with pt-2 for hover clearance
<div className="grid gap-6 pt-2 md:grid-cols-2 lg:grid-cols-3">
  <div className="... hover:-translate-y-1">Card content</div>
</div>

// INCORRECT: Missing pt-2 causes card to clip under header
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  <div className="... hover:-translate-y-1">Card content</div>
</div>
```

### Uniform Card Heights

All cards in a grid must have equal heights. Use these patterns:

1. **Add `h-full` to card container** (Link or div):
```tsx
<Link className="group flex h-full flex-col ...">
```

2. **Use `flex-1` for expandable content areas**:
```tsx
<p className="mb-4 flex-1 text-sm">Description that can vary in length</p>
```

3. **Set `min-h-[X]` for optional content sections**:
```tsx
// Description area - consistent height even with varying text
<p className="mb-3 line-clamp-2 text-sm min-h-[2.5rem]">
  {tyre.shortDescription}
</p>

// EU Label section - reserve space even when empty
<div className="mb-3 min-h-[1.75rem]">
  {tyre.euLabel && <EuLabelGroup ... />}
</div>
```

4. **Use `mt-auto` for bottom-aligned elements**:
```tsx
<div className="mt-auto flex gap-2">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

### Card Title Typography

Card titles must use consistent typography for a lighter, more elegant appearance:

```tsx
// CORRECT: Medium weight, proper spacing, thin underline, explicit text color
<h3 className="mb-3 text-base font-medium leading-tight text-foreground transition-all group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
  {item.title}
</h3>

// INCORRECT: Bold weight, thick underline, missing text color
<h3 className="mb-1 text-base font-bold ... group-hover:decoration-2">
  {item.title}
</h3>
```

**Rules:**
- Font weight: `font-medium` (not `font-bold` or `font-semibold`)
- Spacing after title: `mb-3` (not `mb-1` or `mb-2`)
- Hover underline thickness: `decoration-1` (not `decoration-2`)
- Always include: `text-foreground` for light/dark theme compatibility
- Always include: `group-hover:underline group-hover:underline-offset-4`

### Text Colors for Light/Dark Theme

**IMPORTANT:** Always use explicit text color classes for readability in both themes.

```tsx
// CORRECT: Explicit text colors
<h3 className="text-foreground">Title</h3>
<p className="text-muted-foreground">Description</p>
<span className="text-foreground">Badge text</span>

// INCORRECT: Relies on inheritance (may break in light theme)
<h3>Title</h3>
<span className="bg-background px-2 py-1">Badge</span>
```

**Rules for badges and small elements:**

```tsx
// Size badges - always include text-foreground
<span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
  205/55 R16
</span>

// Colored badges - use explicit light/dark text colors
<span className="rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1">
  Зчеплення: A
</span>

<span className="rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1">
  Паливо: B
</span>
```

**Common text color classes:**

| Class | Use Case |
|-------|----------|
| `text-foreground` | Primary text (titles, labels, badge text) |
| `text-muted-foreground` | Secondary text (descriptions, hints) |
| `text-primary` | Accent text, links |
| `text-green-800 dark:text-green-200` | Success/eco badges |
| `text-blue-800 dark:text-blue-200` | Info badges |

### Standard Card Structure

```tsx
<Link
  href={`/path/${item.slug}`}
  className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
>
  {/* Image Section */}
  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
    <Image ... />
    {/* Badges positioned absolutely */}
    <div className="absolute top-4 left-4">Badge</div>
  </div>

  {/* Content Section */}
  <div className="flex flex-1 flex-col p-4">
    <h3 className="mb-3 text-base font-medium leading-tight text-foreground transition-all group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
      {item.title}
    </h3>
    <p className="mb-4 flex-1 text-sm text-muted-foreground min-h-[2.5rem]">
      {item.description}
    </p>

    {/* Size badges - with explicit text color */}
    <div className="flex flex-wrap gap-1.5">
      <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
        205/55 R16
      </span>
    </div>

    {/* Bottom-aligned actions */}
    <div className="mt-auto flex gap-2">
      <Button>Action</Button>
    </div>
  </div>
</Link>
```

## Carousel Components

### Grid Spacing for Carousels

Use negative margin + positive padding pattern for consistent item spacing:

```tsx
// Container with negative left margin
<div className="flex -ml-4">
  {items.map((item) => (
    // Each item with positive left padding
    <div className="flex-[0_0_25%] min-w-0 pl-4">
      <div className="h-full">
        <Card item={item} />
      </div>
    </div>
  ))}
</div>
```

### Carousel with Side Navigation

```tsx
<div className="relative pt-2">
  {/* Left button - positioned outside carousel */}
  <button
    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10 ..."
  >
    <ChevronLeft />
  </button>

  {/* Carousel container - with horizontal margins for buttons */}
  <div className="overflow-x-clip overflow-y-visible mx-6 md:mx-10" ref={emblaRef}>
    <div className="flex -ml-4">
      {/* Items */}
    </div>
  </div>

  {/* Right button */}
  <button
    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-10 ..."
  >
    <ChevronRight />
  </button>
</div>
```

Key points:
- `overflow-x-clip overflow-y-visible` — allows hover effects to extend vertically
- `mx-6 md:mx-10` — horizontal margins for navigation buttons
- `pt-2` on parent — prevents hover clipping at top

## Grid Layouts

### Standard Product Grid

```tsx
// Default 3-column grid
<div className="grid gap-6 pt-2 md:grid-cols-2 lg:grid-cols-3">

// Compact 4-column grid
<div className="grid gap-4 pt-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
```

### Grid Gap Standards

| Use Case | Gap | Padding Top |
|----------|-----|-------------|
| Product cards | `gap-6` | `pt-2` |
| Compact cards | `gap-4` | `pt-2` |
| Article cards | `gap-8` | `pt-2` |
| Feature icons | `gap-4` | - |

## TyreCard Component

The `TyreCard` component is the standard card for displaying tyre models across the site.

### Props

```tsx
interface TyreCardProps {
  tyre: TyreModel;
  variant?: "default" | "compact" | "featured";
  matchingSizes?: string[];  // For vehicle search results
}
```

### Variants

| Variant | Image Height | Shows | Use Case |
|---------|--------------|-------|----------|
| `default` | h-72 | Description, EU Label, Technologies, Sizes preview | Catalog pages |
| `compact` | h-48 | Description, EU Label, Sizes count | Search results, carousels |
| `featured` | h-80 | Full details | Homepage highlights |

### Usage with Vehicle Search

When displaying tyres from vehicle search, pass `matchingSizes` to show matching sizes as badges instead of total sizes count:

```tsx
// Size search - shows "X розмірів" at bottom
<TyreCard tyre={tyre} variant="compact" />

// Vehicle search - shows matching size badges at bottom
<TyreCard
  tyre={tyre}
  variant="compact"
  matchingSizes={tyre.matchingSizes}  // ["205/55 R16", "215/50 R17"]
/>
```

### MatchingTyre Type

For vehicle search, the API returns `MatchingTyre` which extends `TyreModel`:

```tsx
// lib/types/vehicles.ts
interface MatchingTyre extends TyreModel {
  matchingSizes: string[];  // Sizes that match the selected vehicle
}
```

## Badge Contrast Standards

**CRITICAL:** Never use `bg-primary/10 text-primary` or `bg-muted text-muted-foreground` for badges — these combinations have poor contrast in both themes.

### Correct Badge Patterns

**Neutral badges (tags, counts, categories):**
```tsx
// CORRECT: Explicit stone colors with dark mode variants
<span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-medium text-stone-700 dark:bg-stone-700 dark:text-stone-200">
  #tag
</span>

// INCORRECT: Low contrast in both themes
<span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
<span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
```

**Active/selected state badges:**
```tsx
// CORRECT: Solid primary background
<span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-text">
  Active filter
</span>

// INCORRECT: Transparent primary (low contrast)
<span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
```

**Semantic color badges (status, type indicators):**
```tsx
// CORRECT: Explicit light/dark variants
<span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-200">
  Офіційний дилер
</span>

<span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-200">
  Сервісний центр
</span>

// INCORRECT: Opacity-based backgrounds
<span className="bg-green-500/10 text-green-600">
```

**Count badges (+N more):**
```tsx
// CORRECT
<span className="rounded-full bg-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-700 dark:bg-stone-700 dark:text-stone-200">
  +{count}
</span>

// INCORRECT
<span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
```

### Badge Color Reference

| Type | Light Theme | Dark Theme |
|------|-------------|------------|
| Neutral | `bg-stone-200 text-stone-700` | `bg-stone-700 text-stone-200` |
| Active | `bg-primary text-primary-text` | Same |
| Success | `bg-green-100 text-green-700` | `bg-green-900 text-green-200` |
| Warning | `bg-orange-100 text-orange-700` | `bg-orange-900 text-orange-200` |
| Error/Official | `bg-red-100 text-red-700` | `bg-red-900 text-red-200` |
| Info | `bg-blue-100 text-blue-700` | `bg-blue-900 text-blue-200` |

## Season Badge Colors

Use consistent badge classes for season indicators:

```tsx
const seasonColors: Record<Season, string> = {
  summer: "badge-summer",      // Orange/amber
  winter: "badge-winter",      // Blue
  allseason: "badge-allseason", // Green
};

// Usage
<div className={`${seasonColors[season]} rounded-lg px-3 py-1.5 text-sm font-semibold`}>
  {seasonLabels[season]}
</div>
```

## Checklist for New Card Components

When creating new card components, verify:

- [ ] Parent grid has `pt-2` if cards have `hover:-translate-y-*`
- [ ] Card container has `h-full` for equal heights in grid
- [ ] Title uses `font-medium`, `mb-3`, `text-foreground`, `decoration-1` on hover
- [ ] All text elements have explicit color (`text-foreground` or `text-muted-foreground`)
- [ ] **Badges use explicit stone colors, NOT `bg-muted` or `bg-primary/10`**
- [ ] **Badges have both light and dark theme colors (e.g., `dark:bg-stone-700 dark:text-stone-200`)**
- [ ] Content sections have `min-h-[X]` for optional content
- [ ] Bottom actions use `mt-auto` for consistent positioning
- [ ] Images have proper `object-contain` or `object-cover`
- [ ] Hover states include `transition-all` for smooth animation
