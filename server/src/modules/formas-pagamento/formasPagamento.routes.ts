import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/requireRole";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { createHandler, listHandler } from "./formasPagamento.controller";
import { createFormaPagamentoSchema } from "./formasPagamento.schema";

export const formasPagamentoRouter = Router();

formasPagamentoRouter.use(auth);

formasPagamentoRouter.get("/", asyncHandler(listHandler));
formasPagamentoRouter.post(
  "/",
  requireRole("admin", "atendente"),
  validate({ body: createFormaPagamentoSchema }),
  asyncHandler(createHandler)
);
