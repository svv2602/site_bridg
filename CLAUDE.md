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

# Content Automation commands
npm run automation        # Show help
npm run automation:scrape # Run scrapers only
npm run automation:generate # Generate content only
npm run automation:publish  # Publish to CMS only
npm run automation:full     # Run full weekly automation
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 with App Router (React 19), TypeScript, Tailwind CSS v4
- **Backend**: Payload CMS v3 with PostgreSQL
- **Content Automation**: Claude AI-powered content generation

### Directory Structure

```
.
├── frontend/                  # Next.js frontend
│   └── src/
│       ├── app/              # App Router pages
│       ├── components/       # React components
│       └── lib/
│           ├── api/          # API layer
│           │   └── payload.ts  # Payload CMS client
│           └── data.ts       # Types and mock data
│
└── backend-payload/           # Payload CMS backend
    ├── src/
    │   ├── app/(payload)/    # Admin UI (Next.js App)
    │   └── collections/      # Payload collections
    ├── content-automation/   # AI content generation system
    │   └── src/
    │       ├── scrapers/     # Data collection
    │       ├── processors/   # AI content generation
    │       └── publishers/   # Publishing to Payload
    ├── scripts/
    │   └── seed.ts           # Database seeding
    └── payload.config.ts     # Payload configuration
```

### Data Model

Core collections in Payload CMS:
- `Tyres` — tyre models with sizes, season, EU label, technologies, badges, FAQs
- `Dealers` — dealer locations with coordinates, services
- `Articles` — blog articles with tags, rich text content
- `Technologies` — tyre technologies
- `VehicleFitments` — car make/model/year → recommended sizes
- `Users` — admin users with roles (admin/editor)
- `Media` — uploaded images with auto-generated thumbnails

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
| `/api/media` | Uploaded media files |

### Environment Variables

Backend (`backend-payload/.env`):
```
DATABASE_URI=postgresql://user:pass@localhost:5433/bridgestone
PAYLOAD_SECRET=your-secret-key-min-32-chars
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
ANTHROPIC_API_KEY=sk-ant-...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

Frontend (`frontend/.env.local`):
```
NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3001
```

## Content Automation

Located in `backend-payload/content-automation/`:

- **scrapers/** — Data collection from ProKoleso, ADAC, AutoBild
- **processors/** — AI-powered content generation with Claude API
- **publishers/** — Publishing to Payload CMS via REST API
- **config/** — Environment and prompts configuration

### Running Automation

```bash
cd backend-payload

# Show help
npm run automation

# Run specific tasks
npm run automation:scrape   # Scrape tire data
npm run automation:generate # Generate AI content
npm run automation:publish  # Publish to CMS
npm run automation:full     # Run complete pipeline
```

## Key Patterns

1. **Search modes**: Tyre search has two tabs — "by size" and "by car"
2. **API layer**: Frontend uses `lib/api/payload.ts` for all CMS data
3. **Fallback data**: If Payload CMS unavailable, mock data is used
4. **Dynamic routes**: `/shyny/[slug]` and `/advice/[slug]` use `generateStaticParams()`
5. **Styling**: Dark hero sections (zinc-900), cards with border-border bg-card

## Language

All UI text is in Ukrainian. Variable names and code comments in English.
