#!/bin/bash

echo "🔧 Fixing PostCSS Docker issue..."

# Stop any running containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Remove the problematic volumes
echo "🧹 Removing node_modules volume..."
docker volume rm telegramassistant_node_modules_cache 2>/dev/null || true

# Clear Docker cache
echo "🧹 Clearing Docker cache..."
docker system prune -f 2>/dev/null || true

# Rebuild the image
echo "🏗️  Rebuilding Docker image..."
docker-compose build --no-cache app

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Check status
echo "📊 Checking service status..."
sleep 10
docker-compose ps

# Show logs to verify PostCSS is working
echo "📋 Checking app logs for PostCSS errors..."
docker-compose logs app | tail -20

echo "✅ Done! Check the logs above for any PostCSS errors."
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"