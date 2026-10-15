#!/bin/bash
# Run all tests

set -e

echo "🧪 Running all tests..."

# Test shared
echo "📦 Testing shared..."
cd shared && pnpm test && cd ..

# Test frontend
echo "🌐 Testing frontend..."
cd frontend && pnpm test && cd ..

# Test backend
echo "🐍 Testing backend..."
cd backend && poetry run pytest && cd ..

# Test firmware
echo "🔧 Testing firmware..."
cd firmware && pio test && cd ..

echo "✅ All tests passed!"