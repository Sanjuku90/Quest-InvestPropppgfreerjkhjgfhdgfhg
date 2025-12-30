import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { format } from "date-fns";
import { LEVELS } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app, storage);

  // === Quests Logic ===
  app.get(api.quests.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user! as any;
    const today = format(new Date(), "yyyy-MM-dd");

    let quests = await storage.getDailyQuests(user.id, today);

    if (quests.length === 0 && (user.investmentBalance ?? 0) > 0) {
      // Generate daily quests based on investment
      const baseQuests = 4;
      const extraQuests = Math.floor((user.investmentBalance ?? 0) / 50000); // Example: 1 extra per 50k
      const totalQuests = baseQuests + extraQuests;
      
      // 35% of investment balance per quest
      const rewardAmount = Math.floor((user.investmentBalance ?? 0) * 0.35);

      const questTypes = [
        { type: "video", desc: "Regarder une vidéo sponsorisée" },
        { type: "quiz", desc: "Répondre au quiz du jour" },
        { type: "link", desc: "Visiter le lien partenaire" },
        { type: "referral", desc: "Partager votre lien de parrainage" },
        { type: "checkin", desc: "Bonus de connexion quotidienne" },
        { type: "review", desc: "Laisser un avis positif" },
      ];

      for (let i = 0; i < totalQuests; i++) {
        const template = questTypes[i % questTypes.length];
        await storage.createQuest({
          userId: user.id,
          date: today,
          type: template.type,
          description: template.desc,
          rewardAmount: rewardAmount,
          completed: false,
        });
      }
      quests = await storage.getDailyQuests(user.id, today);
    }

    res.json(quests);
  });

  app.post(api.quests.complete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const questId = Number(req.params.id);
    const user = req.user! as any;
    
    const quest = await storage.getQuest(questId);
    if (!quest || quest.userId !== user.id) return res.sendStatus(404);
    if (quest.completed) return res.status(400).send("Déjà complété");

    // Update quest
    const updatedQuest = await storage.updateQuest(questId, { completed: true });

    // Update user balance
    const updatedUser = await storage.updateUser(user.id, {
      walletBalance: ((user.walletBalance ?? 0) + quest.rewardAmount) as any,
    });

    // Log transaction
    await storage.createTransaction({
      userId: user.id,
      type: "quest_reward",
      amount: quest.rewardAmount,
      description: `Récompense quête: ${quest.description}`,
    });

    res.json({ quest: updatedQuest, user: updatedUser });
  });

  // === Investment & Wallet ===
  app.post(api.invest.deposit.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { amount, depositAddress } = req.body;
    const user = req.user! as any;

    // Create pending deposit transaction that requires admin approval
    await storage.createTransaction({
      userId: user.id,
      type: "deposit",
      amount: amount,
      description: `Dépôt de ${amount} USD`,
      depositAddress: depositAddress,
      status: "pending",
    });

    res.json({ message: "Deposit submitted for admin approval" });
  });

  app.post(api.wallet.withdraw.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { amount } = req.body;
    const user = req.user! as any;

    if ((user.walletBalance ?? 0) < amount) {
      return res.status(400).json({ message: "Solde insuffisant" });
    }

    const updatedUser = await storage.updateUser(user.id, {
      walletBalance: ((user.walletBalance ?? 0) - amount) as any,
    });

    await storage.createTransaction({
      userId: user.id,
      type: "withdrawal",
      amount: amount,
      description: "Retrait vers mobile money",
    });

    res.json(updatedUser);
  });

  app.get(api.wallet.history.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user! as any;
    const txs = await storage.getTransactions(user.id);
    res.json(txs);
  });

  // === Roulette Game ===
  app.post(api.game.spin.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user! as any;

    if ((user.bonusBalance ?? 0) <= 0) {
      return res.status(400).json({ message: "Aucun bonus à débloquer" });
    }

    // 40% chance to win, or guaranteed if they played enough? 
    // Let's make it random for now.
    const won = Math.random() > 0.6; 

    if (won) {
      const bonus = user.bonusBalance ?? 0;
      const updatedUser = await storage.updateUser(user.id, {
        bonusBalance: 0 as any,
        walletBalance: ((user.walletBalance ?? 0) + bonus) as any,
        isBonusUnlocked: true,
      });

      await storage.createTransaction({
        userId: user.id,
        type: "bonus_unlock",
        amount: bonus,
        description: "Bonus débloqué à la roulette",
      });

      res.json({ won: true, message: "Félicitations ! Bonus débloqué.", user: updatedUser });
    } else {
      res.json({ won: false, message: "Perdu ! Réessayez plus tard.", user: user });
    }
  });

  // === Leaderboard ===
  app.get(api.leaderboard.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const leaders = await storage.getLeaderboard();
    const withTotals = leaders.map(leader => ({
      ...leader,
      referralEarnings: 0,
      totalEarnings: (leader.investmentBalance || 0),
    }));
    
    res.json(withTotals.sort((a, b) => b.investmentBalance - a.investmentBalance));
  });

  // === Admin Routes ===
  app.get("/api/admin/transactions/pending", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user! as any;
    
    // Check if user is admin
    const adminUser = await storage.getUser(user.id);
    if (!adminUser?.isAdmin) return res.sendStatus(403);

    const transactions = await storage.getPendingTransactions();
    res.json(transactions);
  });

  app.post("/api/admin/transactions/:id/approve", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user! as any;
    const txId = Number(req.params.id);
    const { adminNote } = req.body;

    // Check if user is admin
    const adminUser = await storage.getUser(user.id);
    if (!adminUser?.isAdmin) return res.sendStatus(403);

    const tx = await storage.updateTransaction(txId, "approved", adminNote);
    
    // If deposit/withdrawal approved, update user balance
    if (tx.type === "deposit") {
      const txUser = await storage.getUser(tx.userId);
      if (txUser) {
        await storage.updateUser(tx.userId, {
          investmentBalance: ((txUser.investmentBalance ?? 0) + tx.amount) as any,
        });
      }
    } else if (tx.type === "withdrawal") {
      const txUser = await storage.getUser(tx.userId);
      if (txUser && (txUser.walletBalance ?? 0) >= tx.amount) {
        await storage.updateUser(tx.userId, {
          walletBalance: ((txUser.walletBalance ?? 0) - tx.amount) as any,
        });
      } else {
        return res.status(400).json({ message: "Solde insuffisant" });
      }
    }

    res.json(tx);
  });

  app.post("/api/admin/transactions/:id/reject", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user! as any;
    const txId = Number(req.params.id);
    const { adminNote } = req.body;

    // Check if user is admin
    const adminUser = await storage.getUser(user.id);
    if (!adminUser?.isAdmin) return res.sendStatus(403);

    const tx = await storage.updateTransaction(txId, "rejected", adminNote);
    res.json(tx);
  });

  return httpServer;
}
