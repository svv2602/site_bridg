# Deployment Guide — Bridgestone Ukraine

## Quick Start (New Server)

```bash
# 1. Clone repository
git clone https://github.com/svv2602/site_bridg.git
cd site_bridg

# 2. Configure environment
cp .env.example .env
nano .env  # Fill in required values (see Environment section below)

# 3. Run setup
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
```

The setup script will:
- Validate prerequisites (Docker, Docker Compose)
- Create required directories
- Build and start all containers
- Seed the database with initial data
- Print next steps

---

## Architecture

```
Internet
   │
   ▼
nginx (port 443/80)
   ├── /api/*,  /admin  →  backend:3001  (Payload CMS)
   ├── /media/*          →  backend:3001  (uploaded images)
   └── /*                →  frontend:3010 (Next.js)

Docker Compose:
   ├── postgres    — PostgreSQL 16 (data in Docker volume)
   ├── backend     — Payload CMS + Content Automation
   └── frontend    — Next.js (SSR)

Host filesystem (bind mounts):
   ├── backend-payload/media/                  → /app/media
   └── backend-payload/content-automation/data/ → /app/content-automation/data
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `PAYLOAD_SECRET` | Yes | Min 32 chars. Generate: `openssl rand -hex 32` |
| `PAYLOAD_PUBLIC_SERVER_URL` | Yes | Public URL, e.g. `https://bridgestone.org.ua` |
| `NEXT_PUBLIC_PAYLOAD_URL` | Yes | Same as `PAYLOAD_PUBLIC_SERVER_URL` |
| `POSTGRES_PASSWORD` | Yes | Database password |
| `ANTHROPIC_API_KEY` | - | For AI content generation |
| `OPENAI_API_KEY` | - | For DALL-E image generation |
| `DEEPSEEK_API_KEY` | - | For article generation |
| `GOOGLE_AI_API_KEY` | - | For translation (EN→UA) |
| `TELEGRAM_BOT_TOKEN` | - | Telegram notifications |
| `TELEGRAM_CHAT_ID` | - | Telegram chat for notifications |
| `TELEGRAM_TOPIC_CONTENT` | - | Forum topic ID for content notifications |
| `TELEGRAM_TOPIC_ERRORS` | - | Forum topic ID for error notifications |
| `TELEGRAM_TOPIC_REPORTS` | - | Forum topic ID for reports & bot commands |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | - | Google Analytics 4 |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | - | Google Maps (dealers page) |

At least one AI provider key is required for content automation.

Внимание - если ты сменишь пароль админа в Payload CMS, нужно будет также обновить .env на сервере (`PAYLOAD_ADMIN_EMAI` и `PAYLOAD_ADMIN_PASSWORD` ), иначе автоматизация не  сможет аутентифицироваться
---

## Deployment Commands

### First deployment

```bash
./scripts/setup-server.sh
```

### Regular updates

```bash
git pull
docker compose up -d --build
```

Media files and data persist on the host filesystem — rebuilds are safe.

### Rebuild specific service

```bash
docker compose up -d --build backend   # Only backend
docker compose up -d --build frontend  # Only frontend
```

### View logs

```bash
docker compose logs -f backend         # Backend logs
docker compose logs -f frontend        # Frontend logs
docker compose logs -f postgres        # Database logs
docker compose logs -f --tail=50       # All services, last 50 lines
```

### Restart service

```bash
docker compose restart backend
```

### Stop everything

```bash
docker compose down        # Stop containers (data preserved)
docker compose down -v     # !! DANGER: Also deletes PostgreSQL volume
```

---

## SSL Setup

```bash
# Install SSL certificate via Let's Encrypt
./scripts/setup-ssl.sh bridgestone.org.ua admin@bridgestone.org.ua
```

Requires:
- Ports 80 and 443 open
- DNS A record pointing to the server IP

---

## Nginx

### Development (no nginx in Docker)

Services are available directly:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3010`

### Production (external nginx)

The current production server uses system nginx (not Docker). Config is at:
```
/etc/nginx/sites-enabled/bridgestone.org.ua
```

Key routing:
- `/api/*`, `/admin`, `/media` → `http://localhost:3001` (backend)
- Everything else → `http://localhost:3010` (frontend)

### Production (Docker nginx)

For a fully Dockerized setup:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

This adds nginx and certbot containers. See `docker-compose.prod.yml` and `nginx/nginx.conf`.

---

## Database

### Seed (first run)

```bash
docker compose exec backend bash /app/scripts/docker-seed.sh
```

Creates admin user, collections, and initial data.

### Re-seed (destructive)

```bash
docker compose exec backend npx tsx scripts/seed.ts --force
```

Clears and re-creates all data. Use with caution.

### Direct access

```bash
# Via Docker
docker compose exec postgres psql -U bridgestone -d bridgestone

# From host (dev port 5434)
psql -h localhost -p 5434 -U bridgestone -d bridgestone
```

---

## Content Automation

The backend includes an AI-powered content pipeline:
**Scrape** (ProKoleso) → **Generate** (AI descriptions) → **Publish** (to Payload CMS)

### Manual commands

```bash
# Show help
docker compose exec -w /app/content-automation backend npx tsx src/cli.ts

# Run full pipeline
docker compose exec -w /app/content-automation backend npx tsx src/cli.ts full

# Individual steps
docker compose exec -w /app/content-automation backend npx tsx src/cli.ts scrape
docker compose exec -w /app/content-automation backend npx tsx src/cli.ts generate
docker compose exec -w /app/content-automation backend npx tsx src/cli.ts publish
```

### Scheduled automation

The backend runs a cron scheduler automatically:
- **Pipeline** (scrape + generate + publish): Sunday 03:00 Kyiv time
- **Smart articles**: Wednesday 05:00 (if enabled)

Managed via admin panel at `/admin` → Dashboard.

### Tire images

Tire photos are downloaded from ProKoleso during the `publish` step and stored in `backend-payload/media/`. On a fresh server, run the publish step to populate images:

```bash
docker compose exec -w /app/content-automation backend npx tsx src/cli.ts publish
```

---

## Backups

### Create backup

```bash
./scripts/backup.sh                    # Default: ./backups/
./scripts/backup.sh /path/to/backup    # Custom path
```

Backs up:
1. PostgreSQL database (`pg_dump`)
2. Media files (`tar.gz`)
3. SQLite databases (content automation)

### Restore from backup

```bash
# PostgreSQL
docker compose exec -T postgres pg_restore -U bridgestone -d bridgestone \
  < backups/YYYY-MM-DD_HHMMSS/postgres.dump

# Media files
tar xzf backups/YYYY-MM-DD_HHMMSS/media.tar.gz -C backend-payload/

# SQLite
cp backups/YYYY-MM-DD_HHMMSS/sqlite/content-automation.db \
   backend-payload/content-automation/data/
```

### Automated backups (cron)

```bash
crontab -e
# Daily at 3 AM:
0 3 * * * /home/cloud/site_bridg/scripts/backup.sh /home/cloud/backups
```

### Migrate to new server

```bash
# On old server:
./scripts/backup.sh /tmp/migration

# Transfer:
scp -r /tmp/migration/YYYY-MM-DD_HHMMSS user@new-server:/tmp/backup

# On new server (after setup):
# Restore PostgreSQL
docker compose exec -T postgres pg_restore -U bridgestone -d bridgestone \
  -c < /tmp/backup/postgres.dump

# Restore media
tar xzf /tmp/backup/media.tar.gz -C backend-payload/

# Restore SQLite
cp /tmp/backup/sqlite/content-automation.db \
   backend-payload/content-automation/data/

# Restart
docker compose restart backend
```

---

## Admin Panel

URL: `https://your-domain.com/admin`

Default credentials (after seed):
- **Admin**: admin@bridgestone.org.ua / Admin123!
- **Editor**: editor@bridgestone.org.ua / Editor123!

### Key sections

| Section | Description |
|---------|-------------|
| Tyres | Tire catalog — models, sizes, EU labels |
| Articles | Blog articles (draft/published) |
| Dealers | Dealer locations with map coordinates |
| Technologies | Tire technologies |
| Media | Uploaded images |
| Dashboard | Content automation controls, queue management |

---

## File Structure

```
site_bridg/
├── .env.example                 # Environment template
├── docker-compose.yml           # Base Docker Compose
├── docker-compose.prod.yml      # Production overrides (nginx, certbot)
├── docker-compose.override.yml  # Development overrides
├── DEPLOYMENT.md                # This file
│
├── scripts/
│   ├── setup-server.sh          # First-run server setup
│   ├── backup.sh                # Backup utility
│   └── setup-ssl.sh             # SSL certificate setup
│
├── nginx/
│   └── nginx.conf               # Reverse proxy config
│
├── backend-payload/             # Payload CMS backend
│   ├── Dockerfile
│   ├── media/                   # ← Uploaded images (bind mount)
│   ├── content-automation/
│   │   ├── data/                # ← SQLite DB, scraped data (bind mount)
│   │   └── src/                 # Automation source code
│   ├── scripts/
│   │   ├── docker-seed.sh       # Database seed script
│   │   └── seed.ts              # Seed data
│   └── src/
│       ├── collections/         # Payload collections
│       └── endpoints/           # API endpoints
│
└── frontend/                    # Next.js frontend
    ├── Dockerfile
    └── src/
        ├── app/                 # Pages (App Router)
        ├── components/          # React components
        └── lib/                 # API client, utilities
```

---

## Troubleshooting

### Backend won't start

```bash
docker compose logs backend --tail=30
```

Common causes:
- `PAYLOAD_SECRET` not set or < 32 chars
- PostgreSQL not ready (check `docker compose ps postgres`)
- Port 3001 already in use

### Images not loading

1. Check file exists: `ls backend-payload/media/`
2. Check Payload serves it: `curl -I http://localhost:3001/api/media/file/FILENAME`
3. Check nginx proxies it: `curl -I https://your-domain.com/api/media/file/FILENAME`

If media directory is empty, run the publish pipeline:
```bash
docker compose exec -w /app/content-automation backend npx tsx src/cli.ts publish
```

### Content automation errors

```bash
# Check automation logs
docker compose logs backend --tail=100 | grep -E '\[(Scheduler|ArticleGenerator|Scraper)\]'

# Check SQLite queue
docker compose exec backend node -e "
  const db = require('better-sqlite3')('/app/content-automation/data/content-automation.db');
  console.log(db.prepare('SELECT * FROM article_queue ORDER BY id DESC LIMIT 5').all());
"
```

### Database issues

```bash
# Check connection
docker compose exec postgres psql -U bridgestone -c "SELECT 1"

# Reset database (DESTRUCTIVE)
docker compose down
docker volume rm site_bridg_postgres_data
docker compose up -d
docker compose exec backend bash /app/scripts/docker-seed.sh
```
