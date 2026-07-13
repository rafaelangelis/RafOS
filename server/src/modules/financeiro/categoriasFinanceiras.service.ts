import { prisma } from "../../db/client";
import { ApiError } from "../../utils/ApiError";
import { CreateCategoriaFinanceiraInput } from "./categoriasFinanceiras.schema";

export function listCategoriasFinanceiras() {
  return prisma.categoriaFinanceira.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });
}

export async function createCategoriaFinanceira(input: CreateCategoriaFinanceiraInput) {
  const existente = await prisma.categoriaFinanceira.findFirst({
    where: { nome: { equals: input.nome } },
  });
  if (existente) {
    if (existente.ativo) {
      throw new ApiError(409, "Já existe uma categoria financeira com esse nome");
    }
    return prisma.categoriaFinanceira.update({
      where: { id: existente.id },
      data: { ativo: true },
    });
  }

  return prisma.categoriaFinanceira.create({ data: { nome: input.nome } });
}
