import { User, InsertUser, Quest, Transaction, users, dailyQuests, transactions } from "@shared/schema";
import type { InsertTransaction } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Quests
  getDailyQuests(userId: number, date: string): Promise<Quest[]>;
  createQuest(quest: Quest): Promise<Quest>;
  updateQuest(id: number, updates: Partial<Quest>): Promise<Quest>;
  getQuest(id: number): Promise<Quest | undefined>;

  // Transactions
  createTransaction(tx: InsertTransaction): Promise<Transaction>;
  getTransactions(userId: number): Promise<Transaction[]>;
  getPendingTransactions(): Promise<Transaction[]>;
  updateTransaction(id: number, status: string, adminNote?: string): Promise<Transaction>;

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
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(transactions.createdAt);
  }

  async getLeaderboard(): Promise<Array<any>> {
    return db.select({
      id: users.id,
      fullName: users.fullName,
      level: users.level,
      investmentBalance: users.investmentBalance,
      walletBalance: users.walletBalance,
    }).from(users).orderBy(users.investmentBalance);
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.status, "pending")).orderBy(transactions.createdAt);
  }

  async updateTransaction(id: number, status: string, adminNote?: string): Promise<Transaction> {
    const updates: any = { status };
    if (adminNote) updates.adminNote = adminNote;
    const [tx] = await db.update(transactions).set(updates).where(eq(transactions.id, id)).returning();
    return tx;
  }
}

export const storage = new DatabaseStorage();
