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
- **publishers/** — Publishing to Payload CMS via REST API, Telegram notifications
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

# Start daemon mode (cron scheduler + Telegram bot)
npm run automation:daemon
```

### Telegram Bot Commands

When daemon is running with configured `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`:

| Command | Description |
|---------|-------------|
| `/run` | Start full automation cycle |
| `/scrape` | Scrape data only |
| `/status` | Last run status |
| `/stats` | Weekly statistics |
| `/help` | Show available commands |

### Admin Dashboard

Available at `http://localhost:3010/admin/automation` (requires Basic HTTP Auth).

Features:
- Stats cards (tyres, articles, badges, costs, errors)
- Schedule info (last run, next run)
- Action buttons to trigger automation
- Recent jobs table

Default credentials: `admin` / `bridgestone2026` (configure via `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars)

### Testing

```bash
cd backend-payload
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report
```

## Key Patterns

1. **Search modes**: Tyre search has two tabs — "by size" and "by car"
2. **API layer**: Frontend uses `lib/api/payload.ts` for all CMS data
3. **Fallback data**: If Payload CMS unavailable, mock data is used
4. **Dynamic routes**: `/shyny/[slug]` and `/advice/[slug]` use `generateStaticParams()`
5. **Styling**: Use `hero-adaptive` or `hero-dark` classes for hero sections, `bg-card border-border` for cards

## UI Development Standards

Full standards documentation: `frontend/docs/standards/INDEX.md` (20+ files).

Use `/standards` skill when working on UI components.

### Key Files

| Standard | Description |
|----------|-------------|
| `COLOR_SYSTEM.md` | Stone palette, CSS variables, contrast rules |
| `BUTTON_STANDARDS.md` | Button variants, states, explicit colors |
| `CARD_STYLING.md` | Card structure, hover effects, equal heights |
| `DARK_MODE.md` | Theme switching, hero-adaptive classes |
| `CHECKLISTS.md` | Pre-commit and code review checklists |

### Critical Rules

1. **Colors**: Use `stone-*` palette, NEVER `zinc-*` or `gray-*`. Always provide `dark:` variants.
2. **Badges**: Use explicit colors `bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200`, NEVER `bg-muted text-muted-foreground`.
3. **Buttons**: Secondary buttons need explicit stone colors, not `border-border hover:bg-card`.
4. **Cards**: Grids with `hover:-translate-y-1` must have `pt-2`. Use `h-full` + `mt-auto` for equal heights.
5. **Hero sections**: Use `hero-adaptive` class for theme-switching heroes, `hero-dark` for always-dark.

## Language

All UI text is in Ukrainian. Variable names and code comments in English.

## MCP Tools

Project has configured MCP servers in `.claude/mcp.json`:

- **context7** — Get up-to-date documentation for libraries. Use `resolve-library-id` to find library ID, then `get-library-docs` to fetch docs. Helpful when working with Next.js, Payload CMS, Tailwind CSS, React, etc.
- **playwright** — Browser automation for testing and screenshots
