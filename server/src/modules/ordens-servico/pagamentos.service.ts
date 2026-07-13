import { prisma } from "../../db/client";
import { ApiError } from "../../utils/ApiError";
import { CriarPagamentoInput } from "./pagamentos.schema";

const includePagamento = {
  registradoPor: { select: { id: true, nome: true } },
  contaFinanceira: true,
  categoriaFinanceira: true,
} as const;

export async function listPagamentos(osId: number) {
  const os = await prisma.ordemServico.findUnique({ where: { id: osId } });
  if (!os) throw new ApiError(404, "Ordem de serviço não encontrada");

  return prisma.pagamento.findMany({
    where: { osId },
    include: includePagamento,
    orderBy: { data: "asc" },
  });
}

export async function registrarPagamento(
  osId: number,
  input: CriarPagamentoInput,
  usuarioId: number
) {
  const os = await prisma.ordemServico.findUnique({ where: { id: osId } });
  if (!os) throw new ApiError(404, "Ordem de serviço não encontrada");

  let parcela = null;
  if (input.parcelaId) {
    parcela = await prisma.parcela.findUnique({ where: { id: input.parcelaId } });
    if (!parcela || parcela.osId !== osId) {
      throw new ApiError(404, "Parcela não encontrada");
    }
    if (parcela.pagamentoId) {
      throw new ApiError(409, "Esta parcela já foi quitada");
    }
  }

  return prisma.$transaction(async (tx) => {
    const pagamento = await tx.pagamento.create({
      data: {
        osId,
        valorCentavos: input.valorCentavos,
        formaPagamento: input.formaPagamento,
        observacao: input.observacao,
        registradoPorId: usuarioId,
        contaFinanceiraId: input.contaFinanceiraId,
        categoriaFinanceiraId: input.categoriaFinanceiraId,
      },
      include: includePagamento,
    });

    if (parcela) {
      await tx.parcela.update({
        where: { id: parcela.id },
        data: { pagamentoId: pagamento.id },
      });
    }

    return pagamento;
  });
}

export async function deletePagamento(osId: number, pagamentoId: number) {
  const pagamento = await prisma.pagamento.findUnique({ where: { id: pagamentoId } });
  if (!pagamento || pagamento.osId !== osId) {
    throw new ApiError(404, "Pagamento não encontrado");
  }

  await prisma.$transaction(async (tx) => {
    await tx.parcela.updateMany({
      where: { pagamentoId },
      data: { pagamentoId: null },
    });
    await tx.pagamento.delete({ where: { id: pagamentoId } });
  });
}
