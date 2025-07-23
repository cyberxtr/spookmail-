@echo off
echo.
echo 🎃 Starting SpookMail Telegram Bot...
echo.

REM Set environment variables to avoid buildx issues
set DOCKER_BUILDKIT=0
set COMPOSE_DOCKER_CLI_BUILD=0

REM Check if .env exists
if not exist .env (
    echo 📄 Creating .env file from template...
    copy .env.example .env
)

echo 🏗️  Starting SpookMail services...
docker-compose up -d

echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check status
docker-compose ps

echo.
echo ✅ SpookMail is running!
echo.
echo 🌐 Admin Panel: http://localhost:3000
echo 👤 Username: torevar
echo 🔐 Password: hesoyam
echo.
echo 📊 View logs: docker-compose logs -f
echo 🛑 Stop services: docker-compose down
echo.
pause