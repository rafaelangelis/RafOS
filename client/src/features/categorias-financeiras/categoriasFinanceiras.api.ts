import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface CategoriaFinanceira {
  id: number;
  nome: string;
  ativo: boolean;
  criadoEm: string;
}

export function useCategoriasFinanceiras() {
  return useQuery({
    queryKey: ["categorias-financeiras"],
    queryFn: async () =>
      (await apiClient.get<CategoriaFinanceira[]>("/categorias-financeiras")).data,
  });
}

export function useCreateCategoriaFinanceira() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nome: string) =>
      (await apiClient.post<CategoriaFinanceira>("/categorias-financeiras", { nome })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categorias-financeiras"] }),
  });
}
