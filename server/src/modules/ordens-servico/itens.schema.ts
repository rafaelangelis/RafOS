import { z } from "zod";

export const criarItemSchema = z.object({
  tipo: z.enum(["peca", "servico"]),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  quantidade: z.number().int().positive().default(1),
  precoUnitarioCentavos: z.number().int().nonnegative(),
});

export const listItensQuerySchema = z.object({
  tipo: z.enum(["peca", "servico"]).optional(),
});

export type CriarItemInput = z.infer<typeof criarItemSchema>;
