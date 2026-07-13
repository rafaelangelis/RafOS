import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface FormaPagamento {
  id: number;
  nome: string;
  ativo: boolean;
  criadoEm: string;
}

export function useFormasPagamento() {
  return useQuery({
    queryKey: ["formas-pagamento"],
    queryFn: async () => (await apiClient.get<FormaPagamento[]>("/formas-pagamento")).data,
  });
}

export function useCreateFormaPagamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nome: string) =>
      (await apiClient.post<FormaPagamento>("/formas-pagamento", { nome })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["formas-pagamento"] }),
  });
}
