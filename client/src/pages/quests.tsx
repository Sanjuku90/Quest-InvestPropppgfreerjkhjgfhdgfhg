import { useQuests, useCompleteQuest } from "@/hooks/use-invest";
import { useUser } from "@/hooks/use-auth";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  HelpCircle, 
  Link as LinkIcon, 
  Users,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function QuestsPage() {
  const { data: user } = useUser();
  const { data: quests, isLoading } = useQuests();
  const completeMutation = useCompleteQuest();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<number | null>(null);

  if (isLoading || !quests) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const completedCount = quests.filter(q => q.completed).length;
  const progress = (completedCount / quests.length) * 100;

  const handleComplete = async (id: number) => {
    setProcessingId(id);
    // Simulate interaction delay (e.g. watching video)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      await completeMutation.mutateAsync(id);
      toast({
        title: "Quest Completed!",
        description: "Reward has been added to your investment balance.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not complete quest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold font-display text-gradient-neon">Daily Quests</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Complete these tasks every day to increase your investment balance. 
          Each task adds value to your portfolio.
        </p>
        
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Daily Progress</span>
            <span>{completedCount} / {quests.length}</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      <div className="grid gap-4">
        {quests.map((quest) => {
          let Icon = PlayCircle;
          if (quest.type === "quiz") Icon = HelpCircle;
          if (quest.type === "link") Icon = LinkIcon;
          if (quest.type === "referral") Icon = Users;

          const isProcessing = processingId === quest.id;

          return (
            <div 
              key={quest.id}
              className={cn(
                "group relative overflow-hidden p-6 rounded-2xl border transition-all duration-300",
                quest.completed 
                  ? "bg-primary/5 border-primary/20 opacity-70" 
                  : "bg-card border-white/5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              )}
            >
              <div className="flex items-center gap-6 relative z-10">
                <div className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  quest.completed ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <Icon size={24} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={cn("font-bold text-lg", quest.completed && "line-through text-muted-foreground")}>
                      {quest.description}
                    </h3>
                    <div className="px-2 py-0.5 text-xs font-bold rounded bg-white/5 text-muted-foreground uppercase">
                      {quest.type}
                    </div>
                  </div>
                  <p className="text-sm font-mono text-primary">
                    Reward: {quest.rewardAmount.toLocaleString()} USD
                  </p>
                </div>

                <div className="flex-shrink-0">
                  {quest.completed ? (
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <CheckCircle2 size={24} />
                      <span className="hidden sm:inline">Completed</span>
                    </div>
                  ) : (
                    <Button 
                      size="lg" 
                      className="min-w-[140px]" 
                      onClick={() => handleComplete(quest.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Start Quest"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
