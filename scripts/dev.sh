#!/bin/bash
# Development startup script

set -e

echo "🚀 Starting ARC LABS development environment..."

# Check dependencies
command -v docker >/dev/null 2>&1 || { echo "❌ Docker not installed"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose not installed"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm not installed"; exit 1; }

# Setup environment
if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build shared package first
echo "🔨 Building shared package..."
cd shared && pnpm build && cd ..

# Start development services
echo "🐳 Starting Docker services..."
docker-compose --profile mock up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check backend health
echo "🏥 Checking backend health..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null; then
        echo "✅ Backend is healthy"
        break
    fi
    sleep 1
done

# Start frontend
echo "🌐 Starting frontend..."
cd frontend && pnpm dev &

echo ""
echo "✅ Development environment ready!"
echo ""
echo "📋 Access points:"
echo "   Frontend:     http://localhost:5173"
echo "   Backend API:  http://localhost:8000"
echo "   API Docs:     http://localhost:8000/docs"
echo "   WebSocket:    ws://localhost:8000/ws/live"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo '🛑 Stopping...'; docker-compose --profile mock down; kill %1; exit 0" INT
wait