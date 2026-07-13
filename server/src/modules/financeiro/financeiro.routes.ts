import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/requireRole";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  contasAReceberHandler,
  exportHandler,
  recebidoHandler,
} from "./financeiro.controller";
import { periodoQuerySchema } from "./financeiro.schema";

export const financeiroRouter = Router();

financeiroRouter.use(auth, requireRole("admin", "atendente"));

financeiroRouter.get("/contas-a-receber", asyncHandler(contasAReceberHandler));
financeiroRouter.get(
  "/recebido",
  validate({ query: periodoQuerySchema }),
  asyncHandler(recebidoHandler)
);
financeiroRouter.get(
  "/export",
  validate({ query: periodoQuerySchema }),
  asyncHandler(exportHandler)
);
