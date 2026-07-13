import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Role } from "@/features/auth/AuthContext";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
  criadoEm: string;
}

export interface UsuarioInput {
  nome: string;
  email: string;
  senha?: string;
  role: Role;
  ativo?: boolean;
}

export function useUsuarios() {
  return useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => (await apiClient.get<Usuario[]>("/usuarios")).data,
  });
}

export interface TecnicoOpcao {
  id: number;
  nome: string;
}

export function useTecnicos() {
  return useQuery({
    queryKey: ["usuarios", "tecnicos", "opcoes"],
    queryFn: async () =>
      (await apiClient.get<TecnicoOpcao[]>("/usuarios/tecnicos/opcoes")).data,
  });
}

export function useUsuario(id?: string) {
  return useQuery({
    queryKey: ["usuarios", id],
    queryFn: async () => (await apiClient.get<Usuario>(`/usuarios/${id}`)).data,
    enabled: !!id,
  });
}

export function useCreateUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UsuarioInput) =>
      (await apiClient.post<Usuario>("/usuarios", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}

export function useUpdateUsuario(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<UsuarioInput>) =>
      (await apiClient.patch<Usuario>(`/usuarios/${id}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}

export function useDeactivateUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/usuarios/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}
