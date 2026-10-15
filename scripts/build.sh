#!/bin/bash
# Build all packages

set -e

echo "🔨 Building all packages..."

# Build shared
echo "📦 Building shared..."
cd shared && pnpm build && cd ..

# Build frontend
echo "🌐 Building frontend..."
cd frontend && pnpm build && cd ..

# Build backend
echo "🐍 Building backend..."
cd backend && poetry build && cd ..

# Build firmware
echo "🔧 Building firmware..."
cd firmware && pio run && cd ..

echo "✅ All packages built successfully!"