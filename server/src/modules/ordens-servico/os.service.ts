import { ItemTipo } from "@prisma/client";
import { prisma } from "../../db/client";
import { ApiError } from "../../utils/ApiError";
import { podeTransicionar } from "./os-status";
import {
  ChangeStatusInput,
  CreateOrdemInput,
  UpdateOrdemInput,
} from "./os.schema";
import { calcularSituacaoPagamento } from "./pagamentos.util";
import { calcularSituacaoParcela } from "./parcelas.util";

const includeCompleto = {
  cliente: true,
  equipamento: true,
  tecnicoResponsavel: {
    select: { id: true, nome: true, email: true, role: true },
  },
} as const;

interface ListFilters {
  status?: string;
  clienteId?: number;
  tecnicoId?: number;
}

export function listOrdens(filters: ListFilters) {
  return prisma.ordemServico.findMany({
    where: {
      status: filters.status as never,
      clienteId: filters.clienteId,
      tecnicoResponsavelId: filters.tecnicoId,
    },
    include: includeCompleto,
    orderBy: { dataAbertura: "desc" },
  });
}

export async function getOrdem(id: number) {
  const os = await prisma.ordemServico.findUnique({
    where: { id },
    include: includeCompleto,
  });
  if (!os) throw new ApiError(404, "Ordem de serviço não encontrada");
  return os;
}

export async function getOrdemComSituacao(id: number) {
  const os = await getOrdem(id);
  const pagamentos = await prisma.pagamento.findMany({ where: { osId: id } });
  const itens = await prisma.ordemItem.findMany({
    where: { osId: id },
    orderBy: { criadoEm: "asc" },
  });
  const parcelasRaw = await prisma.parcela.findMany({
    where: { osId: id },
    orderBy: { numero: "asc" },
  });
  const parcelas = parcelasRaw.map((p) => ({
    ...p,
    situacao: calcularSituacaoParcela(p.dataVencimento, p.pagamentoId),
  }));
  const situacao = calcularSituacaoPagamento(os.valorTotalCentavos, pagamentos);
  return { ...os, ...situacao, itens, parcelas };
}

export async function recomputeValoresOS(osId: number, tipo: ItemTipo) {
  const itensDoTipo = await prisma.ordemItem.findMany({ where: { osId, tipo } });
  if (itensDoTipo.length === 0) return;

  const total = itensDoTipo.reduce((acc, i) => acc + i.precoTotalCentavos, 0);
  const os = await prisma.ordemServico.findUniqueOrThrow({ where: { id: osId } });

  const valorPecasCentavos = tipo === "peca" ? total : os.valorPecasCentavos;
  const valorMaoObraCentavos = tipo === "servico" ? total : os.valorMaoObraCentavos;

  await prisma.ordemServico.update({
    where: { id: osId },
    data: {
      valorPecasCentavos,
      valorMaoObraCentavos,
      valorTotalCentavos: (valorPecasCentavos ?? 0) + (valorMaoObraCentavos ?? 0),
    },
  });
}

export async function getHistorico(id: number) {
  await getOrdem(id);
  return prisma.historicoStatus.findMany({
    where: { osId: id },
    include: { usuario: { select: { id: true, nome: true } } },
    orderBy: { data: "asc" },
  });
}

export async function createOrdem(input: CreateOrdemInput, usuarioId: number) {
  const cliente = await prisma.cliente.findUnique({ where: { id: input.clienteId } });
  if (!cliente) throw new ApiError(404, "Cliente não encontrado");

  let equipamentoId = input.equipamentoId;

  if (equipamentoId) {
    const equipamento = await prisma.equipamento.findUnique({ where: { id: equipamentoId } });
    if (!equipamento) throw new ApiError(404, "Equipamento não encontrado");
    if (equipamento.clienteId !== input.clienteId) {
      throw new ApiError(400, "Equipamento não pertence a este cliente");
    }
  } else if (input.equipamentoNovo) {
    const equipamento = await prisma.equipamento.create({
      data: {
        clienteId: input.clienteId,
        ...input.equipamentoNovo,
        marca: input.equipamentoNovo.marca ?? "",
        modelo: input.equipamentoNovo.modelo ?? "",
      },
    });
    equipamentoId = equipamento.id;
  }

  return prisma.$transaction(async (tx) => {
    const os = await tx.ordemServico.create({
      data: {
        clienteId: input.clienteId,
        equipamentoId: equipamentoId!,
        tecnicoResponsavelId: input.tecnicoResponsavelId,
        defeitoRelatado: input.defeitoRelatado,
        dataPrevisao: input.dataPrevisao ? new Date(input.dataPrevisao) : undefined,
        observacoes: input.observacoes,
        valorOrcamentoCentavos: input.valorOrcamentoCentavos,
      },
    });

    await tx.historicoStatus.create({
      data: {
        osId: os.id,
        statusAnterior: null,
        statusNovo: "aberta",
        usuarioId,
        observacao: "OS aberta",
      },
    });

    if (input.parcelas && input.parcelas.length > 0) {
      await tx.parcela.createMany({
        data: input.parcelas.map((p, index) => ({
          osId: os.id,
          numero: index + 1,
          dataVencimento: new Date(p.dataVencimento),
          valorCentavos: p.valorCentavos,
          formaPagamento: p.formaPagamento,
        })),
      });
    }

    return tx.ordemServico.findUniqueOrThrow({
      where: { id: os.id },
      include: includeCompleto,
    });
  });
}

export async function updateOrdem(id: number, input: UpdateOrdemInput) {
  const os = await getOrdem(id);

  const valorPecas = input.valorPecasCentavos ?? os.valorPecasCentavos ?? undefined;
  const valorMaoObra = input.valorMaoObraCentavos ?? os.valorMaoObraCentavos ?? undefined;
  const valorTotalCentavos =
    input.valorPecasCentavos !== undefined || input.valorMaoObraCentavos !== undefined
      ? (valorPecas ?? 0) + (valorMaoObra ?? 0)
      : undefined;

  return prisma.ordemServico.update({
    where: { id },
    data: {
      tecnicoResponsavelId: input.tecnicoResponsavelId,
      diagnostico: input.diagnostico,
      valorOrcamentoCentavos: input.valorOrcamentoCentavos,
      valorPecasCentavos: input.valorPecasCentavos,
      valorMaoObraCentavos: input.valorMaoObraCentavos,
      valorTotalCentavos,
      formaPagamento: input.formaPagamento,
      dataPrevisao: input.dataPrevisao ? new Date(input.dataPrevisao) : undefined,
      observacoes: input.observacoes,
      garantiaDias: input.garantiaDias,
      garantiaObservacoes: input.garantiaObservacoes,
    },
    include: includeCompleto,
  });
}

export async function changeStatus(id: number, input: ChangeStatusInput, usuarioId: number) {
  const os = await getOrdem(id);

  if (!podeTransicionar(os.status, input.novoStatus)) {
    throw new ApiError(
      409,
      `Não é possível mudar de "${os.status}" para "${input.novoStatus}"`
    );
  }

  const dataExtra: { dataConclusao?: Date; dataEntrega?: Date } = {};

  if (input.novoStatus === "pronta") {
    dataExtra.dataConclusao = new Date();
  }

  if (input.novoStatus === "entregue") {
    if (!os.valorTotalCentavos || !os.formaPagamento) {
      throw new ApiError(
        400,
        "Preencha o valor total e a forma de pagamento antes de marcar como entregue"
      );
    }
    dataExtra.dataEntrega = new Date();
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.ordemServico.update({
      where: { id },
      data: { status: input.novoStatus, ...dataExtra },
      include: includeCompleto,
    });

    await tx.historicoStatus.create({
      data: {
        osId: id,
        statusAnterior: os.status,
        statusNovo: input.novoStatus,
        usuarioId,
        observacao: input.observacao,
      },
    });

    return updated;
  });
}

export async function deleteOrdem(id: number) {
  const os = await getOrdem(id);
  if (os.status !== "aberta") {
    throw new ApiError(409, "Só é possível excluir OS com status 'aberta'. Use cancelar.");
  }
  await prisma.historicoStatus.deleteMany({ where: { osId: id } });
  await prisma.ordemServico.delete({ where: { id } });
}
