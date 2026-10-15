#!/bin/bash
# Lint all packages

set -e

echo "🔍 Linting all packages..."

# Lint shared
echo "📦 Linting shared..."
cd shared && pnpm lint && cd ..

# Lint frontend
echo "🌐 Linting frontend..."
cd frontend && pnpm lint && cd ..

# Lint backend
echo "🐍 Linting backend..."
cd backend && poetry run ruff check . && poetry run ruff format --check . && cd ..

echo "✅ All linting passed!"