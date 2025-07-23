#!/bin/bash

# SpookMail Docker Setup Script
echo "🎃 Setting up SpookMail Telegram Bot with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual API keys and credentials!"
    echo ""
    echo "Required configurations:"
    echo "- TELEGRAM_BOT_TOKEN (from @BotFather)"
    echo "- MAILBOXLAYER_API_KEY (from mailboxlayer.com)"
    echo "- ADMIN_PASSWORD (secure password for admin panel)"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ SpookMail services are running!"
    echo ""
    echo "🌐 Admin Panel: http://localhost:3000"
    echo "👤 Default Username: admin"
    echo "🔐 Default Password: (check your .env file)"
    echo ""
    echo "🤖 Don't forget to:"
    echo "1. Start your Telegram bot by messaging it"
    echo "2. Use /start command to initialize"
    echo "3. Access admin panel to configure settings"
    echo ""
    echo "📊 View logs: docker-compose logs -f"
    echo "🛑 Stop services: docker-compose down"
else
    echo "❌ Failed to start services. Check logs:"
    echo "docker-compose logs"
fi