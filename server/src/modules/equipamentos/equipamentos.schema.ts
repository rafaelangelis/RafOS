import { z } from "zod";

export const equipamentoInputSchema = z.object({
  tipo: z.string().min(1, "Tipo é obrigatório"),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numeroSerie: z.string().optional(),
  senhaAcesso: z.string().optional(),
  acessorios: z.string().optional(),
});

export const updateEquipamentoSchema = equipamentoInputSchema.partial();

export type EquipamentoInput = z.infer<typeof equipamentoInputSchema>;
export type UpdateEquipamentoInput = z.infer<typeof updateEquipamentoSchema>;
