import { StatusOS } from "@prisma/client";

export const STATUS_TRANSICOES: Record<StatusOS, StatusOS[]> = {
  aberta: ["em_analise", "cancelada"],
  em_analise: ["aguardando_aprovacao", "aguardando_peca", "em_conserto", "cancelada"],
  aguardando_aprovacao: ["em_conserto", "cancelada"],
  aguardando_peca: ["em_conserto", "cancelada"],
  em_conserto: ["pronta", "aguardando_peca", "cancelada"],
  pronta: ["entregue"],
  entregue: [],
  cancelada: [],
};

export function podeTransicionar(atual: StatusOS, novo: StatusOS): boolean {
  return STATUS_TRANSICOES[atual].includes(novo);
}
