import {
  admins,
  telegramUsers,
  emailChecks,
  botSettings,
  botCommands,
  broadcasts,
  dailyStats,
  type Admin,
  type InsertAdmin,
  type TelegramUser,
  type InsertTelegramUser,
  type EmailCheck,
  type InsertEmailCheck,
  type BotSetting,
  type InsertBotSetting,
  type BotCommand,
  type InsertBotCommand,
  type Broadcast,
  type InsertBroadcast,
  type DailyStats,
  type InsertDailyStats,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // Admin operations
  getAdmin(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAdmins(): Promise<Admin[]>;
  updateAdmin(id: string, updates: Partial<InsertAdmin>): Promise<Admin>;
  deleteAdmin(id: string): Promise<void>;

  // Telegram user operations
  getTelegramUser(id: string): Promise<TelegramUser | undefined>;
  createTelegramUser(user: InsertTelegramUser): Promise<TelegramUser>;
  updateTelegramUser(id: string, updates: Partial<InsertTelegramUser>): Promise<TelegramUser>;
  getTelegramUsers(): Promise<TelegramUser[]>;
  getUserByReferralCode(code: string): Promise<TelegramUser | undefined>;
  incrementUserReferrals(userId: string): Promise<void>;
  resetUserChecks(userId: string): Promise<void>;
  getActiveUsersCount(): Promise<number>;

  // Email check operations
  createEmailCheck(check: InsertEmailCheck): Promise<EmailCheck>;
  getEmailChecks(userId?: string, limit?: number): Promise<EmailCheck[]>;
  getUserCheckCount(userId: string, since: Date): Promise<number>;

  // Bot settings operations
  getBotSetting(key: string): Promise<BotSetting | undefined>;
  setBotSetting(setting: InsertBotSetting): Promise<BotSetting>;
  getAllBotSettings(): Promise<BotSetting[]>;

  // Bot commands operations
  getBotCommands(): Promise<BotCommand[]>;
  createBotCommand(command: InsertBotCommand): Promise<BotCommand>;
  updateBotCommand(id: string, updates: Partial<InsertBotCommand>): Promise<BotCommand>;
  deleteBotCommand(id: string): Promise<void>;

  // Broadcast operations
  createBroadcast(broadcast: InsertBroadcast): Promise<Broadcast>;
  getBroadcasts(): Promise<Broadcast[]>;
  updateBroadcast(id: string, updates: Partial<Broadcast>): Promise<Broadcast>;
  deleteBroadcast(id: string): Promise<void>;

  // Statistics operations
  createDailyStats(stats: InsertDailyStats): Promise<DailyStats>;
  getDailyStats(startDate: Date, endDate: Date): Promise<DailyStats[]>;
  getLatestStats(): Promise<DailyStats | undefined>;
  updateDailyStats(date: Date, updates: Partial<InsertDailyStats>): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Admin operations
  async getAdmin(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin;
  }

  async createAdmin(adminData: InsertAdmin): Promise<Admin> {
    const [admin] = await db.insert(admins).values(adminData).returning();
    return admin;
  }

  async getAdmins(): Promise<Admin[]> {
    return await db.select().from(admins).orderBy(desc(admins.createdAt));
  }

  async updateAdmin(id: string, updates: Partial<InsertAdmin>): Promise<Admin> {
    const [admin] = await db
      .update(admins)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(admins.id, id))
      .returning();
    return admin;
  }

  async deleteAdmin(id: string): Promise<void> {
    await db.delete(admins).where(eq(admins.id, id));
  }

  // Telegram user operations
  async getTelegramUser(id: string): Promise<TelegramUser | undefined> {
    const [user] = await db.select().from(telegramUsers).where(eq(telegramUsers.id, id));
    return user;
  }

  async createTelegramUser(userData: InsertTelegramUser): Promise<TelegramUser> {
    const [user] = await db.insert(telegramUsers).values(userData).returning();
    return user;
  }

  async updateTelegramUser(id: string, updates: Partial<InsertTelegramUser>): Promise<TelegramUser> {
    const [user] = await db
      .update(telegramUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(telegramUsers.id, id))
      .returning();
    return user;
  }

  async getTelegramUsers(): Promise<TelegramUser[]> {
    return await db.select().from(telegramUsers).orderBy(desc(telegramUsers.createdAt));
  }

  async getUserByReferralCode(code: string): Promise<TelegramUser | undefined> {
    const [user] = await db.select().from(telegramUsers).where(eq(telegramUsers.referralCode, code));
    return user;
  }

  async incrementUserReferrals(userId: string): Promise<void> {
    await db
      .update(telegramUsers)
      .set({ 
        totalReferrals: sql`${telegramUsers.totalReferrals} + 1`,
        bonusChecks: sql`${telegramUsers.bonusChecks} + 5`,
        updatedAt: new Date()
      })
      .where(eq(telegramUsers.id, userId));
  }

  async resetUserChecks(userId: string): Promise<void> {
    await db
      .update(telegramUsers)
      .set({ 
        checksUsed: 0,
        lastCheckReset: new Date(),
        updatedAt: new Date()
      })
      .where(eq(telegramUsers.id, userId));
  }

  async getActiveUsersCount(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(telegramUsers)
      .where(eq(telegramUsers.isActive, true));
    return result[0].count;
  }

  // Email check operations
  async createEmailCheck(checkData: InsertEmailCheck): Promise<EmailCheck> {
    const [check] = await db.insert(emailChecks).values(checkData).returning();
    return check;
  }

  async getEmailChecks(userId?: string, limit: number = 100): Promise<EmailCheck[]> {
    const query = db.select().from(emailChecks);
    
    if (userId) {
      query.where(eq(emailChecks.userId, userId));
    }
    
    return await query.orderBy(desc(emailChecks.createdAt)).limit(limit);
  }

  async getUserCheckCount(userId: string, since: Date): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(emailChecks)
      .where(
        and(
          eq(emailChecks.userId, userId),
          gte(emailChecks.createdAt, since)
        )
      );
    return result[0].count;
  }

  // Bot settings operations
  async getBotSetting(key: string): Promise<BotSetting | undefined> {
    const [setting] = await db.select().from(botSettings).where(eq(botSettings.key, key));
    return setting;
  }

  async setBotSetting(settingData: InsertBotSetting): Promise<BotSetting> {
    const [setting] = await db
      .insert(botSettings)
      .values(settingData)
      .onConflictDoUpdate({
        target: botSettings.key,
        set: { 
          value: settingData.value,
          description: settingData.description,
          updatedAt: new Date()
        }
      })
      .returning();
    return setting;
  }

  async getAllBotSettings(): Promise<BotSetting[]> {
    return await db.select().from(botSettings).orderBy(botSettings.key);
  }

  // Bot commands operations
  async getBotCommands(): Promise<BotCommand[]> {
    return await db.select().from(botCommands).orderBy(botCommands.command);
  }

  async createBotCommand(commandData: InsertBotCommand): Promise<BotCommand> {
    const [command] = await db.insert(botCommands).values(commandData).returning();
    return command;
  }

  async updateBotCommand(id: string, updates: Partial<InsertBotCommand>): Promise<BotCommand> {
    const [command] = await db
      .update(botCommands)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(botCommands.id, id))
      .returning();
    return command;
  }

  async deleteBotCommand(id: string): Promise<void> {
    await db.delete(botCommands).where(eq(botCommands.id, id));
  }

  // Broadcast operations
  async createBroadcast(broadcastData: InsertBroadcast): Promise<Broadcast> {
    const [broadcast] = await db.insert(broadcasts).values(broadcastData).returning();
    return broadcast;
  }

  async getBroadcasts(): Promise<Broadcast[]> {
    return await db.select().from(broadcasts).orderBy(desc(broadcasts.createdAt));
  }

  async updateBroadcast(id: string, updates: Partial<Broadcast>): Promise<Broadcast> {
    const [broadcast] = await db
      .update(broadcasts)
      .set(updates)
      .where(eq(broadcasts.id, id))
      .returning();
    return broadcast;
  }

  async deleteBroadcast(id: string): Promise<void> {
    await db.delete(broadcasts).where(eq(broadcasts.id, id));
  }

  // Statistics operations
  async createDailyStats(statsData: InsertDailyStats): Promise<DailyStats> {
    const [stats] = await db.insert(dailyStats).values(statsData).returning();
    return stats;
  }

  async getDailyStats(startDate: Date, endDate: Date): Promise<DailyStats[]> {
    return await db
      .select()
      .from(dailyStats)
      .where(
        and(
          gte(dailyStats.date, startDate),
          lte(dailyStats.date, endDate)
        )
      )
      .orderBy(desc(dailyStats.date));
  }

  async getLatestStats(): Promise<DailyStats | undefined> {
    const [stats] = await db
      .select()
      .from(dailyStats)
      .orderBy(desc(dailyStats.date))
      .limit(1);
    return stats;
  }

  async updateDailyStats(date: Date, updates: Partial<InsertDailyStats>): Promise<void> {
    await db
      .update(dailyStats)
      .set(updates)
      .where(eq(dailyStats.date, date));
  }
}

export const storage = new DatabaseStorage();