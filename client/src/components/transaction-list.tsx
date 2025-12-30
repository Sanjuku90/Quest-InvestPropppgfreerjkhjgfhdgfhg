import { format } from "date-fns";
import { type Transaction } from "@shared/schema";
import { ArrowUpRight, ArrowDownLeft, Gift, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-white/5 rounded-xl border border-dashed border-white/10">
        <p>No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        let Icon = Zap;
        let colorClass = "text-blue-400 bg-blue-400/10";
        let amountPrefix = "";

        switch (tx.type) {
          case "deposit":
            Icon = ArrowDownLeft;
            colorClass = "text-green-400 bg-green-400/10";
            amountPrefix = "+";
            break;
          case "withdrawal":
            Icon = ArrowUpRight;
            colorClass = "text-red-400 bg-red-400/10";
            amountPrefix = "-";
            break;
          case "quest_reward":
            Icon = Zap;
            colorClass = "text-primary bg-primary/10";
            amountPrefix = "+";
            break;
          case "bonus_unlock":
            Icon = Gift;
            colorClass = "text-purple-400 bg-purple-400/10";
            amountPrefix = "+";
            break;
        }

        return (
          <div 
            key={tx.id}
            className="flex items-center justify-between p-4 rounded-xl bg-card border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-2.5 rounded-full", colorClass)}>
                <Icon size={18} />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">
                  {tx.description || tx.type.replace("_", " ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tx.createdAt ? format(new Date(tx.createdAt), "MMM d, yyyy • h:mm a") : "Just now"}
                </p>
              </div>
            </div>
            <div className={cn("font-mono font-bold", amountPrefix === "+" ? "text-green-400" : "text-foreground")}>
              {amountPrefix}{tx.amount.toLocaleString()} XOF
            </div>
          </div>
        );
      })}
    </div>
  );
}
