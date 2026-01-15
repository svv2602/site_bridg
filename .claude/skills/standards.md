# UI Development Standards — Mini Design System 2026

Load and apply frontend development standards from `frontend/docs/standards/`.

## Trigger

Use when:
- Creating new components or pages
- Fixing styling/contrast issues
- Reviewing code for consistency
- User asks about coding standards

## Quick Reference

### Key Concept

> **Primary = Silver (CTAs), Brand = Red (logo/alerts only)**

### Forbidden Patterns (NEVER USE)

```typescript
// LOW CONTRAST - FORBIDDEN
bg-muted text-muted-foreground    // Both muted
bg-primary/10 text-primary        // Opacity background
hover:bg-muted                    // No contrast hover
hover:bg-card                     // Implicit hover

// COLD PALETTES - FORBIDDEN
zinc-*, gray-*, slate-*           // Use stone-* instead
```

### Replacement Table

| Forbidden | Replacement |
|-----------|-------------|
| `bg-muted text-muted-foreground` | `bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200` |
| `bg-primary/10 text-primary` | `bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200` |
| `hover:bg-muted` | `hover:bg-stone-100 dark:hover:bg-stone-700` |
| `hover:bg-card` | `hover:bg-stone-100 dark:hover:bg-stone-700` |
| `border-border` (buttons) | `border-stone-300 dark:border-stone-600` |

---

## Buttons

### Primary (Silver)

```tsx
<button className="bg-primary text-primary-text hover:bg-primary-hover rounded-full px-6 py-2.5 font-semibold">
  CTA
</button>
```

### Secondary (Explicit Stone Colors)

```tsx
// CORRECT
<button className="rounded-full border border-stone-300 bg-transparent px-6 py-2.5
                   text-sm font-semibold text-stone-700 hover:bg-stone-100
                   dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700">
  Secondary
</button>

// WRONG
<button className="border-border hover:bg-muted">
```

### Brand (Red) — ONLY for special cases

```tsx
// Only for promo, alerts, brand elements
<button className="btn-brand">Special Offer</button>
```

---

## Badges

```tsx
// Neutral badge
<span className="bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200
                 rounded-full px-3 py-1 text-sm font-medium">
  Tag
</span>

// Active badge
<span className="bg-primary text-primary-text rounded-full px-3 py-1">
  Active
</span>

// Semantic badges
<span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
  Service
</span>
```

---

## Cards

```tsx
// Grid with hover lift needs pt-2
<div className="grid gap-6 pt-2 md:grid-cols-3">
  <div className="h-full flex flex-col border border-border bg-card hover:-translate-y-1">
    <div className="flex-1">Content</div>
    <div className="mt-auto">Actions</div>
  </div>
</div>
```

---

## Hero Sections

### Adaptive Hero (changes with theme)

```tsx
<section className="hero-adaptive">
  <h1 className="hero-title-adaptive">Title</h1>
  <p className="hero-text-adaptive">Text</p>
  <button className="hero-btn-primary-adaptive">CTA</button>
  <button className="hero-btn-secondary-adaptive">Secondary</button>
</section>
```

### Always-Dark Hero

```tsx
<section className="hero-dark">
  <h1 className="hero-title">Title</h1>
  <p className="hero-text">Text</p>
  <button className="hero-btn-primary">CTA</button>
</section>
```

### Adaptive Form in Hero

```tsx
<div className="hero-form-card-adaptive p-6">
  <h2 className="hero-form-title-adaptive">Title</h2>
  <p className="hero-form-text-adaptive">Description</p>

  <div className="hero-tabs-adaptive">
    <button className={active ? "hero-tab-active-adaptive" : "hero-tab-adaptive"}>
      Tab
    </button>
  </div>

  <label className="hero-form-text-adaptive">Label</label>
  <select className="hero-input-adaptive">...</select>

  <button className="hero-btn-primary-adaptive">Submit</button>
</div>
```

---

## Feature Lists (з кольоровими іконками)

```tsx
<ul className="space-y-3 text-sm">
  <li className="flex items-start gap-3">
    {/* Icon - кольорові, працюють в обох темах */}
    <div className="mt-1 rounded-full bg-emerald-500/15 p-1.5">
      <Shield className="h-4 w-4 text-emerald-500" />
    </div>
    {/* Text - явні stone кольори */}
    <div>
      <p className="font-medium text-stone-900 dark:text-white">Title</p>
      <p className="text-xs text-stone-500 dark:text-stone-400">Description</p>
    </div>
  </li>
</ul>
```

---

## Season Colors (lib/utils/tyres.ts)

| Season | Background | Text | Light BG |
|--------|-----------|------|----------|
| Summer | `bg-emerald-500` | `text-emerald-500` | `bg-emerald-500/15` |
| Winter | `bg-sky-500` | `text-sky-400` | `bg-sky-500/15` |
| Allseason | `bg-amber-500` | `text-amber-500` | `bg-amber-500/15` |

---

## CTA Sections (завжди темні)

```tsx
<div className="rounded-3xl bg-graphite p-10 text-white shadow-2xl">
  <h3 className="text-3xl font-bold">Title</h3>
  <p className="text-lg opacity-90">Description</p>

  {/* Primary - білий */}
  <Link className="rounded-full bg-white px-8 py-3 font-semibold text-graphite hover:bg-stone-100">
    Primary
  </Link>

  {/* Secondary - прозорий */}
  <Link className="rounded-full border border-white bg-transparent px-8 py-3 text-white hover:bg-white/10">
    Secondary
  </Link>
</div>
```

---

## Dark Mode

- Uses `data-theme="dark"` attribute (NOT `.dark` class)
- ThemeProvider: `attribute="data-theme"`
- Always provide `dark:` variants for explicit colors
- Hero buttons **invert** between themes (primary dark in light, white in dark)

```tsx
// CORRECT
<div className="bg-stone-100 dark:bg-stone-800">
<span className="text-stone-700 dark:text-stone-200">

// WRONG - missing dark: variant
<div className="bg-stone-100">
```

---

## CSS Variables (globals.css)

```css
/* Primary = Silver */
--primary: var(--silver-accent);      /* #D7D9DC */
--primary-hover: var(--silver-hover); /* #FFFFFF */
--primary-text: var(--black-base);    /* #0E0E0E */

/* Brand = Red (logo/alerts only) */
--brand: var(--bridgestone-red);      /* #e30613 */

/* Dark theme tokens */
--graphite: #24282C;
--black-base: #0E0E0E;
--border-dark: #2F3438;
```

---

## Key Standards Files

| File | Use Case |
|------|----------|
| `COLOR_SYSTEM.md` | Stone palette, silver primary, contrast rules |
| `BUTTON_STANDARDS.md` | Button variants, explicit stone colors |
| `CARD_STYLING.md` | Card structure, hover effects, heights |
| `DARK_MODE.md` | data-theme attribute, hero-adaptive classes |
| `CHECKLISTS.md` | Pre-commit and code review checklists |

---

## Pre-commit Checklist

- [ ] No `bg-muted text-muted-foreground` combinations
- [ ] No `bg-primary/10 text-primary` (opacity backgrounds)
- [ ] No `hover:bg-muted` or `hover:bg-card`
- [ ] Buttons have explicit stone colors with `dark:` variants
- [ ] No zinc/gray/slate classes
- [ ] Primary used for CTAs (silver)
- [ ] Brand used only for logo/alerts
- [ ] Hero sections use `hero-adaptive` or `hero-dark`

### Verification Commands

```bash
rg "bg-muted.*text-muted-foreground" frontend/src/
rg "bg-primary/10.*text-primary" frontend/src/
rg "hover:bg-muted|hover:bg-card" frontend/src/
rg "zinc-|gray-|slate-" frontend/src/
```

---

## Instructions

When working on UI:

1. **Read relevant standard file** before making changes
2. **Check existing patterns** in similar components
3. **Apply checklist** before committing
4. **Use explicit stone colors** with dark: variants for badges/buttons
