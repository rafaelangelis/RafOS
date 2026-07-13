import { z } from "zod";

export const createContaFinanceiraSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
});

export type CreateContaFinanceiraInput = z.infer<typeof createContaFinanceiraSchema>;
