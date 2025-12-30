import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Trophy, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: [api.leaderboard.list.path],
    queryFn: async () => {
      const res = await fetch(api.leaderboard.list.path);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return api.leaderboard.list.responses[200].parse(await res.json());
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold font-display flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          Leaderboard
        </h2>
        <p className="text-muted-foreground">
          Top investors competing on the platform
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard?.map((leader, index) => (
            <Card key={leader.id} className="p-6 border-white/10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{leader.fullName || "Anon"}</h3>
                    <p className="text-xs text-muted-foreground">{leader.level}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-right">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1 justify-end">
                      <TrendingUp className="w-3 h-3" /> Investment
                    </p>
                    <p className="font-mono font-bold text-lg">
                      {(leader.investmentBalance ?? 0).toLocaleString()} USD
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1 justify-end">
                      <Zap className="w-3 h-3" /> Referral
                    </p>
                    <p className="font-mono font-bold text-lg text-primary">
                      {(leader.referralEarnings ?? 0).toLocaleString()} USD
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
