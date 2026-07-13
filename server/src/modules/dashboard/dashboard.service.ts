import { StatusOS } from "@prisma/client";
import { prisma } from "../../db/client";

const TODOS_STATUS: StatusOS[] = [
  "aberta",
  "em_analise",
  "aguardando_aprovacao",
  "aguardando_peca",
  "em_conserto",
  "pronta",
  "entregue",
  "cancelada",
];

export async function getResumo() {
  const contagens = await prisma.ordemServico.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const porStatus = Object.fromEntries(
    TODOS_STATUS.map((status) => [
      status,
      contagens.find((c) => c.status === status)?._count._all ?? 0,
    ])
  ) as Record<StatusOS, number>;

  const atrasadas = await prisma.ordemServico.findMany({
    where: {
      dataPrevisao: { lt: new Date() },
      status: { notIn: ["entregue", "cancelada"] },
    },
    include: { cliente: true, equipamento: true },
    orderBy: { dataPrevisao: "asc" },
  });

  return { porStatus, atrasadas };
}
