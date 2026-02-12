#!/usr/bin/env bash
#
# Bridgestone Ukraine — Server Setup Script
#
# Prepares a fresh server for deployment.
# Run once after cloning the repository.
#
# Usage:
#   ./scripts/setup-server.sh              # Interactive setup
#   ./scripts/setup-server.sh --skip-seed  # Skip database seeding
#
# Prerequisites:
#   - Docker and Docker Compose installed
#   - Git repository cloned
#   - .env file configured (copy from .env.example)
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SKIP_SEED=false

for arg in "$@"; do
  case $arg in
    --skip-seed) SKIP_SEED=true ;;
  esac
done

cd "$PROJECT_ROOT"

echo "============================================"
echo "  Bridgestone Ukraine — Server Setup"
echo "============================================"
echo ""

# -----------------------------------------------
# 1. Check prerequisites
# -----------------------------------------------
echo "[1/7] Checking prerequisites..."

if ! command -v docker &> /dev/null; then
  echo "  ERROR: Docker is not installed."
  echo "  Install: https://docs.docker.com/engine/install/"
  exit 1
fi

if ! docker compose version &> /dev/null; then
  echo "  ERROR: Docker Compose is not available."
  exit 1
fi

echo "  Docker: $(docker --version | head -1)"
echo "  Compose: $(docker compose version | head -1)"

# -----------------------------------------------
# 2. Check .env file
# -----------------------------------------------
echo ""
echo "[2/7] Checking environment configuration..."

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo ""
    echo "  !! IMPORTANT: Edit .env and fill in required values:"
    echo "     - PAYLOAD_SECRET (generate with: openssl rand -hex 32)"
    echo "     - PAYLOAD_PUBLIC_SERVER_URL (your domain, e.g. https://bridgestone.org.ua)"
    echo "     - NEXT_PUBLIC_PAYLOAD_URL (same as above)"
    echo "     - AI provider API keys (at least one for content automation)"
    echo ""
    read -p "  Press Enter after editing .env, or Ctrl+C to abort... "
  else
    echo "  ERROR: Neither .env nor .env.example found."
    exit 1
  fi
fi

# Validate PAYLOAD_SECRET is set
if grep -q "^PAYLOAD_SECRET=$" .env 2>/dev/null; then
  echo "  WARNING: PAYLOAD_SECRET is empty in .env"
  echo "  Generating a random secret..."
  SECRET=$(openssl rand -hex 32)
  sed -i "s/^PAYLOAD_SECRET=$/PAYLOAD_SECRET=$SECRET/" .env
  echo "  Generated and saved PAYLOAD_SECRET."
fi

echo "  .env file: OK"

# -----------------------------------------------
# 3. Create required directories
# -----------------------------------------------
echo ""
echo "[3/7] Creating directories..."

mkdir -p backend-payload/media
mkdir -p backend-payload/content-automation/data
mkdir -p backups

echo "  backend-payload/media/                  — uploaded images"
echo "  backend-payload/content-automation/data/ — SQLite DB, scraped data"
echo "  backups/                                 — backup files"

# -----------------------------------------------
# 4. Build and start containers
# -----------------------------------------------
echo ""
echo "[4/7] Building and starting Docker containers..."
echo "  This may take 5-10 minutes on first run."
echo ""

docker compose up -d --build

echo ""
echo "  Waiting for backend to become healthy..."

RETRIES=30
until docker compose exec -T backend curl -sf http://localhost:3001/api/health/live > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -le 0 ]; then
    echo "  ERROR: Backend failed to start. Check logs:"
    echo "    docker compose logs backend"
    exit 1
  fi
  sleep 5
  echo "  Waiting... ($RETRIES attempts remaining)"
done

echo "  Backend is healthy!"

# -----------------------------------------------
# 5. Seed database
# -----------------------------------------------
echo ""
echo "[5/7] Database setup..."

if [ "$SKIP_SEED" = true ]; then
  echo "  Skipped (--skip-seed flag)."
else
  echo "  Running database seed (collections, admin user, initial data)..."
  docker compose exec -T backend bash /app/scripts/docker-seed.sh || {
    echo "  WARNING: Seed script failed. You can run it manually later:"
    echo "    docker compose exec backend bash /app/scripts/docker-seed.sh"
  }
fi

# -----------------------------------------------
# 6. Run content automation (optional)
# -----------------------------------------------
echo ""
echo "[6/7] Content automation..."
echo "  Tire images are downloaded during the publish step of the automation pipeline."
echo "  To populate tire images now, run:"
echo ""
echo "    docker compose exec -w /app/content-automation backend npx tsx src/cli.ts publish"
echo ""
echo "  Or run the full pipeline (scrape + generate + publish):"
echo ""
echo "    docker compose exec -w /app/content-automation backend npx tsx src/cli.ts full"
echo ""

# -----------------------------------------------
# 7. Summary
# -----------------------------------------------
echo "[7/7] Setup complete!"
echo ""
echo "============================================"
echo "  Services:"
echo "    Backend (Payload CMS):  http://localhost:3001"
echo "    Admin panel:            http://localhost:3001/admin"
echo "    Frontend (Next.js):     http://localhost:3010"
echo ""
echo "  Default admin credentials (after seed):"
echo "    Email:    admin@bridgestone.ua"
echo "    Password: Admin123!"
echo ""
echo "  Next steps:"
echo "    1. Configure nginx reverse proxy (see nginx/nginx.conf)"
echo "    2. Set up SSL: ./scripts/setup-ssl.sh your-domain.com"
echo "    3. Run content automation to populate tire data"
echo "    4. Set up backup cron: crontab -e"
echo "       0 3 * * * /path/to/scripts/backup.sh"
echo "============================================"
