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

  app.post("/api/game/chest/start", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { stake, difficulty } = req.body;
    const user = req.user! as any;

    const totalBalance = (user.walletBalance ?? 0) + (user.investmentBalance ?? 0);
    if (totalBalance < stake) {
      return res.status(400).json({ message: "Solde insuffisant (Portefeuille + Investissement)" });
    }

    // Deduct stake: prioritize walletBalance, then investmentBalance
    let remainingStake = stake;
    let newWalletBalance = user.walletBalance ?? 0;
    let newInvestmentBalance = user.investmentBalance ?? 0;

    if (newWalletBalance >= remainingStake) {
      newWalletBalance -= remainingStake;
      remainingStake = 0;
    } else {
      remainingStake -= newWalletBalance;
      newWalletBalance = 0;
      newInvestmentBalance -= remainingStake;
    }

    await storage.updateUser(user.id, {
      walletBalance: newWalletBalance as any,
      investmentBalance: newInvestmentBalance as any
    });

    const game = await storage.createChestGame({
      userId: user.id,
      status: "playing",
      difficulty,
      stake,
      currentMultiplier: "1.0",
      securedGains: 0,
      chestsOpened: 0
    });

    res.json(game);
  });

  app.post("/api/game/chest/open", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user! as any;
    const game = await storage.getActiveChestGame(user.id);

    if (!game) return res.status(404).json({ message: "Aucun jeu en cours" });

    // Logic by difficulty
    // Easy: 2/3 win (66.6%)
    // Medium: 1/2 win (50%)
    // Risky: 1/3 win (33.3%)
    const rand = Math.random();
    let outcome: "gain" | "loss" | "trap";
    
    if (game.difficulty === "easy") {
      if (rand < 0.66) outcome = "gain";
      else outcome = "trap";
    } else if (game.difficulty === "medium") {
      if (rand < 0.5) outcome = "gain";
      else if (rand < 0.8) outcome = "loss";
      else outcome = "trap";
    } else { // Risky
      if (rand < 0.33) outcome = "gain";
      else if (rand < 0.6) outcome = "loss";
      else outcome = "trap";
    }

    if (outcome === "trap") {
      await storage.updateChestGame(game.id, { status: "lost" });
      return res.json({ outcome: "trap", message: "Piège ! Vous avez tout perdu.", game: { ...game, status: "lost" } });
    }

    if (outcome === "loss") {
       const newMultiplier = Math.max(0.5, parseFloat(game.currentMultiplier) - 0.2).toFixed(1);
       const updatedGame = await storage.updateChestGame(game.id, { 
         currentMultiplier: newMultiplier,
         chestsOpened: game.chestsOpened + 1
       });
       return res.json({ outcome: "loss", message: "Aïe ! Multiplicateur réduit.", game: updatedGame });
    }

    // Gain
    const multiplierStep = game.difficulty === "easy" ? 0.2 : (game.difficulty === "medium" ? 0.4 : 0.8);
    const newMultiplier = (parseFloat(game.currentMultiplier) + multiplierStep).toFixed(1);
    const updatedGame = await storage.updateChestGame(game.id, { 
      currentMultiplier: newMultiplier,
      chestsOpened: game.chestsOpened + 1
    });
    res.json({ outcome: "gain", message: "Gagné ! Le multiplicateur augmente.", game: updatedGame });
  });

  app.post("/api/game/chest/cashout", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user! as any;
    const game = await storage.getActiveChestGame(user.id);

    if (!game) return res.status(404).json({ message: "Aucun jeu en cours" });

    const winAmount = Math.floor(game.stake * parseFloat(game.currentMultiplier));
    
    // Refresh user from DB to get latest balance
    const currentUser = await storage.getUser(user.id);
    if (!currentUser) return res.sendStatus(404);

    const updatedUser = await storage.updateUser(user.id, {
      walletBalance: ((currentUser.walletBalance ?? 0) + winAmount) as any
    });

    const updatedGame = await storage.updateChestGame(game.id, { 
      status: "cashed_out", 
      securedGains: winAmount 
    });

    await storage.createTransaction({
      userId: user.id,
      type: "quest_reward",
      amount: winAmount,
      description: `Gains Jeu des Coffres (x${game.currentMultiplier})`,
      status: "approved"
    });

    res.json({ message: `Encaissé ! Vous avez gagné ${winAmount} USD`, game: updatedGame, user: updatedUser });
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
  // Dev endpoint to make current user admin
  app.post("/api/admin/grant-access", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user! as any;
    
    // Make user admin
    const adminUser = await storage.updateUser(user.id, { isAdmin: true } as any);
    res.json({ message: "Admin access granted", user: adminUser });
  });

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
