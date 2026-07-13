import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Cliente, Equipamento } from "@/features/clientes/clientes.api";

export type { Equipamento };

export type StatusOS =
  | "aberta"
  | "em_analise"
  | "aguardando_aprovacao"
  | "aguardando_peca"
  | "em_conserto"
  | "pronta"
  | "entregue"
  | "cancelada";

export const STATUS_TRANSICOES: Record<StatusOS, StatusOS[]> = {
  aberta: ["em_analise", "cancelada"],
  em_analise: ["aguardando_aprovacao", "aguardando_peca", "em_conserto", "cancelada"],
  aguardando_aprovacao: ["em_conserto", "cancelada"],
  aguardando_peca: ["em_conserto", "cancelada"],
  em_conserto: ["pronta", "aguardando_peca", "cancelada"],
  pronta: ["entregue"],
  entregue: [],
  cancelada: [],
};

export const STATUS_LABELS: Record<StatusOS, string> = {
  aberta: "Aberta",
  em_analise: "Em análise",
  aguardando_aprovacao: "Aguardando aprovação",
  aguardando_peca: "Aguardando peça",
  em_conserto: "Em conserto",
  pronta: "Pronta",
  entregue: "Entregue",
  cancelada: "Cancelada",
};

export interface TecnicoResumo {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export type ItemTipo = "peca" | "servico";

export interface OrdemItem {
  id: number;
  osId: number;
  tipo: ItemTipo;
  descricao: string;
  quantidade: number;
  precoUnitarioCentavos: number;
  precoTotalCentavos: number;
}

export type StatusParcela = "paga" | "atrasada" | "pendente";

export interface Parcela {
  id: number;
  osId: number;
  numero: number;
  dataVencimento: string;
  valorCentavos: number;
  formaPagamento: string | null;
  pagamentoId: number | null;
  situacao: StatusParcela;
}

export interface OrdemServico {
  id: number;
  clienteId: number;
  equipamentoId: number;
  tecnicoResponsavelId: number | null;
  defeitoRelatado: string;
  diagnostico: string | null;
  status: StatusOS;
  valorOrcamentoCentavos: number | null;
  valorPecasCentavos: number | null;
  valorMaoObraCentavos: number | null;
  valorTotalCentavos: number | null;
  formaPagamento: string | null;
  dataAbertura: string;
  dataPrevisao: string | null;
  dataConclusao: string | null;
  dataEntrega: string | null;
  observacoes: string | null;
  garantiaDias: number | null;
  garantiaObservacoes: string | null;
  cliente: Cliente;
  equipamento: Equipamento;
  tecnicoResponsavel: TecnicoResumo | null;
  valorPagoCentavos?: number;
  saldoDevedorCentavos?: number | null;
  statusPagamento?: StatusPagamento;
  itens?: OrdemItem[];
  parcelas?: Parcela[];
}

export type StatusPagamento = "sem_valor" | "pendente" | "parcial" | "pago";

export interface HistoricoStatusItem {
  id: number;
  osId: number;
  statusAnterior: StatusOS | null;
  statusNovo: StatusOS;
  data: string;
  observacao: string | null;
  usuario: { id: number; nome: string };
}

export interface CreateOrdemInput {
  clienteId: number;
  equipamentoId?: number;
  equipamentoNovo?: {
    tipo: string;
    marca?: string;
    modelo?: string;
    numeroSerie?: string;
    senhaAcesso?: string;
    acessorios?: string;
  };
  tecnicoResponsavelId?: number;
  defeitoRelatado: string;
  dataPrevisao?: string;
  observacoes?: string;
  valorOrcamentoCentavos?: number;
  parcelas?: {
    dataVencimento: string;
    valorCentavos: number;
    formaPagamento?: string;
  }[];
}

export interface UpdateOrdemInput {
  tecnicoResponsavelId?: number | null;
  diagnostico?: string;
  valorOrcamentoCentavos?: number;
  valorPecasCentavos?: number;
  valorMaoObraCentavos?: number;
  formaPagamento?: string;
  dataPrevisao?: string;
  observacoes?: string;
  garantiaDias?: number;
  garantiaObservacoes?: string;
}

export interface CreateItemInput {
  tipo: ItemTipo;
  descricao: string;
  quantidade: number;
  precoUnitarioCentavos: number;
}

interface ListFilters {
  status?: StatusOS;
  clienteId?: number;
  tecnicoId?: number;
}

export function useOrdens(filters: ListFilters = {}) {
  return useQuery({
    queryKey: ["ordens", filters],
    queryFn: async () =>
      (await apiClient.get<OrdemServico[]>("/ordens", { params: filters })).data,
  });
}

export function useOrdem(id?: string) {
  return useQuery({
    queryKey: ["ordens", id],
    queryFn: async () => (await apiClient.get<OrdemServico>(`/ordens/${id}`)).data,
    enabled: !!id,
  });
}

export function useOrdemHistorico(id?: string) {
  return useQuery({
    queryKey: ["ordens", id, "historico"],
    queryFn: async () =>
      (await apiClient.get<HistoricoStatusItem[]>(`/ordens/${id}/historico`)).data,
    enabled: !!id,
  });
}

export function useCreateOrdem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOrdemInput) =>
      (await apiClient.post<OrdemServico>("/ordens", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ordens"] }),
  });
}

export function useUpdateOrdem(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateOrdemInput) =>
      (await apiClient.patch<OrdemServico>(`/ordens/${id}`, input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens", id] });
      queryClient.invalidateQueries({ queryKey: ["ordens"] });
    },
  });
}

export function useChangeStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { novoStatus: StatusOS; observacao?: string }) =>
      (await apiClient.patch<OrdemServico>(`/ordens/${id}/status`, input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens", id] });
      queryClient.invalidateQueries({ queryKey: ["ordens", id, "historico"] });
      queryClient.invalidateQueries({ queryKey: ["ordens"] });
    },
  });
}

export function useCreateItem(osId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateItemInput) =>
      (await apiClient.post<OrdemItem>(`/ordens/${osId}/itens`, input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens", osId] });
      queryClient.invalidateQueries({ queryKey: ["ordens"] });
    },
  });
}

export function useDeleteItem(osId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: number) => apiClient.delete(`/ordens/${osId}/itens/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens", osId] });
      queryClient.invalidateQueries({ queryKey: ["ordens"] });
    },
  });
}
