import { useState } from "react";
import { useUser } from "@/hooks/use-auth";
import { useTransactions, useDeposit, useWithdraw } from "@/hooks/use-invest";
import { StatCard } from "@/components/stat-card";
import { TransactionList } from "@/components/transaction-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const amountSchema = z.object({
  amount: z.coerce.number().min(20, "Montant minimum 20 USD"),
});

const depositSchema = z.object({
  amount: z.coerce.number().min(20, "Montant minimum 20 USD"),
  depositAddress: z.string().min(1, "Adresse de dépôt requise"),
});

export default function WalletPage() {
  const { data: user } = useUser();
  const { data: transactions, isLoading: isTxLoading } = useTransactions();
  const [openDeposit, setOpenDeposit] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-display mb-2">My Wallet</h2>
        <p className="text-muted-foreground">Manage your deposits and withdrawals securely.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <StatCard
          title="Total Balance"
          value={`${((user.walletBalance ?? 0) + (user.investmentBalance ?? 0)).toLocaleString()} USD`}
          icon={Wallet}
          gradient="from-primary/20 to-orange-500/10"
          className="border-primary/20 md:col-span-2"
        />
        
        <div className="p-6 rounded-2xl bg-card border border-white/5 space-y-4">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-muted-foreground mb-1">Withdrawable</p>
               <p className="text-2xl font-mono font-bold">{(user.walletBalance ?? 0).toLocaleString()} USD</p>
             </div>
             <div className="p-3 bg-green-500/10 rounded-full text-green-500">
               <ArrowUpRight size={24} />
             </div>
           </div>
           <WithdrawDialog 
             open={openWithdraw} 
             onOpenChange={setOpenWithdraw} 
             maxAmount={user.walletBalance ?? 0} 
           />
        </div>

        <div className="p-6 rounded-2xl bg-card border border-white/5 space-y-4">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-muted-foreground mb-1">Investment</p>
               <p className="text-2xl font-mono font-bold">{(user.investmentBalance ?? 0).toLocaleString()} USD</p>
             </div>
             <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
               <ArrowDownLeft size={24} />
             </div>
           </div>
           <DepositDialog 
             open={openDeposit} 
             onOpenChange={setOpenDeposit} 
           />
        </div>
      </div>

      <div className="pt-8">
        <h3 className="text-xl font-bold font-display mb-6">Transaction History</h3>
        <TransactionList transactions={transactions || []} isLoading={isTxLoading} />
      </div>
    </div>
  );
}

function DepositDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const depositMutation = useDeposit();
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ amount: number; depositAddress: string }>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      depositAddress: "TN9hjFHzszNdAk5n8Wt39X6KN72WaNmJM1"
    }
  });

  const onSubmit = async (data: { amount: number; depositAddress: string }) => {
    try {
      await depositMutation.mutateAsync({ amount: data.amount, depositAddress: data.depositAddress });
      toast({ title: "Succès", description: "Demande de dépôt soumise pour approbation" });
      onOpenChange(false);
      reset();
    } catch (error) {
      toast({ title: "Erreur", description: "Le dépôt a échoué", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 h-auto py-3">Ajouter des fonds</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dépôt de fonds</DialogTitle>
          <DialogDescription>
            Envoyez les fonds à l'adresse spécifiée et soumettez pour approbation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Adresse de dépôt</Label>
            <Input 
              type="text" 
              placeholder="Adresse portefeuille" 
              readOnly
              {...register("depositAddress")}
              className="bg-muted/50"
            />
            {errors.depositAddress && <p className="text-xs text-destructive">{errors.depositAddress.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Montant (USD)</Label>
            <Input type="number" placeholder="20" {...register("amount")} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
          <Button type="submit" size="lg" className="w-full h-auto py-3" disabled={depositMutation.isPending}>
            {depositMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
            Soumettre pour approbation
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function WithdrawDialog({ open, onOpenChange, maxAmount }: { open: boolean, onOpenChange: (open: boolean) => void, maxAmount: number }) {
  const withdrawMutation = useWithdraw();
  const { toast } = useToast();
  const schema = z.object({
    amount: z.coerce.number()
      .min(50, "Retrait minimum 50 USD")
      .max(maxAmount, "Solde insuffisant"),
    walletAddress: z.string().min(1, "Adresse portefeuille USDT TRC20 requise"),
  });
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ amount: number; walletAddress: string }>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: { amount: number; walletAddress: string }) => {
    try {
      await withdrawMutation.mutateAsync(data);
      toast({ title: "Success", description: "Demande de retrait soumise pour approbation" });
      onOpenChange(false);
      reset();
    } catch (error) {
      toast({ title: "Erreur", description: "Le retrait a échoué", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full h-auto py-3">Retirer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Retirer les fonds</DialogTitle>
          <DialogDescription>
            Transférez les fonds vers votre portefeuille USDT TRC20. Minimum : 50 USD.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Adresse portefeuille USDT TRC20</Label>
            <Input 
              type="text" 
              placeholder="Adresse TRC20..." 
              {...register("walletAddress")}
            />
            {errors.walletAddress && <p className="text-xs text-destructive">{errors.walletAddress.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Montant (USD)</Label>
            <Input type="number" placeholder="50" {...register("amount")} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            <p className="text-xs text-muted-foreground text-right">Disponible : {maxAmount.toLocaleString()} USD</p>
          </div>
          <Button type="submit" size="lg" className="w-full h-auto py-3" disabled={withdrawMutation.isPending}>
            {withdrawMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
            Soumettre pour approbation
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
