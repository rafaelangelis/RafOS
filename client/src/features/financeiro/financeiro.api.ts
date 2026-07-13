import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { OrdemServico } from "@/features/ordens/ordens.api";

export interface Pagamento {
  id: number;
  osId: number;
  valorCentavos: number;
  formaPagamento: string;
  data: string;
  observacao: string | null;
  registradoPor: { id: number; nome: string };
}

export interface PagamentoInput {
  valorCentavos: number;
  formaPagamento: string;
  observacao?: string;
}

export type ContaReceber = OrdemServico;

export interface RecebidoPeriodo {
  totalCentavos: number;
  porFormaPagamento: Record<string, number>;
  pagamentos: (Pagamento & { os: { id: number; cliente: { nome: string } } })[];
}

export function useOsPagamentos(osId?: string) {
  return useQuery({
    queryKey: ["ordens", osId, "pagamentos"],
    queryFn: async () =>
      (await apiClient.get<Pagamento[]>(`/ordens/${osId}/pagamentos`)).data,
    enabled: !!osId,
  });
}

export function useRegistrarPagamento(osId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PagamentoInput) =>
      (await apiClient.post<Pagamento>(`/ordens/${osId}/pagamentos`, input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens", osId, "pagamentos"] });
      queryClient.invalidateQueries({ queryKey: ["ordens", osId] });
      queryClient.invalidateQueries({ queryKey: ["financeiro"] });
    },
  });
}

export function useDeletePagamento(osId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pagamentoId: number) =>
      apiClient.delete(`/ordens/${osId}/pagamentos/${pagamentoId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens", osId, "pagamentos"] });
      queryClient.invalidateQueries({ queryKey: ["ordens", osId] });
      queryClient.invalidateQueries({ queryKey: ["financeiro"] });
    },
  });
}

export function useContasAReceber() {
  return useQuery({
    queryKey: ["financeiro", "contas-a-receber"],
    queryFn: async () =>
      (await apiClient.get<ContaReceber[]>("/financeiro/contas-a-receber")).data,
  });
}

export function useRecebidoPeriodo(inicio: string, fim: string) {
  return useQuery({
    queryKey: ["financeiro", "recebido", inicio, fim],
    queryFn: async () =>
      (
        await apiClient.get<RecebidoPeriodo>("/financeiro/recebido", {
          params: { inicio, fim },
        })
      ).data,
    enabled: !!inicio && !!fim,
  });
}

export async function baixarCsv(inicio: string, fim: string) {
  const res = await apiClient.get("/financeiro/export", {
    params: { inicio, fim },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `recebimentos_${inicio}_a_${fim}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
