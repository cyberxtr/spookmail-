# 🎃 SpookMail Windows Setup Guide

This guide will help you set up the SpookMail Telegram bot on your Windows machine using Docker Compose.

## Prerequisites

### 1. Install Docker Desktop for Windows
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
2. Install and restart your computer
3. Start Docker Desktop
4. Verify installation:
   ```cmd
   docker --version
   docker-compose --version
   ```

### 2. Get Your API Keys

**Telegram Bot Token:**
1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Copy the token (format: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

**Mailboxlayer API Key:**
1. Sign up at [mailboxlayer.com](https://mailboxlayer.com)
2. Go to your dashboard
3. Copy your API key (free tier gives 1,000 requests/month)

## Setup Instructions

### Step 1: Download and Configure

1. **Extract your project files** to a folder like `C:\SpookMail\`

2. **Copy environment file:**
   ```cmd
   copy .env.example .env
   ```

3. **Edit .env file** with Notepad or any text editor:
   ```env
   # Replace with your actual bot token
   TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
   
   # Replace with your actual API key
   MAILBOXLAYER_API_KEY=your_actual_api_key_here
   
   # Set a secure admin password
   ADMIN_PASSWORD=YourSecurePassword123
   
   # Keep these settings for local Windows development
   DATABASE_URL=postgresql://torevar:hesoyam@postgres:5432/telegram_bot
   ADMIN_USERNAME=admin
   SESSION_SECRET=spookmail-super-secret-session-key-for-windows
   NODE_ENV=development
   PORT=3000
   ```

### Step 2: Run the Setup

**Option A: Automated Setup (Recommended)**
```cmd
# Double-click the setup file
scripts\setup-windows.bat
```

**Option B: Manual Setup**
```cmd
# Open Command Prompt in your project folder
cd C:\SpookMail

# Set environment variables to avoid buildx issues
set DOCKER_BUILDKIT=0
set COMPOSE_DOCKER_CLI_BUILD=0

# Stop any existing containers
docker-compose down

# Build and start services
docker-compose up -d --build

# Check if everything is running
docker-compose ps
```

### Step 3: Access Your Services

- **Admin Panel**: http://localhost:3000
- **Login**: Username `admin`, Password from your .env file
- **Telegram Bot**: Message your bot on Telegram

## Using Your Bot

### Bot Commands
- `/start` - Initialize the bot
- `/check` - Verify an email address
- `/stats` - View your usage statistics
- `/invite` - Get referral link for bonus checks
- `/help` - Show available commands

### Admin Panel Features
- **Dashboard**: Real-time statistics and charts
- **User Management**: View and manage bot users
- **Email History**: See all verification attempts
- **Broadcasts**: Send messages to users
- **Settings**: Configure bot behavior

## Troubleshooting

### Common Issues

**1. Docker authentication error (buildx)**
```cmd
# Run this before docker-compose up
set DOCKER_BUILDKIT=0
set COMPOSE_DOCKER_CLI_BUILD=0
```

**2. Port already in use**
```cmd
# Kill processes using ports 3000 or 5433
netstat -ano | findstr :3000
taskkill /F /PID [PID_NUMBER]
```

**3. Bot not responding**
- Check your `TELEGRAM_BOT_TOKEN` in .env
- Verify the bot is started with `/start`
- Check logs: `docker-compose logs app`

**4. Email verification fails**
- Verify your `MAILBOXLAYER_API_KEY` in .env
- Check API quota at mailboxlayer.com
- Review logs: `docker-compose logs app`

**5. Can't access admin panel**
- Make sure containers are running: `docker-compose ps`
- Check if http://localhost:3000 is accessible
- Verify credentials in .env file

### Useful Commands

```cmd
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs app
docker-compose logs postgres

# Restart all services
docker-compose restart

# Stop all services
docker-compose down

# Rebuild everything
docker-compose down
docker-compose up -d --build

# Check running containers
docker ps

# Access database directly
docker-compose exec postgres psql -U torevar -d telegram_bot
```

### Windows-Specific Tips

1. **Use Command Prompt or PowerShell** as Administrator if you encounter permission issues

2. **Windows Defender**: May block Docker. Add Docker Desktop to exclusions

3. **File Sharing**: Docker Desktop needs access to your drive. Enable in Docker settings

4. **WSL2**: If using WSL2 backend, ensure it's properly configured

## Project Structure

```
SpookMail/
├── client/           # React frontend (admin panel)
├── server/           # Node.js backend and bot
├── shared/           # Database schema
├── scripts/          # Setup scripts
├── docker-compose.yml # Docker configuration
├── .env             # Your API keys and settings
└── README.md        # Documentation
```

## Security Notes

- Never commit your `.env` file to version control
- Use strong passwords for production
- The default setup is for development only
- For production, use HTTPS and secure database credentials

## Need Help?

1. Check the logs: `docker-compose logs -f`
2. Verify your API keys are correct
3. Ensure Docker Desktop is running
4. Try restarting the services: `docker-compose restart`

---

**Your SpookMail bot is now ready to haunt Windows and verify emails!** 🎃👻