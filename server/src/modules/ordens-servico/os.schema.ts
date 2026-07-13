import { z } from "zod";
import { equipamentoInputSchema } from "../equipamentos/equipamentos.schema";

const statusEnum = z.enum([
  "aberta",
  "em_analise",
  "aguardando_aprovacao",
  "aguardando_peca",
  "em_conserto",
  "pronta",
  "entregue",
  "cancelada",
]);

const parcelaInputSchema = z.object({
  dataVencimento: z.string().datetime(),
  valorCentavos: z.number().int().positive(),
  formaPagamento: z.string().optional(),
});

export const createOrdemSchema = z
  .object({
    clienteId: z.number().int(),
    equipamentoId: z.number().int().optional(),
    equipamentoNovo: equipamentoInputSchema.optional(),
    tecnicoResponsavelId: z.number().int().optional(),
    defeitoRelatado: z.string().min(1),
    dataPrevisao: z.string().datetime().optional(),
    observacoes: z.string().optional(),
    valorOrcamentoCentavos: z.number().int().positive().optional(),
    parcelas: z.array(parcelaInputSchema).optional(),
  })
  .refine((data) => data.equipamentoId || data.equipamentoNovo, {
    message: "Informe equipamentoId ou equipamentoNovo",
    path: ["equipamentoId"],
  });

export const updateOrdemSchema = z.object({
  tecnicoResponsavelId: z.number().int().nullable().optional(),
  diagnostico: z.string().optional(),
  valorOrcamentoCentavos: z.number().int().optional(),
  valorPecasCentavos: z.number().int().optional(),
  valorMaoObraCentavos: z.number().int().optional(),
  formaPagamento: z.string().optional(),
  dataPrevisao: z.string().datetime().optional(),
  observacoes: z.string().optional(),
  garantiaDias: z.number().int().nonnegative().optional(),
  garantiaObservacoes: z.string().optional(),
});

export const changeStatusSchema = z.object({
  novoStatus: statusEnum,
  observacao: z.string().optional(),
});

export const listOrdensQuerySchema = z.object({
  status: statusEnum.optional(),
  clienteId: z.coerce.number().int().optional(),
  tecnicoId: z.coerce.number().int().optional(),
});

export type CreateOrdemInput = z.infer<typeof createOrdemSchema>;
export type UpdateOrdemInput = z.infer<typeof updateOrdemSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
