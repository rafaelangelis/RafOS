import { z } from "zod";

export const createCategoriaFinanceiraSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
});

export type CreateCategoriaFinanceiraInput = z.infer<typeof createCategoriaFinanceiraSchema>;
