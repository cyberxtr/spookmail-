# SpookMail - Telegram Email Verification Bot

A professional Telegram bot for email verification with a spooky-themed admin panel, referral system, and usage limits. Built with Node.js, React, PostgreSQL, and Docker.

## Features

### 🎃 Telegram Bot
- **Email Verification**: Accurate email validation using mailboxlayer.com API
- **Usage Limits**: 5 free checks every 72 hours per user
- **Referral System**: Unique invite links with bonus checks for referrals
- **User Management**: Automatic user registration and tracking
- **Interactive Commands**: User-friendly bot commands and inline keyboards

### 👻 Admin Panel
- **Spooky Theme**: Dark/light mode with Halloween-inspired design
- **Dashboard**: Real-time statistics and performance metrics
- **User Management**: View and manage Telegram bot users
- **Email Check History**: Detailed verification logs and analytics
- **Broadcast System**: Send messages to all users or targeted audiences
- **Bot Settings**: Configure bot behavior and parameters
- **Admin Accounts**: Multi-admin support with role-based access

### 🔒 Security & Performance
- Session-based authentication for admin panel
- Rate limiting and API error handling
- Secure password hashing with bcrypt
- PostgreSQL database with optimized queries
- Docker containerization for easy deployment

## Quick Start with Docker Compose

### Prerequisites
- Docker and Docker Compose installed
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Mailboxlayer API Key (from [mailboxlayer.com](https://mailboxlayer.com))

### Setup Instructions

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd spookmail-bot
   cp .env.example .env
   ```

2. **Configure Environment**
   Edit `.env` file with your credentials:
   ```env
   TELEGRAM_BOT_TOKEN=your-bot-token-here
   MAILBOXLAYER_API_KEY=your-api-key-here
   ADMIN_PASSWORD=your-secure-password
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access Admin Panel**
   - URL: http://localhost:3000
   - Username: `admin`
   - Password: (from your .env file)

### Bot Commands
- `/start` - Start the bot and show welcome message
- `/check` - Begin email verification process
- `/stats` - View personal usage statistics
- `/invite` - Get referral link for bonus checks
- `/help` - Show help and available commands

## Development Setup

### Without Docker

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   # Start PostgreSQL (local installation required)
   npm run db:push  # Run database migrations
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `TELEGRAM_BOT_TOKEN` | Bot token from BotFather | Yes |
| `MAILBOXLAYER_API_KEY` | Email verification API key | Yes |
| `SESSION_SECRET` | Secure session encryption key | Yes |
| `ADMIN_USERNAME` | Default admin username | No (default: admin) |
| `ADMIN_PASSWORD` | Default admin password | No (default: spooky123) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `PORT` | Server port | No (default: 3000) |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current admin info

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Users
- `GET /api/users` - List all users
- `PATCH /api/users/:id` - Update user settings

### Email Checks
- `GET /api/email-checks` - Email verification history

### Broadcasts
- `GET /api/broadcasts` - List broadcasts
- `POST /api/broadcasts` - Create broadcast
- `POST /api/broadcasts/:id/send` - Send broadcast

### Bot Settings
- `GET /api/bot-settings` - Get bot configuration
- `PUT /api/bot-settings/:key` - Update bot setting

## Architecture

### Backend Stack
- **Node.js** with Express.js
- **PostgreSQL** with Drizzle ORM
- **Telegraf** for Telegram Bot API
- **bcryptjs** for password hashing
- **express-session** for authentication

### Frontend Stack
- **React** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **TanStack Query** for API state management
- **Wouter** for routing
- **Radix UI** for components

### Database Schema
- **admins** - Admin user accounts
- **telegram_users** - Bot user data and referrals
- **email_checks** - Email verification history
- **bot_settings** - Configurable bot parameters
- **broadcasts** - Message broadcast history
- **daily_stats** - Usage analytics

## Customization

### Bot Messages
Edit bot messages in `server/services/telegramBot.ts`:
- Welcome message
- Help text
- Error messages
- Command responses

### Admin Panel Theme
Customize the spooky theme in `client/src/index.css`:
- Color scheme
- Animations
- Dark/light mode variants

### Usage Limits
Configure in the admin panel or environment:
- Checks per cycle
- Cycle duration
- Referral bonuses

## Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check `TELEGRAM_BOT_TOKEN` is correct
   - Ensure bot is started with `/start` command
   - Check server logs for errors

2. **Email verification fails**
   - Verify `MAILBOXLAYER_API_KEY` is valid
   - Check API rate limits and quotas
   - Review network connectivity

3. **Admin panel login issues**
   - Confirm `ADMIN_USERNAME` and `ADMIN_PASSWORD`
   - Check database connection
   - Clear browser cookies

4. **Database connection errors**
   - Verify `DATABASE_URL` format
   - Ensure PostgreSQL is running
   - Check network connectivity

### Logs
- Application logs: `docker-compose logs app`
- Database logs: `docker-compose logs postgres`
- Real-time logs: `docker-compose logs -f`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or feature requests:
- Create an issue on the repository
- Contact the development team
- Check the troubleshooting section

---

**SpookMail** - Professional email verification with a spooky twist! 🎃👻