@echo off
echo 🔧 Fixing PostCSS Docker issue...

REM Stop any running containers
echo 🛑 Stopping existing containers...
docker-compose down 2>nul

REM Remove the problematic volumes
echo 🧹 Removing node_modules volume...
docker volume rm telegramassistant_node_modules_cache 2>nul

REM Clear Docker cache
echo 🧹 Clearing Docker cache...
docker system prune -f 2>nul

REM Rebuild the image
echo 🏗️  Rebuilding Docker image...
docker-compose build --no-cache app

REM Start services
echo 🚀 Starting services...
docker-compose up -d

REM Check status
echo 📊 Checking service status...
timeout /t 10 /nobreak >nul
docker-compose ps

REM Show logs to verify PostCSS is working
echo 📋 Checking app logs for PostCSS errors...
docker-compose logs app

echo ✅ Done! Check the logs above for any PostCSS errors.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
pause