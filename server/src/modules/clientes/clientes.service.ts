import { prisma } from "../../db/client";
import { ApiError } from "../../utils/ApiError";
import { CreateClienteInput, UpdateClienteInput } from "./clientes.schema";

export function listClientes(q?: string) {
  return prisma.cliente.findMany({
    where: q
      ? {
          OR: [
            { nome: { contains: q } },
            { telefone: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { nome: "asc" },
  });
}

export async function getCliente(id: number) {
  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente) throw new ApiError(404, "Cliente não encontrado");
  return cliente;
}

export function createCliente(input: CreateClienteInput) {
  return prisma.cliente.create({
    data: {
      nome: input.nome,
      telefone: input.telefone,
      email: input.email || null,
      endereco: input.endereco,
      cpfCnpj: input.cpfCnpj,
      observacoes: input.observacoes,
    },
  });
}

export async function updateCliente(id: number, input: UpdateClienteInput) {
  await getCliente(id);
  return prisma.cliente.update({
    where: { id },
    data: {
      nome: input.nome,
      telefone: input.telefone,
      email: input.email || undefined,
      endereco: input.endereco,
      cpfCnpj: input.cpfCnpj,
      observacoes: input.observacoes,
    },
  });
}

export async function deleteCliente(id: number) {
  await getCliente(id);
  await prisma.cliente.delete({ where: { id } });
}

export async function listEquipamentosDoCliente(id: number) {
  await getCliente(id);
  return prisma.equipamento.findMany({
    where: { clienteId: id },
    orderBy: { criadoEm: "desc" },
  });
}

export async function listOrdensDoCliente(id: number) {
  await getCliente(id);
  return prisma.ordemServico.findMany({
    where: { clienteId: id },
    orderBy: { dataAbertura: "desc" },
    include: { equipamento: true },
  });
}
