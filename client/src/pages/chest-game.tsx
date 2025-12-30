import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Package, Lock, Unlock, TrendingUp, AlertTriangle, Sparkles, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChestGame() {
  const { data: user } = useUser();
  const { toast } = useToast();
  const [stake, setStake] = useState(10);
  const [difficulty, setDifficulty] = useState("easy");
  const [lastOutcome, setLastOutcome] = useState<null | "gain" | "loss" | "trap">(null);
  const [openingChestId, setOpeningChestId] = useState<number | null>(null);

  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/game/chest/start", { stake, difficulty });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game/chest/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLastOutcome(null);
    },
  });

  const openMutation = useMutation({
    mutationFn: async (id: number) => {
      setOpeningChestId(id);
      const res = await apiRequest("POST", "/api/game/chest/open");
      return res.json();
    },
    onSuccess: (data) => {
      setLastOutcome(data.outcome);
      queryClient.setQueryData(["/api/game/chest/active"], data.game);
      setTimeout(() => setOpeningChestId(null), 1000);
    }
  });

  const cashoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/game/chest/cashout");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data.user);
      queryClient.setQueryData(["/api/game/chest/active"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/game/chest/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/history"] });
      setLastOutcome(null);
      startMutation.reset();
      openMutation.reset();
      toast({ title: "Encaissé", description: data.message });
    }
  });

  const activeGameQuery = useQuery({
    queryKey: ["/api/game/chest/active"],
    queryFn: async () => {
      // Logic to fetch active game if exists (handled by back returning null if none)
      return null; 
    },
    enabled: false
  });

  const game = startMutation.data || openMutation.data?.game;
  const isPlaying = game && game.status === "playing";

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold font-display text-gradient-primary">Jeu des Coffres</h1>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Solde Total</p>
            <p className="text-lg font-bold text-primary">
              ${(user?.walletBalance ?? 0) + (user?.investmentBalance ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {!isPlaying ? (
        <Card className="modern-card">
          <CardHeader>
            <CardTitle>Nouvelle Partie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mise (USD)</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, 500].map((val) => (
                  <Button
                    key={val}
                    variant={stake === val ? "default" : "outline"}
                    onClick={() => setStake(val)}
                  >
                    ${val}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulté</label>
              <div className="grid grid-cols-3 gap-2">
                {["easy", "medium", "hard"].map((diff) => (
                  <Button
                    key={diff}
                    variant={difficulty === diff ? "default" : "outline"}
                    onClick={() => setDifficulty(diff)}
                    className="capitalize"
                  >
                    {diff === "easy" ? "Facile" : diff === "medium" ? "Moyen" : "Risqué"}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full btn-glow" 
              size="lg"
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
            >
              Lancer la partie
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Mise</p>
                <p className="text-2xl font-bold">${game.stake}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-primary/50 overflow-hidden relative">
              <CardContent className="pt-6 text-center z-10">
                <p className="text-sm text-muted-foreground">Multiplicateur</p>
                <motion.p 
                  key={game.currentMultiplier}
                  initial={{ scale: 1.5, color: "#3b82f6" }}
                  animate={{ scale: 1, color: "hsl(var(--primary))" }}
                  className="text-4xl font-bold"
                >
                  x{game.currentMultiplier}
                </motion.p>
              </CardContent>
              <AnimatePresence>
                {lastOutcome === "gain" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-primary/10 pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Gain Actuel</p>
                <p className="text-2xl font-bold text-accent">${Math.floor(game.stake * parseFloat(game.currentMultiplier))}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-6 py-12">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                whileHover={!openingChestId ? { scale: 1.05 } : {}}
                whileTap={!openingChestId ? { scale: 0.95 } : {}}
                className="cursor-pointer"
                onClick={() => !openingChestId && openMutation.mutate(i)}
              >
                <Card className={`aspect-square flex flex-col items-center justify-center glass-card transition-all duration-500 ${openingChestId === i ? "border-primary shadow-[0_0_30px_rgba(59,130,246,0.5)]" : ""}`}>
                  <AnimatePresence mode="wait">
                    {openingChestId === i ? (
                      <motion.div
                        key="opening"
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: 180 }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <Package className="w-16 h-16 text-primary" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ scale: 1 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <Package className="w-16 h-16 text-primary/40" />
                        <span className="text-xs text-muted-foreground font-mono">Coffre {i}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {lastOutcome && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`p-4 rounded-lg flex items-center justify-center gap-3 font-bold border ${
                  lastOutcome === "gain" ? "bg-accent/10 border-accent text-accent" : 
                  lastOutcome === "loss" ? "bg-amber-500/10 border-amber-500 text-amber-500" :
                  "bg-destructive/10 border-destructive text-destructive"
                }`}
              >
                {lastOutcome === "gain" ? <Sparkles /> : <XCircle />}
                {lastOutcome === "gain" ? "Gagné ! Le multiplicateur s'envole." : 
                 lastOutcome === "loss" ? "Aïe ! Le multiplicateur baisse." : "BOUM ! C'était un piège."}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4">
            <Button 
              variant="default" 
              size="lg" 
              className="flex-1 btn-glow"
              onClick={() => cashoutMutation.mutate()}
              disabled={cashoutMutation.isPending}
            >
              Sécuriser ${Math.floor(game.stake * parseFloat(game.currentMultiplier))}
            </Button>
          </div>
        </div>
      )}

      <Card className="bg-muted/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="w-4 h-4" />
            <h3 className="font-bold">Niveaux de Difficulté</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-card/50 rounded-md border border-border/50">
              <p className="font-bold text-accent mb-1">FACILE</p>
              <p className="text-muted-foreground">2 coffres gagnants sur 3. Multiplicateur +0.2x par gain.</p>
            </div>
            <div className="p-3 bg-card/50 rounded-md border border-border/50">
              <p className="font-bold text-amber-500 mb-1">MOYEN</p>
              <p className="text-muted-foreground">1 coffre gagnant, 1 perte, 1 piège. Multiplicateur +0.4x.</p>
            </div>
            <div className="p-3 bg-card/50 rounded-md border border-border/50">
              <p className="font-bold text-destructive mb-1">RISQUÉ</p>
              <p className="text-muted-foreground">1 gagnant, gains explosifs (+0.8x), mais pièges fréquents.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}