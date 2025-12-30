import { useState } from "react";
import { useUser } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Package, Lock, Unlock, TrendingUp, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChestGame() {
  const { data: user } = useUser();
  const { toast } = useToast();
  const [stake, setStake] = useState(10);
  const [difficulty, setDifficulty] = useState("easy");

  const { data: activeGame, isLoading } = useQuery({
    queryKey: ["/api/game/chest/active"],
    queryFn: async () => {
      // We don't have a direct GET active endpoint, but we can check via start attempt or just use the mutation state
      return null; 
    }
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/game/chest/start", { stake, difficulty });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game/chest/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Jeu démarré", description: `Mise de ${stake} USD acceptée.` });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const openMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/game/chest/open");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/game/chest/active"], data.game);
      if (data.outcome === "trap") {
        toast({ title: "PERDU", description: data.message, variant: "destructive" });
      } else {
        toast({ title: data.outcome === "gain" ? "BRAVO" : "ATTENTION", description: data.message });
      }
    }
  });

  const cashoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/game/chest/cashout");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/game/chest/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Encaissé", description: data.message });
    }
  });

  const game = startMutation.data || openMutation.data?.game;
  const isPlaying = game && game.status === "playing";

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-display text-gradient-primary">Jeu des Coffres</h1>
        <p className="text-muted-foreground">Misez, ouvrez des coffres et multipliez vos gains. Attention aux pièges !</p>
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
                <p className="text-sm text-muted-foreground">Mise Initiale</p>
                <p className="text-2xl font-bold">${game.stake}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-primary/50">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Multiplicateur Actuel</p>
                <p className="text-4xl font-bold text-primary">x{game.currentMultiplier}</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Gain Potentiel</p>
                <p className="text-2xl font-bold text-accent">${Math.floor(game.stake * parseFloat(game.currentMultiplier))}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-6 py-12">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
                onClick={() => !openMutation.isPending && openMutation.mutate()}
              >
                <Card className="aspect-square flex items-center justify-center glass-card hover:border-primary transition-colors">
                  <Package className="w-16 h-16 text-primary animate-float" />
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1"
              onClick={() => cashoutMutation.mutate()}
              disabled={cashoutMutation.isPending}
            >
              Encaisser ${Math.floor(game.stake * parseFloat(game.currentMultiplier))}
            </Button>
          </div>
        </div>
      )}

      <Card className="bg-muted/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-bold">Règles du Jeu</h3>
          </div>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• Chaque coffre peut doubler vos gains ou vous faire tout perdre.</li>
            <li>• Vous pouvez encaisser vos gains à tout moment avant d'ouvrir un nouveau coffre.</li>
            <li>• Le niveau Risqué offre des multiplicateurs plus élevés mais plus de pièges.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}