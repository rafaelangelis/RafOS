import { prisma } from "../../db/client";
import { ApiError } from "../../utils/ApiError";
import { UpdateEquipamentoInput } from "./equipamentos.schema";

export async function getEquipamento(id: number) {
  const equipamento = await prisma.equipamento.findUnique({ where: { id } });
  if (!equipamento) throw new ApiError(404, "Equipamento não encontrado");
  return equipamento;
}

export async function updateEquipamento(id: number, input: UpdateEquipamentoInput) {
  await getEquipamento(id);
  return prisma.equipamento.update({ where: { id }, data: input });
}
