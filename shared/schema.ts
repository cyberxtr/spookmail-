import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Admin users table
export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).default("admin").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Telegram users table
export const telegramUsers = pgTable("telegram_users", {
  id: text("id").primaryKey(), // Telegram user ID as string
  username: varchar("username", { length: 100 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  languageCode: varchar("language_code", { length: 10 }),
  isBot: boolean("is_bot").default(false),
  checksUsed: integer("checks_used").default(0),
  checksLimit: integer("checks_limit").default(5),
  lastCheckReset: timestamp("last_check_reset").defaultNow(),
  referralCode: varchar("referral_code", { length: 20 }).unique(),
  referredBy: text("referred_by"),
  totalReferrals: integer("total_referrals").default(0),
  bonusChecks: integer("bonus_checks").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email verification logs
export const emailChecks = pgTable("email_checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => telegramUsers.id).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  isValid: boolean("is_valid"),
  isDisposable: boolean("is_disposable"),
  isCatchall: boolean("is_catchall"),
  qualityScore: integer("quality_score"),
  apiResponse: jsonb("api_response"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bot settings
export const botSettings = pgTable("bot_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom bot commands/buttons
export const botCommands = pgTable("bot_commands", {
  id: uuid("id").primaryKey().defaultRandom(),
  command: varchar("command", { length: 50 }).notNull(),
  description: text("description"),
  response: text("response"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Broadcast messages
export const broadcasts = pgTable("broadcasts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  messageType: varchar("message_type", { length: 20 }).default("text"), // text, photo, link
  mediaUrl: text("media_url"),
  targetAudience: varchar("target_audience", { length: 20 }).default("all"), // all, active, referrers
  sentCount: integer("sent_count").default(0),
  totalTargets: integer("total_targets").default(0),
  status: varchar("status", { length: 20 }).default("draft"), // draft, sending, completed, failed
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  createdBy: uuid("created_by").references(() => admins.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Statistics tracking
export const dailyStats = pgTable("daily_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: timestamp("date").defaultNow(),
  newUsers: integer("new_users").default(0),
  totalChecks: integer("total_checks").default(0),
  validEmails: integer("valid_emails").default(0),
  invalidEmails: integer("invalid_emails").default(0),
  newReferrals: integer("new_referrals").default(0),
  activeUsers: integer("active_users").default(0),
});

// Insert schemas
export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTelegramUserSchema = createInsertSchema(telegramUsers).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertEmailCheckSchema = createInsertSchema(emailChecks).omit({
  id: true,
  createdAt: true,
});

export const insertBotSettingSchema = createInsertSchema(botSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertBotCommandSchema = createInsertSchema(botCommands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBroadcastSchema = createInsertSchema(broadcasts).omit({
  id: true,
  sentCount: true,
  totalTargets: true,
  status: true,
  sentAt: true,
  createdAt: true,
});

export const insertDailyStatsSchema = createInsertSchema(dailyStats).omit({
  id: true,
  date: true,
});

// Types
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type TelegramUser = typeof telegramUsers.$inferSelect;
export type InsertTelegramUser = z.infer<typeof insertTelegramUserSchema>;

export type EmailCheck = typeof emailChecks.$inferSelect;
export type InsertEmailCheck = z.infer<typeof insertEmailCheckSchema>;

export type BotSetting = typeof botSettings.$inferSelect;
export type InsertBotSetting = z.infer<typeof insertBotSettingSchema>;

export type BotCommand = typeof botCommands.$inferSelect;
export type InsertBotCommand = z.infer<typeof insertBotCommandSchema>;

export type Broadcast = typeof broadcasts.$inferSelect;
export type InsertBroadcast = z.infer<typeof insertBroadcastSchema>;

export type DailyStats = typeof dailyStats.$inferSelect;
export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;