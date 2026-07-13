import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

interface JwtPayload {
  sub: number;
  role: "admin" | "tecnico" | "atendente";
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Token não fornecido");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as unknown as JwtPayload;
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw new ApiError(401, "Token inválido ou expirado");
  }
}
