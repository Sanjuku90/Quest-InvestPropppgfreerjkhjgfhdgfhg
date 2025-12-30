import { User, InsertUser, Quest, Transaction, users, dailyQuests, transactions, chestGames } from "@shared/schema";
import type { InsertTransaction } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

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
  sessionStore: session.Store;
}

export class MemoryStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private quests: Map<number, Quest> = new Map();
  private transactions: Map<number, Transaction> = new Map();
  private chestGames: Map<number, any> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  
  private userIdCounter = 1;
  private questIdCounter = 1;
  private transactionIdCounter = 1;
  private chestGameIdCounter = 1;

  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new SessionStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.usersByEmail.get(email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = {
      id,
      email: insertUser.email,
      password: insertUser.password,
      fullName: insertUser.fullName || null,
      investmentBalance: 0,
      walletBalance: 0,
      bonusBalance: 0,
      isBonusUnlocked: false,
      level: "Bronze",
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    this.usersByEmail.set(user.email, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    
    if (updates.email && user.email !== updates.email) {
      this.usersByEmail.delete(user.email);
      this.usersByEmail.set(updates.email, updated);
    }
    
    return updated;
  }

  async getDailyQuests(userId: number, date: string): Promise<Quest[]> {
    return Array.from(this.quests.values()).filter(q => q.userId === userId && q.date === date);
  }

  async createQuest(quest: any): Promise<Quest> {
    const id = this.questIdCounter++;
    const newQuest: Quest = {
      id,
      ...quest,
    };
    this.quests.set(id, newQuest);
    return newQuest;
  }

  async updateQuest(id: number, updates: Partial<Quest>): Promise<Quest> {
    const quest = this.quests.get(id);
    if (!quest) throw new Error("Quest not found");
    
    const updated = { ...quest, ...updates };
    this.quests.set(id, updated);
    return updated;
  }

  async getQuest(id: number): Promise<Quest | undefined> {
    return this.quests.get(id);
  }

  async createTransaction(tx: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = {
      id,
      userId: tx.userId,
      type: tx.type,
      amount: tx.amount,
      description: tx.description || null,
      status: tx.status || "pending",
      adminNote: tx.adminNote || null,
      depositAddress: tx.depositAddress || null,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt as any).getTime();
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt as any).getTime();
        return dateB - dateA;
      });
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.status === "pending")
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt as any).getTime();
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt as any).getTime();
        return dateB - dateA;
      });
  }

  async updateTransaction(id: number, status: string, adminNote?: string): Promise<Transaction> {
    const tx = this.transactions.get(id);
    if (!tx) throw new Error("Transaction not found");
    
    const updated = { 
      ...tx, 
      status,
      adminNote: adminNote || tx.adminNote,
    };
    this.transactions.set(id, updated);
    return updated;
  }

  async createChestGame(game: any): Promise<any> {
    const id = this.chestGameIdCounter++;
    const newGame = {
      id,
      ...game,
      createdAt: new Date(),
    };
    this.chestGames.set(id, newGame);
    return newGame;
  }

  async getChestGame(id: number): Promise<any> {
    return this.chestGames.get(id);
  }

  async updateChestGame(id: number, updates: any): Promise<any> {
    const game = this.chestGames.get(id);
    if (!game) throw new Error("Chest game not found");
    
    const updated = { ...game, ...updates };
    this.chestGames.set(id, updated);
    return updated;
  }

  async getActiveChestGame(userId: number): Promise<any> {
    return Array.from(this.chestGames.values()).find(
      g => g.userId === userId && g.status === "playing"
    );
  }

  async getLeaderboard(): Promise<Array<any>> {
    return Array.from(this.users.values())
      .map(user => ({
        id: user.id,
        fullName: user.fullName,
        level: user.level,
        investmentBalance: user.investmentBalance || 0,
        walletBalance: user.walletBalance || 0,
      }))
      .sort((a, b) => (b.investmentBalance || 0) - (a.investmentBalance || 0));
  }
}

export const storage = new MemoryStorage();
