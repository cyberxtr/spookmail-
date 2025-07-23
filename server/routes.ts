import * as express from 'express';
import { type Express } from 'express';
import { createServer, type Server } from 'http';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { storage } from './storage';
import { requireAuth, optionalAuth, type AuthRequest } from './middleware/auth';
import { hashPassword, comparePassword, getDateRange, calculatePercentageChange } from './utils/helpers';
import { telegramBot } from './services/telegramBot';

// Augment the session interface to include adminId
declare module 'express-session' {
  interface SessionData {
    adminId: string;
  }
}

const router = express.Router();

// Session configuration
const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
const pgStore = connectPgSimple(session);

const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: false,
  ttl: sessionTtl,
  tableName: "sessions",
});

// Auth routes
router.post('/api/auth/login', async (req: AuthRequest, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await storage.getAdmin(username);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await comparePassword(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.adminId = admin.username;
    res.json({ 
      message: 'Login successful',
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.json({ message: 'Logout successful' });
  });
});

router.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
  res.json({
    admin: {
      id: req.admin.id,
      username: req.admin.username,
      role: req.admin.role
    }
  });
});

// Dashboard/Statistics routes
router.get('/api/dashboard/stats', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { start, end } = getDateRange(30); // Last 30 days
    const dailyStats = await storage.getDailyStats(start, end);
    
    const totalUsers = await storage.getActiveUsersCount();
    const recentChecks = await storage.getEmailChecks(undefined, 100);
    
    // Calculate totals and trends
  const currentPeriodStats = dailyStats.reduce((acc, day) => ({
  newUsers: acc.newUsers + (day.newUsers ?? 0),
  totalChecks: acc.totalChecks + (day.totalChecks ?? 0),
  validEmails: acc.validEmails + (day.validEmails ?? 0),
  invalidEmails: acc.invalidEmails + (day.invalidEmails ?? 0),
  newReferrals: acc.newReferrals + (day.newReferrals ?? 0),
  }), {
  newUsers: 0,
  totalChecks: 0,
  validEmails: 0,
  invalidEmails: 0,
  newReferrals: 0,
});

    // Get previous period for comparison
// Get previous period for comparison
  const previousStart = new Date(start);
  previousStart.setDate(previousStart.getDate() - 30);
  const previousEnd = new Date(end);
  previousEnd.setDate(previousEnd.getDate() - 30);

  const previousStats = await storage.getDailyStats(previousStart, previousEnd);
  const previousPeriodStats = previousStats.reduce((acc, day) => ({
  newUsers: acc.newUsers + (day.newUsers ?? 0),
  totalChecks: acc.totalChecks + (day.totalChecks ?? 0),
  validEmails: acc.validEmails + (day.validEmails ?? 0),
  invalidEmails: acc.invalidEmails + (day.invalidEmails ?? 0),
  newReferrals: acc.newReferrals + (day.newReferrals ?? 0),
  }), {
  newUsers: 0,
  totalChecks: 0,
  validEmails: 0,
  invalidEmails: 0,
  newReferrals: 0,
  });


    // Calculate trends
    const trends = {
      newUsers: calculatePercentageChange(currentPeriodStats.newUsers, previousPeriodStats.newUsers),
      totalChecks: calculatePercentageChange(currentPeriodStats.totalChecks, previousPeriodStats.totalChecks),
      validEmails: calculatePercentageChange(currentPeriodStats.validEmails, previousPeriodStats.validEmails),
      newReferrals: calculatePercentageChange(currentPeriodStats.newReferrals, previousPeriodStats.newReferrals),
    };

    res.json({
      totalUsers,
      currentPeriodStats,
      trends,
      dailyStats: dailyStats.slice(0, 7).reverse(), // Last 7 days for chart
      recentChecks: recentChecks.slice(0, 10)
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

// Users management routes
router.get('/api/users', requireAuth, async (req: AuthRequest, res) => {
  try {
    const users = await storage.getTelegramUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.patch('/api/users/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const user = await storage.updateTelegramUser(id, updates);
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Email checks routes
router.get('/api/email-checks', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId, limit = 100 } = req.query;
    const checks = await storage.getEmailChecks(
      userId as string, 
      parseInt(limit as string)
    );
    res.json(checks);
  } catch (error) {
    console.error('Get email checks error:', error);
    res.status(500).json({ message: 'Failed to fetch email checks' });
  }
});

// Bot settings routes
router.get('/api/bot-settings', requireAuth, async (req: AuthRequest, res) => {
  try {
    const settings = await storage.getAllBotSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get bot settings error:', error);
    res.status(500).json({ message: 'Failed to fetch bot settings' });
  }
});

router.put('/api/bot-settings/:key', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    
    const setting = await storage.setBotSetting({ key, value, description });
    res.json(setting);
  } catch (error) {
    console.error('Set bot setting error:', error);
    res.status(500).json({ message: 'Failed to update bot setting' });
  }
});

// Bot commands routes
router.get('/api/bot-commands', requireAuth, async (req: AuthRequest, res) => {
  try {
    const commands = await storage.getBotCommands();
    res.json(commands);
  } catch (error) {
    console.error('Get bot commands error:', error);
    res.status(500).json({ message: 'Failed to fetch bot commands' });
  }
});

router.post('/api/bot-commands', requireAuth, async (req: AuthRequest, res) => {
  try {
    const command = await storage.createBotCommand(req.body);
    res.json(command);
  } catch (error) {
    console.error('Create bot command error:', error);
    res.status(500).json({ message: 'Failed to create bot command' });
  }
});

router.put('/api/bot-commands/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const command = await storage.updateBotCommand(id, req.body);
    res.json(command);
  } catch (error) {
    console.error('Update bot command error:', error);
    res.status(500).json({ message: 'Failed to update bot command' });
  }
});

router.delete('/api/bot-commands/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await storage.deleteBotCommand(id);
    res.json({ message: 'Command deleted successfully' });
  } catch (error) {
    console.error('Delete bot command error:', error);
    res.status(500).json({ message: 'Failed to delete bot command' });
  }
});

// Broadcast routes
router.get('/api/broadcasts', requireAuth, async (req: AuthRequest, res) => {
  try {
    const broadcasts = await storage.getBroadcasts();
    res.json(broadcasts);
  } catch (error) {
    console.error('Get broadcasts error:', error);
    res.status(500).json({ message: 'Failed to fetch broadcasts' });
  }
});

router.post('/api/broadcasts', requireAuth, async (req: AuthRequest, res) => {
  try {
    const broadcastData = {
      ...req.body,
      createdBy: req.admin.id
    };
    
    const broadcast = await storage.createBroadcast(broadcastData);
    res.json(broadcast);
  } catch (error) {
    console.error('Create broadcast error:', error);
    res.status(500).json({ message: 'Failed to create broadcast' });
  }
});

router.post('/api/broadcasts/:id/send', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const broadcast = await storage.getBroadcasts();
    const targetBroadcast = broadcast.find(b => b.id === id);
    
    if (!targetBroadcast) {
      return res.status(404).json({ message: 'Broadcast not found' });
    }

    // Update status to sending
    await storage.updateBroadcast(id, { 
      status: 'sending',
      sentAt: new Date()
    });

    // Send broadcast via bot
  const result = await telegramBot.sendBroadcast(
  targetBroadcast.message ?? undefined,
  targetBroadcast.messageType ?? undefined,
  targetBroadcast.mediaUrl || undefined,
  targetBroadcast.targetAudience ?? undefined
  );

    // Update broadcast with results
    await storage.updateBroadcast(id, {
      status: result.failed === 0 ? 'completed' : 'completed',
      sentCount: result.sent,
      totalTargets: result.sent + result.failed
    });

    res.json({ 
      message: 'Broadcast sent successfully',
      sent: result.sent,
      failed: result.failed
    });
  } catch (error) {
    console.error('Send broadcast error:', error);
    res.status(500).json({ message: 'Failed to send broadcast' });
  }
});

router.delete('/api/broadcasts/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await storage.deleteBroadcast(id);
    res.json({ message: 'Broadcast deleted successfully' });
  } catch (error) {
    console.error('Delete broadcast error:', error);
    res.status(500).json({ message: 'Failed to delete broadcast' });
  }
});

// Admin management routes
router.get('/api/admins', requireAuth, async (req: AuthRequest, res) => {
  try {
    const admins = await storage.getAdmins();
    // Remove password from response
    const safeAdmins = admins.map(({ password, ...admin }) => admin);
    res.json(safeAdmins);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Failed to fetch admins' });
  }
});

router.post('/api/admins', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const hashedPassword = await hashPassword(password);
    const admin = await storage.createAdmin({
      username,
      password: hashedPassword,
      role: role || 'admin'
    });

    // Remove password from response
    const { password: _, ...safeAdmin } = admin;
    res.json(safeAdmin);
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Failed to create admin' });
  }
});

router.delete('/api/admins/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting own account
    if (req.admin.id === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await storage.deleteAdmin(id);
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Failed to delete admin' });
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  }));

  // Use the router
  app.use(router);

  const httpServer = createServer(app);
  return httpServer;
}