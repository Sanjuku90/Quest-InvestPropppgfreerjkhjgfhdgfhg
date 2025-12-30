import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  description?: string;
  status: string;
  adminNote?: string;
  createdAt: string;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions/pending"],
  });

  const approveMutation = useMutation({
    mutationFn: async (txId: number) => {
      return apiRequest("POST", `/api/admin/transactions/${txId}/approve`, {
        adminNote: adminNotes[txId] || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
      toast({ title: "Transaction approuvée" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (txId: number) => {
      return apiRequest("POST", `/api/admin/transactions/${txId}/reject`, {
        adminNote: adminNotes[txId] || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
      toast({ title: "Transaction rejetée" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-accent/20 text-accent";
      case "rejected":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display">Transaction Management</h1>
        </div>
        <p className="text-muted-foreground">Review and validate pending user transactions</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <Card className="modern-card p-12 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-accent" />
          </div>
          <p className="text-lg font-semibold mb-2">All transactions processed</p>
          <p className="text-muted-foreground">No pending transactions at this moment</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {transactions.map((tx) => (
            <Card key={tx.id} className="modern-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold capitalize">{tx.type}</h3>
                    <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">ID Utilisateur: {tx.userId}</p>
                  <p className="text-sm text-muted-foreground">Date: {new Date(tx.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{tx.amount.toLocaleString()} XOF</p>
                </div>
              </div>

              {tx.depositAddress && (
                <div className="p-3 rounded-lg bg-muted/40 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Deposit Address</p>
                  <p className="text-sm font-mono break-all">{tx.depositAddress}</p>
                </div>
              )}

              {tx.description && (
                <div className="p-3 rounded-lg bg-muted/40">
                  <p className="text-sm text-muted-foreground">{tx.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes d'administration</label>
                <Textarea
                  placeholder="Ajouter une note..."
                  value={adminNotes[tx.id] || ""}
                  onChange={(e) => setAdminNotes({ ...adminNotes, [tx.id]: e.target.value })}
                  className="text-sm"
                  data-testid={`textarea-note-${tx.id}`}
                />
              </div>

              {tx.status === "pending" && (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="default"
                    onClick={() => approveMutation.mutate(tx.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1"
                    data-testid={`button-approve-${tx.id}`}
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Approuver
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => rejectMutation.mutate(tx.id)}
                    disabled={rejectMutation.isPending}
                    className="flex-1"
                    data-testid={`button-reject-${tx.id}`}
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Rejeter
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
