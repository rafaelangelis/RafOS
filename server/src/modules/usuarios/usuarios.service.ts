import bcrypt from "bcrypt";
import { prisma } from "../../db/client";
import { ApiError } from "../../utils/ApiError";
import { CreateUsuarioInput, UpdateUsuarioInput } from "./usuarios.schema";

const publicSelect = {
  id: true,
  nome: true,
  email: true,
  role: true,
  ativo: true,
  criadoEm: true,
} as const;

export function listUsuarios() {
  return prisma.usuario.findMany({
    select: publicSelect,
    orderBy: { nome: "asc" },
  });
}

export async function getUsuario(id: number) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: publicSelect,
  });
  if (!usuario) throw new ApiError(404, "Usuário não encontrado");
  return usuario;
}

export async function createUsuario(input: CreateUsuarioInput) {
  const existing = await prisma.usuario.findUnique({ where: { email: input.email } });
  if (existing) throw new ApiError(409, "Já existe um usuário com este email");

  const senhaHash = await bcrypt.hash(input.senha, 10);
  return prisma.usuario.create({
    data: {
      nome: input.nome,
      email: input.email,
      senhaHash,
      role: input.role,
    },
    select: publicSelect,
  });
}

export async function updateUsuario(id: number, input: UpdateUsuarioInput) {
  await getUsuario(id);

  if (input.email) {
    const existing = await prisma.usuario.findUnique({ where: { email: input.email } });
    if (existing && existing.id !== id) {
      throw new ApiError(409, "Já existe um usuário com este email");
    }
  }

  const senhaHash = input.senha ? await bcrypt.hash(input.senha, 10) : undefined;

  return prisma.usuario.update({
    where: { id },
    data: {
      nome: input.nome,
      email: input.email,
      role: input.role,
      ativo: input.ativo,
      senhaHash,
    },
    select: publicSelect,
  });
}

export async function deactivateUsuario(id: number) {
  await getUsuario(id);
  await prisma.usuario.update({ where: { id }, data: { ativo: false } });
}
