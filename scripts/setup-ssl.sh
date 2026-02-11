#!/usr/bin/env bash
# Setup SSL certificates using Let's Encrypt (certbot) via Docker.
#
# Usage:
#   ./scripts/setup-ssl.sh bridgestone.ua [email@example.com]
#
# Prerequisites:
#   - Docker and docker compose installed
#   - DNS A record pointing to this server
#   - Ports 80/443 open

set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain> [email]}"
EMAIL="${2:-admin@$DOMAIN}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== SSL Setup for $DOMAIN ==="
echo "Email: $EMAIL"
echo ""

# Create certbot directories
mkdir -p "$PROJECT_DIR/certbot/conf"
mkdir -p "$PROJECT_DIR/certbot/www"

# Step 1: Get initial certificate using standalone mode
echo "--- Obtaining certificate ---"
docker run --rm \
  -v "$PROJECT_DIR/certbot/conf:/etc/letsencrypt" \
  -v "$PROJECT_DIR/certbot/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

echo ""
echo "=== Certificate obtained successfully ==="
echo "Certificates stored in: $PROJECT_DIR/certbot/conf/"
echo ""
echo "To start the full stack with SSL:"
echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
echo ""
echo "Certificates auto-renew via the certbot service in docker-compose.prod.yml"
