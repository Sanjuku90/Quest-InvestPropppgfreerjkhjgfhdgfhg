import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// === INVESTMENTS & WALLET ===

export function useDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      const res = await fetch(api.invest.deposit.path, {
        method: api.invest.deposit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error("Deposit failed");
      return api.invest.deposit.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      queryClient.invalidateQueries({ queryKey: [api.wallet.history.path] });
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      const res = await fetch(api.wallet.withdraw.path, {
        method: api.wallet.withdraw.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error("Withdrawal failed");
      return api.wallet.withdraw.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      queryClient.invalidateQueries({ queryKey: [api.wallet.history.path] });
    },
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: [api.wallet.history.path],
    queryFn: async () => {
      const res = await fetch(api.wallet.history.path);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.wallet.history.responses[200].parse(await res.json());
    },
  });
}

// === QUESTS ===

export function useQuests() {
  return useQuery({
    queryKey: [api.quests.list.path],
    queryFn: async () => {
      const res = await fetch(api.quests.list.path);
      if (!res.ok) throw new Error("Failed to fetch quests");
      return api.quests.list.responses[200].parse(await res.json());
    },
  });
}

export function useCompleteQuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.quests.complete.path, { id });
      const res = await fetch(url, {
        method: api.quests.complete.method,
      });
      if (!res.ok) throw new Error("Failed to complete quest");
      return api.quests.complete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.quests.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      queryClient.invalidateQueries({ queryKey: [api.wallet.history.path] });
    },
  });
}

// === GAME ===

export function useSpinWheel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.game.spin.path, {
        method: api.game.spin.method,
      });
      if (!res.ok) throw new Error("Spin failed");
      return api.game.spin.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      queryClient.invalidateQueries({ queryKey: [api.wallet.history.path] });
    },
  });
}
