export type StatusPagamento = "sem_valor" | "pendente" | "parcial" | "pago";

export interface SituacaoPagamento {
  valorPagoCentavos: number;
  saldoDevedorCentavos: number | null;
  statusPagamento: StatusPagamento;
}

export function calcularSituacaoPagamento(
  valorTotalCentavos: number | null,
  pagamentos: { valorCentavos: number }[]
): SituacaoPagamento {
  const valorPagoCentavos = pagamentos.reduce((acc, p) => acc + p.valorCentavos, 0);

  if (valorTotalCentavos == null) {
    return { valorPagoCentavos, saldoDevedorCentavos: null, statusPagamento: "sem_valor" };
  }

  const saldoDevedorCentavos = valorTotalCentavos - valorPagoCentavos;

  let statusPagamento: StatusPagamento;
  if (valorPagoCentavos <= 0) {
    statusPagamento = "pendente";
  } else if (saldoDevedorCentavos > 0) {
    statusPagamento = "parcial";
  } else {
    statusPagamento = "pago";
  }

  return { valorPagoCentavos, saldoDevedorCentavos, statusPagamento };
}
