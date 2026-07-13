import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { OrdemServico, StatusOS } from "@/features/ordens/ordens.api";

export interface DashboardResumo {
  porStatus: Record<StatusOS, number>;
  atrasadas: OrdemServico[];
}

export function useDashboardResumo() {
  return useQuery({
    queryKey: ["dashboard", "resumo"],
    queryFn: async () => (await apiClient.get<DashboardResumo>("/dashboard/resumo")).data,
    refetchInterval: 60_000,
  });
}
