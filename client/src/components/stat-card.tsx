import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  gradient?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  className,
  gradient = "from-primary/15 to-primary/5"
}: StatCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-white/10 p-6 transition-all duration-300 hover:shadow-xl hover:border-white/15 hover:shadow-primary/20 group glass-card",
      "bg-gradient-to-br backdrop-blur-lg",
      gradient,
      className
    )}>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity transform group-hover:scale-110 duration-500">
        <Icon className="w-24 h-24 text-primary" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <div className="p-2.5 rounded-lg bg-background/60 border border-white/10 group-hover:bg-primary/20 group-hover:text-primary transition-all">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium font-display tracking-widest uppercase">{title}</span>
        </div>
        
        <div className="text-4xl font-bold font-display tracking-tight">
          {value}
        </div>

        {trend && (
          <div className={cn(
            "mt-3 text-xs font-medium flex items-center gap-1",
            trendUp ? "text-green-400" : "text-red-400"
          )}>
            <span>{trendUp ? "↑" : "↓"}</span>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
