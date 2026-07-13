import { prisma } from "../../db/client";
import { ApiError } from "../../utils/ApiError";
import { CreateFormaPagamentoInput } from "./formasPagamento.schema";

export function listFormasPagamento() {
  return prisma.formaPagamento.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });
}

export async function createFormaPagamento(input: CreateFormaPagamentoInput) {
  const existente = await prisma.formaPagamento.findFirst({
    where: { nome: { equals: input.nome } },
  });
  if (existente) {
    if (existente.ativo) {
      throw new ApiError(409, "Já existe uma forma de pagamento com esse nome");
    }
    return prisma.formaPagamento.update({
      where: { id: existente.id },
      data: { ativo: true },
    });
  }

  return prisma.formaPagamento.create({ data: { nome: input.nome } });
}
