# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Official Bridgestone Ukraine website for end consumers. Reference: Goodyear EU site UX adapted for Bridgestone brand. Ukrainian language only (with future multi-language architecture support).

## Commands

All commands run from `frontend/` directory:

```bash
npm run dev      # Development server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

## Architecture

### Tech Stack
- **Next.js 16** with App Router (React 19)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** for animations
- **Lucide React** for icons

### Directory Structure

```
frontend/src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage with hero, quick search, categories
│   ├── layout.tsx         # Root layout with header/footer
│   ├── passenger-tyres/   # Passenger tyres catalog
│   ├── suv-4x4-tyres/     # SUV tyres catalog
│   ├── tyre-search/       # Search by size or by car (two modes)
│   ├── shyny/[slug]/      # Individual tyre model page (dynamic)
│   ├── dealers/           # Dealer finder with filters
│   ├── about/             # Brand page
│   ├── technology/        # Technologies listing
│   ├── advice/            # Articles list
│   │   └── [slug]/        # Individual article page
│   └── contacts/          # Contact form and FAQ
├── components/
│   ├── MainHeader.tsx     # Sticky header with burger menu
│   ├── ThemeToggle.tsx    # Dark/light mode toggle
│   └── AnimatedMain.tsx   # Page transition wrapper
└── lib/
    ├── data.ts            # TypeScript types and mock data
    └── api/               # API layer (prepared for CMS integration)
        ├── tyres.ts       # Tyre search functions
        ├── dealers.ts     # Dealer queries
        └── articles.ts    # Article queries
```

### Data Model (lib/data.ts)

Core types for the application:
- `TyreModel` — tyre with sizes, season, vehicle types, EU label, technologies
- `TyreSize` — width/aspectRatio/diameter/loadIndex/speedIndex
- `VehicleFitment` — car make/model/year with recommended sizes
- `Dealer` — dealer with coordinates, contacts, type (official/partner/service)
- `Article` — blog article with tags, reading time
- `Technology` — technology linked to tyre models

### Key Patterns

1. **Search modes**: Tyre search has two tabs — "by size" (width/height/diameter dropdowns) and "by car" (cascading make→model→year dropdowns)

2. **Mock data ready for API**: All data access goes through `lib/api/` functions that currently return mock data but are designed for easy CMS/API replacement

3. **Dynamic routes**: Use `generateStaticParams()` for `/shyny/[slug]` and `/advice/[slug]`

4. **Consistent styling**: Dark hero sections with zinc-900 gradient, cards with border-border bg-card, primary color for CTAs

## Current State

**Frontend: 100% complete**
- All pages implemented
- Strapi CMS integration with fallback to mock data
- Google Maps integration for dealers
- GA4/Meta Pixel analytics
- Cookies consent banner
- Schema.org structured data

**Backend/CMS: Strapi v4.25.12**
- Located in `/backend` directory
- SQLite database (development)
- API layer in `frontend/src/lib/api/strapi.ts`

## CMS (Strapi)

### Commands

```bash
cd backend
npm run develop   # Development server at http://localhost:1337
npm run build     # Production build
npm run start     # Start production server
```

### Content Types

| Type | API Endpoint | Description |
|------|--------------|-------------|
| Tyre | `/api/tyres` | Tyre models with sizes, EU label, usage |
| Dealer | `/api/dealers` | Dealer locations with coordinates |
| Article | `/api/articles` | Blog articles/advice |
| Technology | `/api/technologies` | Tyre technologies |
| VehicleFitment | `/api/vehicle-fitments` | Car-to-tyre recommendations |

### Components (Tyre)

- `eu-label` — EU label data (wetGrip, fuelEfficiency, noiseDb)
- `usage` — Usage scenarios (city, highway, offroad, winter)
- `size` — Tyre dimensions (width, aspectRatio, diameter, loadIndex, speedIndex)

### Environment Variables

Frontend (`frontend/.env.local`):
```
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_api_token_here
```

### Seed Data

```bash
cd backend
node scripts/seed.js   # Requires API token with full access
```

### Roles

| Role | Permissions |
|------|-------------|
| Super Admin | Full access to all settings and content |
| Content-editor | CRUD for Tyre, Article, Technology, Dealer (no settings) |
| Public | Read-only access to published content |

## Language

All UI text is in Ukrainian. Variable names and code comments in English.
