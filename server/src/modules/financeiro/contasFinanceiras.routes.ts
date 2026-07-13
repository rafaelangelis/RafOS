import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/requireRole";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { createHandler, listHandler } from "./contasFinanceiras.controller";
import { createContaFinanceiraSchema } from "./contasFinanceiras.schema";

export const contasFinanceirasRouter = Router();

contasFinanceirasRouter.use(auth);

contasFinanceirasRouter.get("/", asyncHandler(listHandler));
contasFinanceirasRouter.post(
  "/",
  requireRole("admin", "atendente"),
  validate({ body: createContaFinanceiraSchema }),
  asyncHandler(createHandler)
);
