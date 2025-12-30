import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, Copy, ArrowDownLeft, ArrowUpRight } from "lucide-react";
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
  depositAddress?: string;
  createdAt: string;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions/pending"],
    retry: false,
  });

  const approveMutation = useMutation({
    mutationFn: async (txId: number) => {
      return apiRequest("POST", `/api/admin/transactions/${txId}/approve`, {
        adminNote: adminNotes[txId] || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
      toast({ title: "Approuvée ✓", description: "Transaction approuvée avec succès" });
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
      toast({ title: "Rejetée ✗", description: "Transaction rejetée" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return { label: "Dépôt", icon: ArrowDownLeft, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" };
      case "withdrawal":
        return { label: "Retrait", icon: ArrowUpRight, color: "bg-green-500/10 text-green-600 dark:text-green-400" };
      default:
        return { label: type, icon: null, color: "bg-gray-500/10 text-gray-600" };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">Approuvée</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-700 dark:text-red-300">Rejetée</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">En attente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gestion des Transactions</h1>
          <p className="text-muted-foreground text-lg">Approuvez ou rejetez les dépôts et retraits des utilisateurs</p>
        </div>

        {/* Stats */}
        {transactions.length > 0 && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Total en attente</p>
              <p className="text-2xl font-bold">
                {transactions.filter(t => t.status === "pending").length}
              </p>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-blue-500/20">
              <p className="text-sm text-muted-foreground mb-1">Dépôts</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {transactions.filter(t => t.type === "deposit").length}
              </p>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-green-500/20">
              <p className="text-sm text-muted-foreground mb-1">Retraits</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {transactions.filter(t => t.type === "withdrawal").length}
              </p>
            </Card>
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-accent/20">
              <p className="text-sm text-muted-foreground mb-1">Montant total</p>
              <p className="text-2xl font-bold">
                {transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()} USD
              </p>
            </Card>
          </div>
        )}

        {/* Transactions List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Chargement des transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 backdrop-blur-sm">
            <p className="text-lg font-semibold mb-2">Aucune transaction en attente</p>
            <p className="text-muted-foreground">Tous les dépôts et retraits ont été traités</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const typeInfo = getTypeLabel(tx.type);
              const TypeIcon = typeInfo.icon;

              return (
                <Card
                  key={tx.id}
                  className="p-6 bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Left Section - Transaction Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {TypeIcon && <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />}
                        <h3 className="text-lg font-semibold">{typeInfo.label}</h3>
                        {getStatusBadge(tx.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-0.5">ID Utilisateur</p>
                          <p className="font-mono">{tx.userId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-0.5">Montant</p>
                          <p className="font-bold text-primary">{tx.amount.toLocaleString()} USD</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-0.5">ID Transaction</p>
                          <p className="font-mono">{tx.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-0.5">Date</p>
                          <p className="text-xs">{new Date(tx.createdAt).toLocaleString("fr-FR")}</p>
                        </div>
                      </div>

                      {/* Wallet Address for Deposits/Withdrawals */}
                      {tx.depositAddress && (
                        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/20">
                          <p className="text-xs text-muted-foreground font-medium mb-2">
                            {tx.type === "deposit" ? "Adresse de dépôt" : "Adresse USDT TRC20"}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-mono break-all flex-1 bg-black/20 px-2 py-1.5 rounded">
                              {tx.depositAddress}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(tx.depositAddress!, `addr-${tx.id}`)}
                              className="flex-shrink-0"
                              data-testid={`button-copy-${tx.id}`}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Section - Actions (Pending Only) */}
                    {tx.status === "pending" && (
                      <div className="lg:w-80 space-y-3 pt-4 lg:pt-0 lg:border-l lg:border-primary/10 lg:pl-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                            Notes d'administration
                          </label>
                          <Textarea
                            placeholder="Ajouter une note..."
                            value={adminNotes[tx.id] || ""}
                            onChange={(e) => setAdminNotes({ ...adminNotes, [tx.id]: e.target.value })}
                            className="text-sm resize-none"
                            rows={3}
                            data-testid={`textarea-note-${tx.id}`}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => approveMutation.mutate(tx.id)}
                            disabled={approveMutation.isPending}
                            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
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
                            onClick={() => rejectMutation.mutate(tx.id)}
                            disabled={rejectMutation.isPending}
                            variant="outline"
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
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
