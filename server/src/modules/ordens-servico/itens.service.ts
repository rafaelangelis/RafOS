import { prisma } from "../../db/client";
import { ApiError } from "../../utils/ApiError";
import { CriarItemInput } from "./itens.schema";
import { recomputeValoresOS } from "./os.service";

export async function listItens(osId: number, tipo?: "peca" | "servico") {
  const os = await prisma.ordemServico.findUnique({ where: { id: osId } });
  if (!os) throw new ApiError(404, "Ordem de serviço não encontrada");

  return prisma.ordemItem.findMany({
    where: { osId, tipo },
    orderBy: { criadoEm: "asc" },
  });
}

export async function criarItem(osId: number, input: CriarItemInput) {
  const os = await prisma.ordemServico.findUnique({ where: { id: osId } });
  if (!os) throw new ApiError(404, "Ordem de serviço não encontrada");

  const item = await prisma.ordemItem.create({
    data: {
      osId,
      tipo: input.tipo,
      descricao: input.descricao,
      quantidade: input.quantidade,
      precoUnitarioCentavos: input.precoUnitarioCentavos,
      precoTotalCentavos: input.quantidade * input.precoUnitarioCentavos,
    },
  });

  await recomputeValoresOS(osId, input.tipo);

  return item;
}

export async function deletarItem(osId: number, itemId: number) {
  const item = await prisma.ordemItem.findUnique({ where: { id: itemId } });
  if (!item || item.osId !== osId) {
    throw new ApiError(404, "Item não encontrado");
  }

  await prisma.ordemItem.delete({ where: { id: itemId } });
  await recomputeValoresOS(osId, item.tipo);
}
