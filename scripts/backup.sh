#!/bin/bash
# Backup database and configuration

set -e

echo "💾 Starting backup..."

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup SQLite database
if [ -f ./backend/data/arc_labs.db ]; then
    echo "💾 Backing up SQLite database..."
    cp ./backend/data/arc_labs.db "$BACKUP_DIR/arc_labs.db"
fi

# Backup configuration
echo "💾 Backing up configuration..."
cp .env "$BACKUP_DIR/env.backup" 2>/dev/null || true
cp docker-compose.yml "$BACKUP_DIR/docker-compose.yml.backup" 2>/dev/null || true

# Backup firmware config
if [ -d ./firmware/src/config ]; then
    cp -r ./firmware/src/config "$BACKUP_DIR/firmware_config"
fi

# Compress backup
echo "🗜️ Compressing backup..."
tar -czf "$BACKUP_DIR.tar.gz" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")"
rm -rf "$BACKUP_DIR"

echo "✅ Backup completed: $BACKUP_DIR.tar.gz"

# Cleanup old backups (keep last 30 days)
find ./backups -name "*.tar.gz" -mtime +30 -delete
echo "🧹 Cleaned up old backups"