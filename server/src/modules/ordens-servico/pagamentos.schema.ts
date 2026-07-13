import { z } from "zod";

export const criarPagamentoSchema = z.object({
  valorCentavos: z.number().int().positive(),
  formaPagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
  observacao: z.string().optional(),
  contaFinanceiraId: z.number().int(),
  categoriaFinanceiraId: z.number().int().optional(),
  parcelaId: z.number().int().optional(),
});

export type CriarPagamentoInput = z.infer<typeof criarPagamentoSchema>;
