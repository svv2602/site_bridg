#!/usr/bin/env bash
#
# Bridgestone Ukraine - Backup Script
#
# Backs up:
#   1. PostgreSQL database (via pg_dump)
#   2. Media files (backend-payload/media/)
#   3. SQLite databases (content-automation/data/)
#
# Usage:
#   ./scripts/backup.sh                    # Backup to ./backups/
#   ./scripts/backup.sh /path/to/backup    # Backup to custom directory
#   BACKUP_RETENTION_DAYS=14 ./scripts/backup.sh  # Keep backups for 14 days
#
# Restore:
#   # PostgreSQL:
#   pg_restore -U bridgestone -d bridgestone backups/YYYY-MM-DD_HHMMSS/postgres.dump
#   # Or for plain SQL:
#   psql -U bridgestone -d bridgestone < backups/YYYY-MM-DD_HHMMSS/postgres.sql
#
#   # Media:
#   tar xzf backups/YYYY-MM-DD_HHMMSS/media.tar.gz -C backend-payload/
#
#   # SQLite:
#   cp backups/YYYY-MM-DD_HHMMSS/content-automation.db backend-payload/content-automation/data/
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
BACKUP_BASE="${1:-$PROJECT_ROOT/backups}"
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_DIR="$BACKUP_BASE/$TIMESTAMP"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# PostgreSQL connection (from .env or defaults)
PG_HOST="${PGHOST:-localhost}"
PG_PORT="${PGPORT:-5434}"
PG_USER="${PGUSER:-bridgestone}"
PG_DB="${PGDATABASE:-bridgestone}"

# Paths
MEDIA_DIR="$PROJECT_ROOT/backend-payload/media"
SQLITE_DIR="$PROJECT_ROOT/backend-payload/content-automation/data"

echo "=== Bridgestone Backup ==="
echo "Date: $TIMESTAMP"
echo "Backup directory: $BACKUP_DIR"
echo ""

mkdir -p "$BACKUP_DIR"

# 1. PostgreSQL backup
echo "[1/3] Backing up PostgreSQL..."
if command -v pg_dump &> /dev/null; then
  PGPASSWORD="${PGPASSWORD:-bridgestone}" pg_dump \
    -h "$PG_HOST" \
    -p "$PG_PORT" \
    -U "$PG_USER" \
    -d "$PG_DB" \
    -Fc \
    -f "$BACKUP_DIR/postgres.dump" 2>/dev/null && \
    echo "  PostgreSQL backup: $(du -sh "$BACKUP_DIR/postgres.dump" | cut -f1)" || \
    echo "  WARNING: PostgreSQL backup failed (is the database running?)"
else
  # Try via Docker
  if docker compose -f "$PROJECT_ROOT/docker-compose.yml" ps postgres 2>/dev/null | grep -q "running"; then
    docker compose -f "$PROJECT_ROOT/docker-compose.yml" exec -T postgres \
      pg_dump -U bridgestone -d bridgestone -Fc > "$BACKUP_DIR/postgres.dump" && \
      echo "  PostgreSQL backup (via Docker): $(du -sh "$BACKUP_DIR/postgres.dump" | cut -f1)" || \
      echo "  WARNING: PostgreSQL backup via Docker failed"
  else
    echo "  SKIPPED: pg_dump not found and Docker container not running"
  fi
fi

# 2. Media files
echo "[2/3] Backing up media files..."
if [ -d "$MEDIA_DIR" ] && [ "$(ls -A "$MEDIA_DIR" 2>/dev/null)" ]; then
  tar czf "$BACKUP_DIR/media.tar.gz" -C "$PROJECT_ROOT/backend-payload" media
  echo "  Media backup: $(du -sh "$BACKUP_DIR/media.tar.gz" | cut -f1)"
else
  echo "  SKIPPED: No media files found"
fi

# 3. SQLite databases
echo "[3/3] Backing up SQLite databases..."
if [ -d "$SQLITE_DIR" ]; then
  SQLITE_FILES=$(find "$SQLITE_DIR" -name "*.db" -o -name "*.sqlite" 2>/dev/null)
  if [ -n "$SQLITE_FILES" ]; then
    mkdir -p "$BACKUP_DIR/sqlite"
    for db in $SQLITE_FILES; do
      cp "$db" "$BACKUP_DIR/sqlite/"
      echo "  Copied: $(basename "$db")"
    done
    echo "  SQLite backup: $(du -sh "$BACKUP_DIR/sqlite" | cut -f1)"
  else
    echo "  SKIPPED: No SQLite databases found"
  fi
else
  echo "  SKIPPED: SQLite data directory not found"
fi

# Also backup costs.json if it exists
COSTS_FILE="$SQLITE_DIR/costs.json"
if [ -f "$COSTS_FILE" ]; then
  cp "$COSTS_FILE" "$BACKUP_DIR/"
  echo "  Copied: costs.json"
fi

echo ""
echo "Backup complete: $BACKUP_DIR"
echo "Total size: $(du -sh "$BACKUP_DIR" | cut -f1)"

# Cleanup old backups
if [ -d "$BACKUP_BASE" ]; then
  OLD_COUNT=$(find "$BACKUP_BASE" -mindepth 1 -maxdepth 1 -type d -mtime "+$RETENTION_DAYS" 2>/dev/null | wc -l)
  if [ "$OLD_COUNT" -gt 0 ]; then
    echo ""
    echo "Cleaning up backups older than $RETENTION_DAYS days..."
    find "$BACKUP_BASE" -mindepth 1 -maxdepth 1 -type d -mtime "+$RETENTION_DAYS" -exec rm -rf {} +
    echo "  Removed $OLD_COUNT old backup(s)"
  fi
fi

echo ""
echo "=== Done ==="
