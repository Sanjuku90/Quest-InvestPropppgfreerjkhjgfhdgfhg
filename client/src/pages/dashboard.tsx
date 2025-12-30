import { useUser } from "@/hooks/use-auth";
import { useTransactions } from "@/hooks/use-invest";
import { Link } from "wouter";
import { 
  Wallet, 
  TrendingUp, 
  Lock, 
  ArrowRight, 
  Crown,
  LayoutDashboard,
  CheckCircle2,
  Target
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { TransactionList } from "@/components/transaction-list";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";
import { LEVELS } from "@shared/schema";

export default function DashboardPage() {
  const { data: user } = useUser();
  const { data: transactions, isLoading: isTxLoading } = useTransactions();

  if (!user) return null;

  const isBonusReady = user.isBonusUnlocked || (user.walletBalance ?? 0) > 0;

  return (
    <div className="space-y-8">
      <Breadcrumb items={[]} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400">
            Welcome back, {user.fullName?.split(' ')[0]}
          </h2>
          <p className="text-muted-foreground text-base">Here is your financial overview.</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card-sm bg-gradient-to-r from-yellow-500/15 to-orange-500/10 border-yellow-500/40">
          <Crown className="w-5 h-5 text-yellow-400 animate-pulse-glow" />
          <span className="font-bold text-yellow-400">{user.level || LEVELS.BRONZE} Member</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Investment Balance"
          value={`${(user.investmentBalance ?? 0).toLocaleString()} XOF`}
          icon={TrendingUp}
          gradient="from-blue-600/25 to-cyan-500/15"
          className="border-blue-500/30 shadow-lg shadow-blue-500/10"
        />
        <StatCard
          title="Locked Bonus"
          value={`${(user.bonusBalance ?? 0).toLocaleString()} XOF`}
          icon={Lock}
          gradient="from-purple-600/25 to-pink-500/15"
          className="border-purple-500/30 shadow-lg shadow-purple-500/10"
        />
        <StatCard
          title="Withdrawable Balance"
          value={`${(user.walletBalance ?? 0).toLocaleString()} XOF`}
          icon={Wallet}
          gradient="from-emerald-600/25 to-green-500/15"
          className="border-emerald-500/30 shadow-lg shadow-emerald-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-display">Recent Activity</h3>
            <Link href="/wallet">
              <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary/80">
                View All <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
          <TransactionList 
            transactions={transactions?.slice(0, 5) || []} 
            isLoading={isTxLoading} 
          />
        </div>

        {/* Achievement Widget */}
        <div className="space-y-6">
          <div className="glass-effect p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold font-display flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              Quest Progress
            </h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-bold text-accent">8/10 Completed</span>
                </div>
                <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent to-emerald-400 w-4/5 rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-bold text-primary">24/30 Completed</span>
                </div>
                <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-blue-400 w-4/5 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold font-display">Quick Actions</h3>
          <div className="grid gap-4">
            <Link href="/quests">
              <div className="group p-4 rounded-xl bg-card border border-white/5 hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 rounded-lg bg-primary/20 text-primary">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">Daily Quests</h4>
                    <p className="text-xs text-muted-foreground">Complete tasks to earn</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/roulette">
              <div className="group p-4 rounded-xl bg-card border border-white/5 hover:border-secondary/50 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-secondary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 rounded-lg bg-secondary/20 text-secondary">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">Unlock Bonus</h4>
                    <p className="text-xs text-muted-foreground">Spin the wheel</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/wallet">
              <div className="group p-4 rounded-xl bg-card border border-white/5 hover:border-green-500/50 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-green-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 rounded-lg bg-green-500/20 text-green-500">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">Deposit / Withdraw</h4>
                    <p className="text-xs text-muted-foreground">Manage your funds</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
