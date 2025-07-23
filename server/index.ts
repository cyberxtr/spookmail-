import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { registerRoutes } from './routes';
import { telegramBot } from './services/telegramBot';
import { storage } from './storage';
import { hashPassword } from './utils/helpers';

dotenv.config();

const app = express();
// PORT variable removed from here

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for development
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || false
    : true,
  credentials: true,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client')));

  // Handle React routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../client/index.html'));
  });
}

async function initializeDatabase() {
  try {
    console.log('🗄️ Initializing database...');

    // Create default admin if it doesn't exist
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'spooky123';

    const existingAdmin = await storage.getAdmin(adminUsername);
    if (!existingAdmin) {
      console.log('👑 Creating default admin account...');
      const hashedPassword = await hashPassword(adminPassword);
      await storage.createAdmin({
        username: adminUsername,
        password: hashedPassword,
        role: 'super_admin'
      });
      console.log(`👑 Default admin created: ${adminUsername}`);
      console.log(`🔐 Default password: ${adminPassword}`);
      console.log('⚠️  Please change the default password after first login!');
    }

    // Initialize bot settings
    const botSettings = [
      { key: 'welcome_message', value: 'Welcome to SpookMail Checker! 🎃', description: 'Bot welcome message' },
      { key: 'checks_per_cycle', value: '5', description: 'Number of free checks per cycle' },
      { key: 'cycle_hours', value: '72', description: 'Hours between check resets' },
      { key: 'referral_bonus', value: '5', description: 'Bonus checks per referral' },
      { key: 'bot_status', value: 'active', description: 'Bot operational status' }
    ];

    for (const setting of botSettings) {
      const existing = await storage.getBotSetting(setting.key);
      if (!existing) {
        await storage.setBotSetting(setting);
      }
    }

    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    // Register API routes
    const server = await registerRoutes(app);

    // Start Telegram bot
    await telegramBot.initialize();

    // Start HTTP server
    const PORT = process.env.PORT || 5000;

      server.listen(PORT, '0.0.0.0', () => {
      console.log('🎃 SpookMail Checker Server Started! 🎃');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🤖 Telegram bot is active`);
      console.log(`🌐 Admin panel: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/admin`);
      console.log('=' .repeat(50));
    });


    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down gracefully...');
      await telegramBot.stop();
      server.close(() => {
        console.log('👋 Server stopped');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();