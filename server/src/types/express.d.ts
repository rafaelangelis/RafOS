import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: "admin" | "tecnico" | "atendente";
      };
    }
  }
}
