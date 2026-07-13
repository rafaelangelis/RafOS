import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/requireRole";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { getHandler, updateHandler } from "./equipamentos.controller";
import { updateEquipamentoSchema } from "./equipamentos.schema";

export const equipamentosRouter = Router();

equipamentosRouter.use(auth);

equipamentosRouter.get("/:id", asyncHandler(getHandler));
equipamentosRouter.patch(
  "/:id",
  requireRole("admin", "atendente"),
  validate({ body: updateEquipamentoSchema }),
  asyncHandler(updateHandler)
);
