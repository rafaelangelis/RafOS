import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
  cpfCnpj: string | null;
  observacoes: string | null;
  criadoEm: string;
}

export interface ClienteInput {
  nome: string;
  telefone: string;
  email?: string;
  endereco?: string;
  cpfCnpj?: string;
  observacoes?: string;
}

export interface Equipamento {
  id: number;
  clienteId: number;
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie: string | null;
  senhaAcesso: string | null;
  acessorios: string | null;
}

export function useClientes(q?: string) {
  return useQuery({
    queryKey: ["clientes", q],
    queryFn: async () =>
      (await apiClient.get<Cliente[]>("/clientes", { params: { q } })).data,
  });
}

export function useCliente(id?: string) {
  return useQuery({
    queryKey: ["clientes", id],
    queryFn: async () => (await apiClient.get<Cliente>(`/clientes/${id}`)).data,
    enabled: !!id,
  });
}

export function useClienteEquipamentos(id?: string) {
  return useQuery({
    queryKey: ["clientes", id, "equipamentos"],
    queryFn: async () =>
      (await apiClient.get<Equipamento[]>(`/clientes/${id}/equipamentos`)).data,
    enabled: !!id,
  });
}

export function useClienteOrdens(id?: string) {
  return useQuery({
    queryKey: ["clientes", id, "ordens"],
    queryFn: async () => (await apiClient.get(`/clientes/${id}/ordens`)).data,
    enabled: !!id,
  });
}

export function useCreateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClienteInput) =>
      (await apiClient.post<Cliente>("/clientes", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clientes"] }),
  });
}

export function useUpdateCliente(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<ClienteInput>) =>
      (await apiClient.patch<Cliente>(`/clientes/${id}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clientes"] }),
  });
}
