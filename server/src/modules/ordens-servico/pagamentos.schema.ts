import { z } from "zod";

export const criarPagamentoSchema = z.object({
  valorCentavos: z.number().int().positive(),
  formaPagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
  observacao: z.string().optional(),
});

export type CriarPagamentoInput = z.infer<typeof criarPagamentoSchema>;
