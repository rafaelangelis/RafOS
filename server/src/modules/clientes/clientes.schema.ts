import { z } from "zod";

export const createClienteSchema = z.object({
  nome: z.string().min(1),
  telefone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  endereco: z.string().optional(),
  cpfCnpj: z.string().optional(),
  observacoes: z.string().optional(),
});

export const updateClienteSchema = createClienteSchema.partial();

export const listClientesQuerySchema = z.object({
  q: z.string().optional(),
});

export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;
