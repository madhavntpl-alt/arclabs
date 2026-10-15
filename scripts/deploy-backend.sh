#!/bin/bash
# Deploy backend to VPS

set -e

echo "🚀 Deploying backend to VPS..."

# Check required environment variables
if [ -z "$VPS_HOST" ] || [ -z "$VPS_USER" ] || [ -z "$VPS_SSH_KEY" ]; then
    echo "❌ Missing required environment variables: VPS_HOST, VPS_USER, VPS_SSH_KEY"
    exit 1
fi

# Build and push Docker image
echo "🔨 Building and pushing Docker image..."
cd backend
docker build -t ghcr.io/arc-labs/backend:latest .
docker push ghcr.io/arc-labs/backend:latest
cd ..

# Deploy to VPS
echo "🚀 Deploying to VPS..."
ssh -i "$VPS_SSH_KEY" "$VPS_USER@$VPS_HOST" << 'EOF'
    cd /opt/arc-labs
    docker-compose pull
    docker-compose up -d
    docker image prune -f
    echo "✅ Backend deployed successfully!"
EOF

echo "✅ Backend deployed successfully!"