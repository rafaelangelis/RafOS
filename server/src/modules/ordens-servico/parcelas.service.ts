import { prisma } from "../../db/client";
import { calcularSituacaoParcela } from "./parcelas.util";

export async function listParcelas(osId: number) {
  const parcelas = await prisma.parcela.findMany({
    where: { osId },
    orderBy: { numero: "asc" },
  });

  return parcelas.map((p) => ({
    ...p,
    situacao: calcularSituacaoParcela(p.dataVencimento, p.pagamentoId),
  }));
}
