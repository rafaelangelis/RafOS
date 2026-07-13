import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ContaFinanceira {
  id: number;
  nome: string;
  ativo: boolean;
  criadoEm: string;
}

export function useContasFinanceiras() {
  return useQuery({
    queryKey: ["contas-financeiras"],
    queryFn: async () => (await apiClient.get<ContaFinanceira[]>("/contas-financeiras")).data,
  });
}

export function useCreateContaFinanceira() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nome: string) =>
      (await apiClient.post<ContaFinanceira>("/contas-financeiras", { nome })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contas-financeiras"] }),
  });
}
