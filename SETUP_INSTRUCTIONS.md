# 🎃 SpookMail Setup Instructions

## Prerequisites

Before starting, ensure you have:

1. **Docker & Docker Compose** installed
2. **Telegram Bot Token** from [@BotFather](https://t.me/botfather)
3. **Mailboxlayer API Key** from [mailboxlayer.com](https://mailboxlayer.com)

## Step-by-Step Setup

### 1. Get Your API Keys

**Telegram Bot Token:**
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot with `/newbot`
3. Copy the token (format: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

**Mailboxlayer API Key:**
1. Sign up at [mailboxlayer.com](https://mailboxlayer.com)
2. Go to dashboard and copy your API key
3. Free tier provides 1,000 requests/month

### 2. Configure Environment

```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your keys
nano .env  # or use any text editor
```

**Required .env Configuration:**
```env
# Your actual bot token from BotFather
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11

# Your actual API key from mailboxlayer
MAILBOXLAYER_API_KEY=your_actual_api_key_here

# Set a secure admin password
ADMIN_PASSWORD=YourSecurePassword123

# Optional: change admin username (default: admin)
ADMIN_USERNAME=admin

# Keep these as-is for Docker setup
DATABASE_URL=postgresql://bot_user:bot_password@postgres:5432/telegram_bot
SESSION_SECRET=your-super-secret-session-key-change-in-production
NODE_ENV=development
PORT=3000
```

### 3. Launch with Docker

**If you get Docker authentication errors, use the fix script:**
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run Docker fix (resolves buildx authentication issues)
./scripts/fix-docker.sh
```

**Or run the standard setup:**
```bash
# Run automated setup
./scripts/setup-docker.sh
```

**Manual method (if scripts don't work):**
```bash
# Disable buildx to avoid authentication errors
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

# Build and start all services
docker-compose up -d --build

# Check if everything is running
docker-compose ps

# View logs if needed
docker-compose logs -f
```

### 4. Access Your Services

- **Admin Panel**: http://localhost:3000
- **Database**: localhost:5432 (for direct access)
- **Telegram Bot**: Message your bot on Telegram

### 5. First Login

1. Open http://localhost:3000
2. Login with:
   - Username: `admin` (or what you set in .env)
   - Password: Your password from .env file
3. You should see the spooky-themed dashboard

### 6. Test Your Bot

1. Find your bot on Telegram (search for the name you gave BotFather)
2. Send `/start` to initialize
3. Send any email address to test verification
4. Check admin panel for user activity

## Bot Commands

Your users can use these commands:

- `/start` - Initialize bot and show welcome
- `/check` - Start email verification process
- `/stats` - View personal usage statistics
- `/invite` - Get referral link for bonus checks
- `/help` - Show help and available commands

## Admin Panel Features

- **Dashboard**: User statistics and activity charts
- **Users**: Manage Telegram bot users and their limits
- **Email Checks**: View verification history and analytics
- **Broadcasts**: Send messages to all users or specific groups
- **Settings**: Configure bot behavior and limits
- **Admins**: Manage admin accounts (multi-admin support)

## Troubleshooting

### Common Issues:

**1. Bot doesn't respond:**
```bash
# Check bot service logs
docker-compose logs app

# Verify your bot token in .env
grep TELEGRAM_BOT_TOKEN .env
```

**2. Email verification fails:**
```bash
# Check your mailboxlayer key
grep MAILBOXLAYER_API_KEY .env

# View API errors in logs
docker-compose logs app | grep -i email
```

**3. Cannot access admin panel:**
```bash
# Check if services are running
docker-compose ps

# Restart if needed
docker-compose restart
```

**4. Database connection issues:**
```bash
# Check PostgreSQL status
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Useful Commands:

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs app
docker-compose logs postgres

# Restart all services
docker-compose restart

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access database directly
docker-compose exec postgres psql -U bot_user -d telegram_bot
```

## Configuration Options

### Bot Settings (via Admin Panel):

- **Checks per cycle**: How many free checks users get
- **Cycle duration**: How often limits reset (default: 72 hours)
- **Referral bonus**: Extra checks for successful referrals
- **Welcome message**: Customize bot greeting
- **Bot status**: Enable/disable bot responses

### Usage Limits:

- **Free tier**: 5 checks per 72 hours
- **Referral bonus**: +5 checks per successful referral
- **No limit on referrals**: Users can earn unlimited bonus checks

### Email Verification:

- **Quality scoring**: 0-100 based on multiple factors
- **Disposable detection**: Identifies temporary/throwaway emails
- **Catch-all detection**: Detects catch-all domains
- **Format validation**: Checks email syntax
- **MX record verification**: Confirms domain has mail server
- **SMTP validation**: Tests actual email deliverability

## Security Features

- **Password hashing**: Admin passwords secured with bcrypt
- **Session management**: Secure session-based authentication
- **Rate limiting**: Built-in API request limits
- **Input validation**: All user inputs validated and sanitized
- **SQL injection protection**: Parameterized queries with Drizzle ORM
- **CORS protection**: Configured for production security

## Customization

### Theme Customization:
Edit `client/src/index.css` to modify:
- Color schemes
- Dark/light mode variants
- Animations and effects
- Spooky styling elements

### Bot Messages:
Edit `server/services/telegramBot.ts` to customize:
- Welcome messages
- Command responses
- Error messages
- Help text

### API Integration:
Modify `server/services/emailService.ts` to:
- Add different email verification providers
- Adjust quality scoring algorithms
- Implement additional validation checks

## Production Deployment

For production, consider:

1. **Environment Variables**:
   - Set `NODE_ENV=production`
   - Use strong `SESSION_SECRET`
   - Secure database credentials

2. **Database**:
   - Use managed PostgreSQL service
   - Enable SSL connections
   - Set up regular backups

3. **Security**:
   - Use HTTPS/SSL certificates
   - Configure firewall rules
   - Enable request rate limiting
   - Set up monitoring and logging

4. **Scaling**:
   - Use container orchestration (Kubernetes)
   - Set up load balancing
   - Configure auto-scaling
   - Monitor resource usage

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs with `docker-compose logs`
3. Verify your API keys are correct
4. Ensure all required services are running
5. Check the GitHub repository for updates

---

**Your SpookMail bot is now ready to haunt inboxes and verify emails!** 🎃👻