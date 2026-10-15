#!/bin/bash
# Collect all logs for debugging

set -e

OUTPUT_DIR="./logs/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo "📋 Collecting logs to $OUTPUT_DIR..."

# Docker logs
echo "📋 Collecting Docker logs..."
docker-compose logs --no-color > "$OUTPUT_DIR/docker-compose.log" 2>&1

# Backend logs (if running in Docker)
echo "📋 Collecting backend logs..."
docker-compose logs backend > "$OUTPUT_DIR/backend.log" 2>&1

# Frontend logs
docker-compose logs frontend > "$OUTPUT_DIR/frontend.log" 2>&1

# Mock serial logs
docker-compose logs mock-serial > "$OUTPUT_DIR/mock-serial.log" 2>&1

# System logs
echo "📋 Collecting system info..."
{
    echo "=== System Info ==="
    uname -a
    echo ""
    echo "=== Disk Usage ==="
    df -h
    echo ""
    echo "=== Memory ==="
    free -h
    echo ""
    echo "=== Docker Version ==="
    docker --version
    docker-compose --version
    echo ""
    echo "=== Node/Python Versions ==="
    node --version
    pnpm --version
    python3 --version
    poetry --version
    echo ""
    echo "=== Git Status ==="
    git status
    git log --oneline -5
} > "$OUTPUT_DIR/system-info.txt" 2>&1

# Backend application logs (if running locally)
if [ -d ./backend/logs ]; then
    echo "📋 Collecting backend application logs..."
    cp -r ./backend/logs "$OUTPUT_DIR/backend-app-logs" 2>/dev/null || true
fi

# Frontend build logs
if [ -d ./frontend/logs ]; then
    echo "📋 Collecting frontend logs..."
    cp -r ./frontend/logs "$OUTPUT_DIR/frontend-app-logs" 2>/dev/null || true
fi

# Create archive
echo "📦 Creating archive..."
tar -czf "$OUTPUT_DIR.tar.gz" -C "$(dirname "$OUTPUT_DIR")" "$(basename "$OUTPUT_DIR")"
rm -rf "$OUTPUT_DIR"

echo "✅ Logs collected: $OUTPUT_DIR.tar.gz"
echo "📤 You can now share this file for debugging"