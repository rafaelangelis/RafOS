import { prisma } from "../../db/client";
import { ApiError } from "../../utils/ApiError";
import { CreateContaFinanceiraInput } from "./contasFinanceiras.schema";

export function listContasFinanceiras() {
  return prisma.contaFinanceira.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });
}

export async function createContaFinanceira(input: CreateContaFinanceiraInput) {
  const existente = await prisma.contaFinanceira.findFirst({
    where: { nome: { equals: input.nome } },
  });
  if (existente) {
    if (existente.ativo) {
      throw new ApiError(409, "Já existe uma conta financeira com esse nome");
    }
    return prisma.contaFinanceira.update({
      where: { id: existente.id },
      data: { ativo: true },
    });
  }

  return prisma.contaFinanceira.create({ data: { nome: input.nome } });
}
