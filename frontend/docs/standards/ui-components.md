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
    <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
    <p className="mb-4 flex-1 text-sm text-muted-foreground min-h-[2.5rem]">
      {item.description}
    </p>

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
- [ ] Content sections have `min-h-[X]` for optional content
- [ ] Bottom actions use `mt-auto` for consistent positioning
- [ ] Images have proper `object-contain` or `object-cover`
- [ ] Hover states include `transition-all` for smooth animation
