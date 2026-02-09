#!/bin/bash
# Docker first-run seed script
# Usage: docker compose exec backend bash /app/scripts/docker-seed.sh
set -e

echo "=== Seeding Payload CMS ==="
npx tsx scripts/seed.ts

echo ""
echo "=== Importing vehicle data ==="
curl -s -X POST http://localhost:3001/api/import/run \
  -H "Content-Type: application/json" \
  -d '{"minYear": 2005}'

echo ""
echo "=== Done ==="
