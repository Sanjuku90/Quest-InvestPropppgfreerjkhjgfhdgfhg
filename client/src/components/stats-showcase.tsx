import { Users, Zap, TrendingUp } from "lucide-react";

export function StatsShowcase() {
  const stats = [
    {
      icon: Users,
      value: "50K+",
      label: "Active Investors",
      color: "from-blue-600/25 to-cyan-500/15"
    },
    {
      icon: TrendingUp,
      value: "$5.2M",
      label: "Total Returns Generated",
      color: "from-emerald-600/25 to-green-500/15"
    },
    {
      icon: Zap,
      value: "1M+",
      label: "Quests Completed",
      color: "from-amber-600/25 to-orange-500/15"
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`glass-effect p-8 space-y-4 rounded-2xl animate-fade-in-up group cursor-pointer`}
            style={{
              animationDelay: `${idx * 0.2}s`,
              opacity: 0,
            }}
          >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold font-display">{stat.value}</p>
              <p className="text-muted-foreground mt-2">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
