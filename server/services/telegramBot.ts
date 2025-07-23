import { Telegraf, Context, Markup } from 'telegraf';
import { storage } from '../storage';
import { emailService } from './emailService';
import { generateReferralCode, isValidEmail } from '../utils/helpers';

export interface BotContext extends Context {
  user?: any;
}

class TelegramBotService {
  private bot: Telegraf<BotContext>;
  private isInitialized = false;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    }
    
    this.bot = new Telegraf<BotContext>(token);
    this.setupMiddleware();
    this.setupCommands();
    this.setupActions();
  }

  private setupMiddleware() {
    // User registration middleware
    this.bot.use(async (ctx, next) => {
      if (ctx.from && !ctx.from.is_bot) {
        let user = await storage.getTelegramUser(ctx.from.id.toString());
        
        if (!user) {
          // Create new user
          const referralCode = generateReferralCode();
          user = await storage.createTelegramUser({
            id: ctx.from.id.toString(),
            username: ctx.from.username,
            firstName: ctx.from.first_name,
            lastName: ctx.from.last_name,
            languageCode: ctx.from.language_code,
            isBot: false,
            referralCode
          });
          
          // Update daily stats
          await this.updateDailyStats('newUsers', 1);
        }
        
        ctx.user = user;
      }
      
      return next();
    });
  }

  private setupCommands() {
    // Start command
    this.bot.start(async (ctx) => {
      const args = ctx.message?.text?.split(' ');
      const referralCode = args && args.length > 1 ? args[1] : null;
      
      // Handle referral
      if (referralCode && ctx.user && !ctx.user.referredBy) {
        const referrer = await storage.getUserByReferralCode(referralCode);
        if (referrer && referrer.id !== ctx.user.id) {
          await storage.updateTelegramUser(ctx.user.id, { referredBy: referrer.id });
          await storage.incrementUserReferrals(referrer.id);
          await this.updateDailyStats('newReferrals', 1);
          
          await ctx.reply(`🎉 Welcome! You've been referred by ${referrer.firstName || referrer.username}. You both get bonus checks!`);
        }
      }
      
      const welcomeMessage = `
🎃 **Welcome to SpookMail Checker!** 🎃

Your supernatural email verification assistant is here to help you check email validity with otherworldly accuracy.

✨ **What I can do:**
📧 Verify email addresses
🔍 Check for disposable emails
📊 Provide detailed verification reports
🎁 Earn bonus checks through referrals

🆓 **Free tier:** 5 checks every 72 hours
🎯 **Invite friends** to get more checks!

Use /check to start verifying emails
Use /stats to see your usage
Use /help for more commands
Use /invite to get your referral link
      `;
      
      await ctx.reply(welcomeMessage, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('📧 Check Email', 'check_email')],
          [Markup.button.callback('📊 My Stats', 'my_stats'), Markup.button.callback('🎁 Invite Friends', 'invite_friends')],
          [Markup.button.callback('ℹ️ Help', 'help')]
        ])
      });
    });

    // Check command
    this.bot.command('check', async (ctx) => {
      await this.handleEmailCheck(ctx);
    });

    // Stats command
    this.bot.command('stats', async (ctx) => {
      await this.handleStats(ctx);
    });

    // Invite command
    this.bot.command('invite', async (ctx) => {
      await this.handleInvite(ctx);
    });

    // Help command
    this.bot.command('help', async (ctx) => {
      const helpMessage = `
🎃 **SpookMail Checker Commands** 🎃

📧 **/check** - Verify an email address
📊 **/stats** - View your usage statistics
🎁 **/invite** - Get your referral link
ℹ️ **/help** - Show this help message

**How to check emails:**
1. Use /check command
2. Send me any email address
3. Get detailed verification results

**Referral System:**
- Share your invite link
- Each successful referral gives you 5 bonus checks
- Your friend also gets bonus checks!

**Limits:**
- Free: 5 checks per 72 hours
- Bonus checks from referrals
- Premium features coming soon!

Need help? Contact @admin
      `;
      
      await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
    });

    // Handle email input
    this.bot.on('text', async (ctx) => {
      const text = ctx.message.text;
      
      // Check if it's an email
      if (isValidEmail(text)) {
        await this.handleEmailVerification(ctx, text);
      } else {
        await ctx.reply('👻 Please send me a valid email address to check!');
      }
    });
  }

  private setupActions() {
    this.bot.action('check_email', async (ctx) => {
      await ctx.answerCbQuery();
      await this.handleEmailCheck(ctx);
    });

    this.bot.action('my_stats', async (ctx) => {
      await ctx.answerCbQuery();
      await this.handleStats(ctx);
    });

    this.bot.action('invite_friends', async (ctx) => {
      await ctx.answerCbQuery();
      await this.handleInvite(ctx);
    });

    this.bot.action('help', async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.reply('Send me /help to see all available commands! 🎃');
    });
  }

  private async handleEmailCheck(ctx: BotContext) {
    await ctx.reply('📧 Send me an email address to verify! I\'ll check its validity, format, and more.');
  }

  private async handleEmailVerification(ctx: BotContext, email: string) {
    if (!ctx.user) {
      await ctx.reply('❌ User not found. Please restart the bot with /start');
      return;
    }

    // Check rate limits
    const canCheck = await this.checkRateLimit(ctx.user);
    if (!canCheck) {
      const nextReset = new Date(ctx.user.lastCheckReset);
      nextReset.setHours(nextReset.getHours() + 72);
      
      await ctx.reply(`🚫 You've reached your check limit! 

📊 **Your Stats:**
• Used: ${ctx.user.checksUsed}/${ctx.user.checksLimit}
• Bonus checks: ${ctx.user.bonusChecks}
• Next reset: ${nextReset.toLocaleString()}

🎁 **Get more checks:**
Use /invite to share your referral link and earn bonus checks!`, 
        { parse_mode: 'Markdown' });
      return;
    }

    const loadingMsg = await ctx.reply('🔮 Performing supernatural email verification... Please wait...');

    try {
      // Verify email
      const result = await emailService.verifyEmail(email);
      
      // Save to database
      await storage.createEmailCheck({
        userId: ctx.user.id,
        email: result.email,
        isValid: result.isValid,
        isDisposable: result.isDisposable,
        isCatchall: result.isCatchall,
        qualityScore: result.qualityScore,
        apiResponse: result
      });

      // Update user check count
      await storage.updateTelegramUser(ctx.user.id, {
        checksUsed: ctx.user.checksUsed + 1
      });

      // Update daily stats
      await this.updateDailyStats('totalChecks', 1);
      if (result.isValid) {
        await this.updateDailyStats('validEmails', 1);
      } else {
        await this.updateDailyStats('invalidEmails', 1);
      }

      // Generate result message
      const statusEmoji = result.isValid ? '✅' : '❌';
      const qualityEmoji = this.getQualityEmoji(result.qualityScore);
      
      const resultMessage = `
${statusEmoji} **Email Verification Result** ${statusEmoji}

📧 **Email:** \`${result.email}\`
${result.isValid ? '✅' : '❌'} **Valid:** ${result.isValid ? 'Yes' : 'No'}
${qualityEmoji} **Quality Score:** ${result.qualityScore}/100
🗑️ **Disposable:** ${result.isDisposable ? 'Yes' : 'No'}
🕳️ **Catch-all:** ${result.isCatchall ? 'Yes' : 'No'}

**Technical Details:**
• Format: ${result.format ? '✅' : '❌'}
• MX Record: ${result.mx ? '✅' : '❌'}
• SMTP: ${result.smtp ? '✅' : '❌'}

${result.reason ? `**Reason:** ${result.reason}` : ''}
${result.didYouMean ? `**Did you mean:** ${result.didYouMean}` : ''}

📊 **Checks remaining:** ${(ctx.user.checksLimit + ctx.user.bonusChecks) - (ctx.user.checksUsed + 1)}
      `;

      await ctx.telegram.editMessageText(
        ctx.chat?.id,
        loadingMsg.message_id,
        undefined,
        resultMessage,
        { 
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('📊 My Stats', 'my_stats')],
            [Markup.button.callback('🎁 Get More Checks', 'invite_friends')]
          ])
        }
      );

    } catch (error) {
      console.error('Email verification error:', error);
      await ctx.telegram.editMessageText(
        ctx.chat?.id,
        loadingMsg.message_id,
        undefined,
        '💀 Oops! Something went wrong during verification. Please try again later.'
      );
    }
  }

  private async handleStats(ctx: BotContext) {
    if (!ctx.user) return;

    const checksRemaining = (ctx.user.checksLimit + ctx.user.bonusChecks) - ctx.user.checksUsed;
    const nextReset = new Date(ctx.user.lastCheckReset);
    nextReset.setHours(nextReset.getHours() + 72);

    const statsMessage = `
📊 **Your SpookMail Stats** 📊

👤 **User:** ${ctx.user.firstName || ctx.user.username}
🆔 **ID:** \`${ctx.user.id}\`

📧 **Email Checks:**
• Used: ${ctx.user.checksUsed}/${ctx.user.checksLimit}
• Bonus checks: ${ctx.user.bonusChecks}
• Remaining: ${Math.max(0, checksRemaining)}
• Next reset: ${nextReset.toLocaleString()}

🎁 **Referrals:**
• Total referrals: ${ctx.user.totalReferrals}
• Your code: \`${ctx.user.referralCode}\`

📅 **Member since:** ${new Date(ctx.user.createdAt).toLocaleDateString()}
    `;

    await ctx.reply(statsMessage, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🎁 Invite Friends', 'invite_friends')],
        [Markup.button.callback('📧 Check Email', 'check_email')]
      ])
    });
  }

  private async handleInvite(ctx: BotContext) {
    if (!ctx.user) return;

    const botUsername = this.bot.botInfo?.username || 'SpookMailBot';
    const inviteLink = `https://t.me/${botUsername}?start=${ctx.user.referralCode}`;

    const inviteMessage = `
🎁 **Invite Friends & Earn Bonus Checks!** 🎁

Share your special invite link:
\`${inviteLink}\`

**Rewards:**
• You get 5 bonus checks for each friend
• Your friend gets bonus checks too!
• No limit on referrals!

**How it works:**
1. Share your link with friends
2. They click and start the bot
3. Both of you get bonus checks instantly!

**Your Stats:**
• Total referrals: ${ctx.user.totalReferrals}
• Bonus checks earned: ${ctx.user.bonusChecks}
• Your referral code: \`${ctx.user.referralCode}\`
    `;

    await ctx.reply(inviteMessage, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('📱 Share Link', `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent('Check out this awesome email verification bot! 🎃')}`)],
        [Markup.button.callback('📊 My Stats', 'my_stats')]
      ])
    });
  }

  private async checkRateLimit(user: any): Promise<boolean> {
    const resetTime = new Date(user.lastCheckReset);
    resetTime.setHours(resetTime.getHours() + 72);
    const now = new Date();

    // Check if reset time has passed
    if (now > resetTime) {
      await storage.resetUserChecks(user.id);
      user.checksUsed = 0; // Update local copy
      return true;
    }

    // Check if user has remaining checks (including bonus)
    const totalChecks = user.checksLimit + user.bonusChecks;
    return user.checksUsed < totalChecks;
  }

  private getQualityEmoji(score: number): string {
    if (score >= 90) return '🌟';
    if (score >= 70) return '⭐';
    if (score >= 50) return '🔶';
    if (score >= 30) return '🔸';
    return '❌';
  }

  private async updateDailyStats(field: string, increment: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    try {
      await storage.updateDailyStats(today, { [field]: increment });
    } catch {
      // If no stats exist for today, create them
      await storage.createDailyStats({ [field]: increment });
    }
  }

  async sendBroadcast(message: string, messageType: string = 'text', mediaUrl?: string, targetAudience: string = 'all'): Promise<{ sent: number; failed: number }> {
    let users: any[] = [];
    
    switch (targetAudience) {
      case 'active':
        users = await storage.getTelegramUsers();
        users = users.filter(u => u.isActive);
        break;
      case 'referrers':
        users = await storage.getTelegramUsers();
        users = users.filter(u => u.totalReferrals > 0);
        break;
      default:
        users = await storage.getTelegramUsers();
    }

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        if (messageType === 'photo' && mediaUrl) {
          await this.bot.telegram.sendPhoto(user.id, mediaUrl, { caption: message });
        } else {
          await this.bot.telegram.sendMessage(user.id, message, { parse_mode: 'Markdown' });
        }
        sent++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to send message to user ${user.id}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.bot.launch();
      this.isInitialized = true;
      console.log('🎃 Telegram bot started successfully!');
      
      // Set bot commands
      await this.bot.telegram.setMyCommands([
        { command: 'start', description: '🎃 Start the bot' },
        { command: 'check', description: '📧 Check an email address' },
        { command: 'stats', description: '📊 View your statistics' },
        { command: 'invite', description: '🎁 Get referral link' },
        { command: 'help', description: 'ℹ️ Show help' }
      ]);
      
    } catch (error) {
      console.error('Failed to start Telegram bot:', error);
      throw error;
    }
  }

  async stop() {
    if (this.isInitialized) {
      this.bot.stop();
      this.isInitialized = false;
      console.log('Telegram bot stopped');
    }
  }

  getInstance() {
    return this.bot;
  }
}

export const telegramBot = new TelegramBotService();