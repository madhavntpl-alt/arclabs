#!/bin/bash
# Deploy frontend to Vercel

set -e

echo "🚀 Deploying frontend to Vercel..."

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    pnpm add -g vercel
fi

# Build first
echo "🔨 Building frontend..."
cd frontend && pnpm build && cd ..

# Deploy
echo "🚀 Deploying to Vercel..."
vercel --prod --token=$VERCEL_TOKEN --scope=$VERCEL_ORG_ID

echo "✅ Frontend deployed successfully!"