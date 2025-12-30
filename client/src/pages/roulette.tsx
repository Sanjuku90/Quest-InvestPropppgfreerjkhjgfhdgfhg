import { useState, useRef } from "react";
import { useUser } from "@/hooks/use-auth";
import { useSpinWheel } from "@/hooks/use-invest";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function RoulettePage() {
  const { data: user } = useUser();
  const spinMutation = useSpinWheel();
  const { toast } = useToast();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winData, setWinData] = useState<{ message: string; won: boolean } | null>(null);

  if (!user) return null;

  const handleSpin = async () => {
    if (isSpinning) return;
    
    // Check if user has bonus to unlock
    if ((user.bonusBalance ?? 0) <= 0) {
      toast({
        title: "No Bonus Available",
        description: "You need a locked bonus balance to play.",
        variant: "destructive"
      });
      return;
    }

    setIsSpinning(true);
    setWinData(null);
    
    try {
      // Start visual spinning immediately
      const spins = 5; // minimum full rotations
      const baseAngle = 360 * spins;
      // We don't know the result yet, just spin visually
      const visualTarget = rotation + baseAngle + Math.random() * 360;
      setRotation(visualTarget);

      // Call API
      // Add artificial delay to let it spin a bit
      const [result] = await Promise.all([
        spinMutation.mutateAsync(),
        new Promise(resolve => setTimeout(resolve, 3000))
      ]);

      setWinData({ message: result.message, won: result.won });
      
      if (result.won) {
        toast({
          title: "Winner!",
          description: result.message,
          className: "bg-green-500 border-green-600 text-white"
        });
      } else {
        toast({
          title: "Better luck next time",
          description: result.message,
        });
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to spin. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh] py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-display text-gradient-neon mb-4">
          Bonus Roulette
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Spin the wheel to unlock your bonus balance. 
          Unlocked funds are moved to your withdrawable wallet instantly.
        </p>
        
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30">
          <Lock className="w-4 h-4 text-secondary" />
          <span className="text-secondary font-mono font-bold">
            Locked Balance: {(user.bonusBalance ?? 0).toLocaleString()} XOF
          </span>
        </div>
      </div>

      <div className="relative mb-12">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-8 h-8 rotate-45 bg-white border-4 border-gray-800 shadow-xl rounded-sm" />

        {/* Wheel */}
        <div 
          className="w-80 h-80 md:w-96 md:h-96 rounded-full border-8 border-gray-800 relative overflow-hidden shadow-2xl shadow-purple-500/20"
          style={{ 
            transition: 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            transform: `rotate(${rotation}deg)` 
          }}
        >
          {/* Segments */}
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#9333ea_0deg_60deg,#db2777_60deg_120deg,#9333ea_120deg_180deg,#db2777_180deg_240deg,#9333ea_240deg_300deg,#db2777_300deg_360deg)]" />
          
          {/* Center Cap */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-900 rounded-full border-4 border-gray-700 flex items-center justify-center z-10">
            <Gift className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <div className="space-y-6 text-center">
        <Button 
          size="lg" 
          className="text-lg px-12 py-6 rounded-full font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105"
          onClick={handleSpin}
          disabled={isSpinning || (user.bonusBalance ?? 0) <= 0}
        >
          {isSpinning ? <Loader2 className="animate-spin mr-2" /> : null}
          {isSpinning ? "Spinning..." : "SPIN TO UNLOCK"}
        </Button>

        {(user.bonusBalance ?? 0) <= 0 && (
          <p className="text-sm text-destructive">
            You need a bonus balance to play.
          </p>
        )}
      </div>

      <AnimatePresence>
        {winData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "mt-8 p-6 rounded-2xl border text-center max-w-sm",
              winData.won ? "bg-green-500/10 border-green-500/50" : "bg-red-500/10 border-red-500/50"
            )}
          >
            <h3 className={cn("text-xl font-bold mb-2", winData.won ? "text-green-400" : "text-red-400")}>
              {winData.won ? "Congratulations!" : "Missed it!"}
            </h3>
            <p className="text-muted-foreground">{winData.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
