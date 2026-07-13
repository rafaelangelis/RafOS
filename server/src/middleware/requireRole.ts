import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

type Role = "admin" | "tecnico" | "atendente";

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, "Acesso não permitido para este papel");
    }
    next();
  };
}
