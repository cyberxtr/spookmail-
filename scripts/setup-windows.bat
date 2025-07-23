@echo off
echo.
echo 🎃 Setting up SpookMail Telegram Bot for Windows...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop for Windows first
    echo Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not available
    echo Please ensure Docker Desktop includes Docker Compose
    pause
    exit /b 1
)

REM Copy environment file if it doesn't exist
if not exist .env (
    echo 📄 Creating .env file from template...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit .env file with your actual API keys!
    echo.
    echo Your API keys are already configured in .env.example:
    echo - TELEGRAM_BOT_TOKEN: 8111548199:AAGYArNKclmD_95rMU4bAEb3uGhzmYzxngQ
    echo - MAILBOXLAYER_API_KEY: 31e8efdefbb3793d92a2f70d8a1a3b3e
    echo - ADMIN_USERNAME: torevar
    echo - ADMIN_PASSWORD: hesoyam
    echo.
    echo Press any key after updating .env file...
    pause >nul
)

REM Set environment variables to avoid buildx issues
set DOCKER_BUILDKIT=0
set COMPOSE_DOCKER_CLI_BUILD=0

echo 🛑 Stopping any existing containers...
docker-compose down 2>nul

echo 🧹 Cleaning up Docker resources...
docker system prune -f 2>nul

echo 🏗️  Building and starting services...
docker-compose up -d --build

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Check if services are running
docker-compose ps

echo.
echo ✅ SpookMail setup complete!
echo.
echo 🌐 Admin Panel: http://localhost:3000
echo 👤 Username: admin
echo 🔐 Password: ^(check your .env file^)
echo.
echo 🤖 Next steps:
echo 1. Start your Telegram bot by messaging it
echo 2. Use /start command to initialize
echo 3. Access admin panel to configure settings
echo.
echo 📊 View logs: docker-compose logs -f
echo 🛑 Stop services: docker-compose down
echo.
pause