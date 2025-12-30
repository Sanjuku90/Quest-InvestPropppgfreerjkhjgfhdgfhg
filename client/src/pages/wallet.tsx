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
  amount: z.coerce.number().min(100, "Minimum amount is 100 USD"),
});

const depositSchema = z.object({
  amount: z.coerce.number().min(100, "Minimum amount is 100 USD"),
  depositAddress: z.string().min(1, "Deposit address is required"),
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
      toast({ title: "Success", description: "Deposit request submitted for approval" });
      onOpenChange(false);
      reset();
    } catch (error) {
      toast({ title: "Error", description: "Deposit failed", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700">Add Funds</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>
            Send funds to the specified address and submit for admin approval.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Deposit Address</Label>
            <Input 
              type="text" 
              placeholder="Wallet address" 
              readOnly
              {...register("depositAddress")}
              className="bg-muted/50"
            />
            {errors.depositAddress && <p className="text-xs text-destructive">{errors.depositAddress.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Amount (USD)</Label>
            <Input type="number" placeholder="5000" {...register("amount")} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={depositMutation.isPending}>
            {depositMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
            Submit for Approval
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
      .min(1000, "Minimum withdrawal is 1000 USD")
      .max(maxAmount, "Insufficient funds"),
    walletAddress: z.string().min(1, "USDT TRC20 wallet address is required"),
  });
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ amount: number; walletAddress: string }>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: { amount: number; walletAddress: string }) => {
    try {
      await withdrawMutation.mutateAsync(data);
      toast({ title: "Success", description: "Withdrawal request submitted for admin approval" });
      onOpenChange(false);
      reset();
    } catch (error) {
      toast({ title: "Error", description: "Withdrawal failed", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Withdraw</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Transfer funds to your USDT TRC20 wallet. Minimum: 1000 USD.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>USDT TRC20 Wallet Address</Label>
            <Input 
              type="text" 
              placeholder="TN9hjFHzszNdAk5n8Wt39X6KN72WaNmJM1" 
              {...register("walletAddress")}
            />
            {errors.walletAddress && <p className="text-xs text-destructive">{errors.walletAddress.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Amount (USD)</Label>
            <Input type="number" placeholder="1000" {...register("amount")} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            <p className="text-xs text-muted-foreground text-right">Available: {maxAmount.toLocaleString()} USD</p>
          </div>
          <Button type="submit" className="w-full" disabled={withdrawMutation.isPending}>
            {withdrawMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
            Submit for Approval
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
