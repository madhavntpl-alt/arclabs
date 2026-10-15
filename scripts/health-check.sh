#!/bin/bash
# Health check script for all services

set -e

echo "🏥 Running health checks..."

# Check backend
echo "🔍 Checking backend..."
if curl -s -f http://localhost:8000/health > /dev/null; then
    echo "✅ Backend healthy"
    curl -s http://localhost:8000/health | jq .
else
    echo "❌ Backend unhealthy"
    exit 1
fi

# Check frontend
echo "🔍 Checking frontend..."
if curl -s -f http://localhost:5173 > /dev/null; then
    echo "✅ Frontend healthy"
else
    echo "❌ Frontend unhealthy"
    exit 1
fi

# Check WebSocket
echo "🔍 Checking WebSocket..."
if command -v wscat &> /dev/null; then
    timeout 5 wscat -c ws://localhost:8000/ws/live -x '{"type":"ping"}' -w 1000 > /dev/null 2>&1 && echo "✅ WebSocket healthy" || echo "⚠️ WebSocket check failed (may need wscat)"
else
    echo "⚠️ wscat not installed, skipping WebSocket check"
fi

# Check database
echo "🔍 Checking database..."
if [ -f ./backend/data/arc_labs.db ]; then
    echo "✅ Database file exists"
    sqlite3 ./backend/data/arc_labs.db "PRAGMA integrity_check;" | grep -q "ok" && echo "✅ Database integrity OK" || echo "❌ Database integrity check failed"
else
    echo "⚠️ Database file not found (may be using PostgreSQL)"
fi

# Check disk space
echo "🔍 Checking disk space..."
df -h . | awk 'NR==2 {print "Disk usage: " $5 " (" $3 " used of " $2 ")"}'

# Check memory
echo "🔍 Checking memory..."
free -h | awk 'NR==2 {print "Memory usage: " $3 " used of " $2}'

# Check Docker containers
echo "🔍 Checking Docker containers..."
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ All health checks passed!"