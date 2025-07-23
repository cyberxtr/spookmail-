#!/bin/bash

echo "🔧 Fixing Docker authentication issue..."

# Disable buildx to avoid authentication errors
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

# Stop any running containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Clear Docker cache if needed
echo "🧹 Clearing Docker cache..."
docker system prune -f 2>/dev/null || true

# Build without buildx
echo "🏗️  Building with legacy Docker build..."
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker-compose build --no-cache

# Start services
echo "🚀 Starting services..."
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker-compose up -d

# Check status
echo "📊 Checking service status..."
sleep 5
docker-compose ps

echo "✅ Done! If you see services running above, your SpookMail bot is ready!"
echo "🌐 Admin Panel: http://localhost:3000"
echo "👤 Username: admin"
echo "🔐 Password: Check your .env file"