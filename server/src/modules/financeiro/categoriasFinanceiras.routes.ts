import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/requireRole";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { createHandler, listHandler } from "./categoriasFinanceiras.controller";
import { createCategoriaFinanceiraSchema } from "./categoriasFinanceiras.schema";

export const categoriasFinanceirasRouter = Router();

categoriasFinanceirasRouter.use(auth);

categoriasFinanceirasRouter.get("/", asyncHandler(listHandler));
categoriasFinanceirasRouter.post(
  "/",
  requireRole("admin", "atendente"),
  validate({ body: createCategoriaFinanceiraSchema }),
  asyncHandler(createHandler)
);
