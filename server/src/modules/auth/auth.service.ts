import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../db/client";
import { ApiError } from "../../utils/ApiError";
import { LoginInput } from "./auth.schema";

export async function login({ email, senha }: LoginInput) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario || !usuario.ativo) {
    throw new ApiError(401, "Credenciais inválidas");
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaValida) {
    throw new ApiError(401, "Credenciais inválidas");
  }

  const token = jwt.sign({ sub: usuario.id, role: usuario.role }, env.JWT_SECRET, {
    expiresIn: "12h",
  });

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    },
  };
}

export async function me(usuarioId: number) {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) {
    throw new ApiError(404, "Usuário não encontrado");
  }
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
  };
}
