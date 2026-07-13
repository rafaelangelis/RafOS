import { z } from "zod";

export const periodoQuerySchema = z.object({
  inicio: z.string().min(1, "Data inicial obrigatória"),
  fim: z.string().min(1, "Data final obrigatória"),
});

export type PeriodoQuery = z.infer<typeof periodoQuerySchema>;
