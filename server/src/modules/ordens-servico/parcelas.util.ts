export type StatusParcela = "paga" | "atrasada" | "pendente";

export function calcularSituacaoParcela(
  dataVencimento: Date,
  pagamentoId: number | null
): StatusParcela {
  if (pagamentoId) return "paga";
  return dataVencimento < new Date() ? "atrasada" : "pendente";
}
