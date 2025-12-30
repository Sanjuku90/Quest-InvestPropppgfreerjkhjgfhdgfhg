import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  investmentBalance: integer("investment_balance").default(0), // In XOF
  walletBalance: integer("wallet_balance").default(0), // Real withdrawable balance
  bonusBalance: integer("bonus_balance").default(0), // Locked bonus
  isBonusUnlocked: boolean("is_bonus_unlocked").default(false),
  level: text("level").default("Bronze"), // Bronze, Silver, Gold, Platinum
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyQuests = pgTable("daily_quests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  type: text("type").notNull(), // video, quiz, link, referral
  description: text("description").notNull(),
  rewardAmount: integer("reward_amount").notNull(),
  completed: boolean("completed").default(false),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, quest_reward, bonus_unlock
  amount: integer("amount").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true,
  investmentBalance: true,
  walletBalance: true,
  bonusBalance: true,
  isBonusUnlocked: true,
  level: true 
}).extend({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true, 
  createdAt: true 
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// === EXPLICIT API TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Quest = typeof dailyQuests.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

export type LoginRequest = {
  email: string;
  password: string;
};

export type DepositRequest = {
  amount: number;
};

export type WithdrawRequest = {
  amount: number;
};

export type SpinResult = {
  won: boolean;
  message: string;
  bonusAmount?: number;
};

export const LEVELS = {
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
} as const;
