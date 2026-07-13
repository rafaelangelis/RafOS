import { prisma } from "../../db/client";
import { ApiError } from "../../utils/ApiError";
import { CriarPagamentoInput } from "./pagamentos.schema";

export async function listPagamentos(osId: number) {
  const os = await prisma.ordemServico.findUnique({ where: { id: osId } });
  if (!os) throw new ApiError(404, "Ordem de serviço não encontrada");

  return prisma.pagamento.findMany({
    where: { osId },
    include: { registradoPor: { select: { id: true, nome: true } } },
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

  return prisma.pagamento.create({
    data: {
      osId,
      valorCentavos: input.valorCentavos,
      formaPagamento: input.formaPagamento,
      observacao: input.observacao,
      registradoPorId: usuarioId,
    },
    include: { registradoPor: { select: { id: true, nome: true } } },
  });
}

export async function deletePagamento(osId: number, pagamentoId: number) {
  const pagamento = await prisma.pagamento.findUnique({ where: { id: pagamentoId } });
  if (!pagamento || pagamento.osId !== osId) {
    throw new ApiError(404, "Pagamento não encontrado");
  }
  await prisma.pagamento.delete({ where: { id: pagamentoId } });
}
