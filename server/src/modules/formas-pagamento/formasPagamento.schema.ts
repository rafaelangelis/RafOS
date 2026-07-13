import { z } from "zod";

export const createFormaPagamentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
});

export type CreateFormaPagamentoInput = z.infer<typeof createFormaPagamentoSchema>;
