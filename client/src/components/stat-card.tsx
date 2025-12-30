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
  gradient = "from-primary/10 to-primary/5"
}: StatCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-white/5 p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/20 group",
      "bg-gradient-to-br backdrop-blur-sm",
      gradient,
      className
    )}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
        <Icon className="w-24 h-24 text-primary" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <div className="p-2 rounded-lg bg-background/50 border border-white/5">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium font-display tracking-wide uppercase">{title}</span>
        </div>
        
        <div className="text-3xl font-bold font-mono tracking-tighter">
          {value}
        </div>

        {trend && (
          <div className={cn(
            "mt-2 text-xs font-medium flex items-center gap-1",
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
