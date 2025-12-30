import { User, InsertUser, Quest, Transaction, users, dailyQuests, transactions, chestGames } from "@shared/schema";
import type { InsertTransaction } from "@shared/schema";

export type ChestGame = typeof chestGames.$inferSelect;
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Quests
  getDailyQuests(userId: number, date: string): Promise<Quest[]>;
  createQuest(quest: any): Promise<Quest>;
  updateQuest(id: number, updates: Partial<Quest>): Promise<Quest>;
  getQuest(id: number): Promise<Quest | undefined>;

  // Transactions
  createTransaction(tx: InsertTransaction): Promise<Transaction>;
  getTransactions(userId: number): Promise<Transaction[]>;
  getPendingTransactions(): Promise<Transaction[]>;
  updateTransaction(id: number, status: string, adminNote?: string): Promise<Transaction>;

  // Chest Game
  createChestGame(game: any): Promise<any>;
  getChestGame(id: number): Promise<any>;
  updateChestGame(id: number, updates: any): Promise<any>;
  getActiveChestGame(userId: number): Promise<any>;

  // Leaderboard
  getLeaderboard(): Promise<Array<any>>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getDailyQuests(userId: number, date: string): Promise<Quest[]> {
    return db.select().from(dailyQuests).where(and(eq(dailyQuests.userId, userId), eq(dailyQuests.date, date)));
  }

  async createQuest(quest: any): Promise<Quest> {
    const [newQuest] = await db.insert(dailyQuests).values(quest).returning();
    return newQuest;
  }

  async updateQuest(id: number, updates: Partial<Quest>): Promise<Quest> {
    const [quest] = await db.update(dailyQuests).set(updates).where(eq(dailyQuests.id, id)).returning();
    return quest;
  }

  async getQuest(id: number): Promise<Quest | undefined> {
    const [quest] = await db.select().from(dailyQuests).where(eq(dailyQuests.id, id));
    return quest;
  }

  async createTransaction(tx: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(tx).returning();
    return transaction;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async getLeaderboard(): Promise<Array<any>> {
    return db.select({
      id: users.id,
      fullName: users.fullName,
      level: users.level,
      investmentBalance: users.investmentBalance,
      walletBalance: users.walletBalance,
    }).from(users).orderBy(desc(users.investmentBalance));
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.status, "pending")).orderBy(desc(transactions.createdAt));
  }

  async updateTransaction(id: number, status: string, adminNote?: string): Promise<Transaction> {
    const updates: any = { status };
    if (adminNote) updates.adminNote = adminNote;
    const [tx] = await db.update(transactions).set(updates).where(eq(transactions.id, id)).returning();
    return tx;
  }

  async createChestGame(game: any): Promise<any> {
    const [newGame] = await db.insert(chestGames).values(game).returning();
    return newGame;
  }

  async getChestGame(id: number): Promise<any> {
    const [game] = await db.select().from(chestGames).where(eq(chestGames.id, id));
    return game;
  }

  async updateChestGame(id: number, updates: any): Promise<any> {
    const [game] = await db.update(chestGames).set(updates).where(eq(chestGames.id, id)).returning();
    return game;
  }

  async getActiveChestGame(userId: number): Promise<any> {
    const [game] = await db.select()
      .from(chestGames)
      .where(and(eq(chestGames.userId, userId), eq(chestGames.status, "playing")))
      .limit(1);
    return game;
  }
}

export const storage = new DatabaseStorage();
