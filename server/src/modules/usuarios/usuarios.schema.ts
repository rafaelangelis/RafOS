import { z } from "zod";

export const roleSchema = z.enum(["admin", "tecnico", "atendente"]);

export const createUsuarioSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(6),
  role: roleSchema,
});

export const updateUsuarioSchema = z.object({
  nome: z.string().min(1).optional(),
  email: z.string().email().optional(),
  senha: z.string().min(6).optional(),
  role: roleSchema.optional(),
  ativo: z.boolean().optional(),
});

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
