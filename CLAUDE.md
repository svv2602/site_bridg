# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Official Bridgestone Ukraine website for end consumers. Reference: Goodyear EU site UX adapted for Bridgestone brand. Ukrainian language only (with future multi-language architecture support).

## Quick Start

```bash
# Terminal 1: Start backend
./run_backend.sh

# Terminal 2: Start frontend
./run_frontend.sh
```

## Commands

### Frontend (from `frontend/` directory)

```bash
npm run dev      # Development server at http://localhost:3010
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

### Backend (from `backend-payload/` directory)

```bash
npm run dev      # Development server at http://localhost:3001
npm run build    # Production build
npm run start    # Start production server
npm run seed     # Seed database with initial data
npm run seed -- --force  # Reseed (clears existing data)
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 with App Router (React 19), TypeScript, Tailwind CSS v4
- **Backend**: Payload CMS v3 with PostgreSQL
- **Content Automation**: Claude AI-powered content generation

### Directory Structure

```
.
├── frontend/               # Next.js frontend
│   └── src/
│       ├── app/           # App Router pages
│       ├── components/    # React components
│       └── lib/
│           ├── api/       # API layer
│           │   └── payload.ts  # Payload CMS client
│           └── data.ts    # Types and mock data
│
├── backend-payload/        # Payload CMS backend
│   ├── src/
│   │   ├── app/           # Next.js App for Admin UI
│   │   ├── collections/   # Payload collections
│   │   └── automation/    # Content automation system
│   ├── scripts/
│   │   └── seed.ts        # Database seeding
│   └── payload.config.ts  # Payload configuration
│
└── backend/                # Legacy Strapi (deprecated)
```

### Data Model

Core types in Payload CMS:
- `Tyres` — tyre models with sizes, season, EU label, technologies, badges, FAQs
- `Dealers` — dealer locations with coordinates, services
- `Articles` — blog articles with tags, rich text content
- `Technologies` — tyre technologies
- `VehicleFitments` — car make/model/year → recommended sizes

## Backend (Payload CMS)

### Admin Panel

- URL: http://localhost:3001/admin
- Default credentials: admin@bridgestone.ua / admin123

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/tyres` | Tyre models |
| `/api/dealers` | Dealer locations |
| `/api/articles` | Blog articles |
| `/api/technologies` | Tyre technologies |
| `/api/vehicle-fitments` | Car-to-tyre mappings |
| `/api/seasonal` | Seasonal hero content |
| `/api/automation/status` | Automation scheduler status |

### Environment Variables

Backend (`backend-payload/.env`):
```
PAYLOAD_SECRET=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost:5433/bridgestone
```

Frontend (`frontend/.env.local`):
```
NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3001
```

## Content Automation

Located in `backend-payload/src/automation/`:

- **scrapers/** — Data collection from external sources
- **processors/** — AI-powered content generation with Claude
- **publishers/** — Publishing to Payload CMS
- **jobs/** — Cron scheduler (runs weekly on Sunday 03:00 Kyiv time)

### Running Automation Manually

```bash
cd backend-payload
npm run dev
# Then use API: POST /api/automation/run
```

## Key Patterns

1. **Search modes**: Tyre search has two tabs — "by size" and "by car"
2. **API layer**: Frontend uses `lib/api/payload.ts` for all CMS data
3. **Dynamic routes**: `/shyny/[slug]` and `/advice/[slug]` use `generateStaticParams()`
4. **Styling**: Dark hero sections (zinc-900), cards with border-border bg-card

## Language

All UI text is in Ukrainian. Variable names and code comments in English.
