import { prisma } from "../../db/client";
import { calcularSituacaoPagamento } from "../ordens-servico/pagamentos.util";
import { calcularSituacaoParcela } from "../ordens-servico/parcelas.util";

function inicioDoDia(dataStr: string) {
  return new Date(`${dataStr}T00:00:00.000`);
}

function fimDoDia(dataStr: string) {
  return new Date(`${dataStr}T23:59:59.999`);
}

export async function listContasAReceber() {
  const ordens = await prisma.ordemServico.findMany({
    where: {
      status: { not: "cancelada" },
      valorTotalCentavos: { not: null },
    },
    include: {
      cliente: true,
      equipamento: true,
      pagamentos: true,
      parcelas: true,
    },
    orderBy: { dataPrevisao: "asc" },
  });

  return ordens
    .filter((os) => os.parcelas.length === 0)
    .map((os) => {
      const { pagamentos, parcelas, ...resto } = os;
      const situacao = calcularSituacaoPagamento(os.valorTotalCentavos, pagamentos);
      return { ...resto, ...situacao };
    })
    .filter((os) => (os.saldoDevedorCentavos ?? 0) > 0);
}

export async function listParcelasEmAberto() {
  const parcelas = await prisma.parcela.findMany({
    where: { pagamentoId: null },
    include: {
      os: { include: { cliente: true } },
    },
    orderBy: { dataVencimento: "asc" },
  });

  return parcelas.map((p) => ({
    ...p,
    situacao: calcularSituacaoParcela(p.dataVencimento, p.pagamentoId),
  }));
}

export async function listSaldoPorConta() {
  const contas = await prisma.contaFinanceira.findMany({ where: { ativo: true } });

  const somas = await prisma.pagamento.groupBy({
    by: ["contaFinanceiraId"],
    _sum: { valorCentavos: true },
  });

  return contas.map((conta) => ({
    conta,
    saldoCentavos:
      somas.find((s) => s.contaFinanceiraId === conta.id)?._sum.valorCentavos ?? 0,
  }));
}

export async function getRecebidoPeriodo(inicio: string, fim: string) {
  const pagamentos = await prisma.pagamento.findMany({
    where: { data: { gte: inicioDoDia(inicio), lte: fimDoDia(fim) } },
    include: {
      os: { include: { cliente: true } },
      registradoPor: { select: { id: true, nome: true } },
    },
    orderBy: { data: "asc" },
  });

  const totalCentavos = pagamentos.reduce((acc, p) => acc + p.valorCentavos, 0);

  const porFormaPagamento: Record<string, number> = {};
  for (const p of pagamentos) {
    porFormaPagamento[p.formaPagamento] =
      (porFormaPagamento[p.formaPagamento] ?? 0) + p.valorCentavos;
  }

  return { totalCentavos, porFormaPagamento, pagamentos };
}

export async function exportarCsv(inicio: string, fim: string) {
  const { pagamentos } = await getRecebidoPeriodo(inicio, fim);

  const linhas = [
    "data,os,cliente,valor,forma_pagamento",
    ...pagamentos.map((p) =>
      [
        p.data.toISOString().slice(0, 10),
        p.osId,
        `"${p.os.cliente.nome.replace(/"/g, '""')}"`,
        (p.valorCentavos / 100).toFixed(2),
        p.formaPagamento,
      ].join(",")
    ),
  ];

  return linhas.join("\n");
}
