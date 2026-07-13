import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/requireRole";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  changeStatusHandler,
  createHandler,
  deleteHandler,
  getHandler,
  historicoHandler,
  listHandler,
  updateHandler,
} from "./os.controller";
import {
  changeStatusSchema,
  createOrdemSchema,
  listOrdensQuerySchema,
  updateOrdemSchema,
} from "./os.schema";

export const ordensRouter = Router();

ordensRouter.use(auth);

ordensRouter.get("/", validate({ query: listOrdensQuerySchema }), asyncHandler(listHandler));
ordensRouter.post(
  "/",
  requireRole("admin", "atendente"),
  validate({ body: createOrdemSchema }),
  asyncHandler(createHandler)
);
ordensRouter.get("/:id", asyncHandler(getHandler));
ordensRouter.get("/:id/historico", asyncHandler(historicoHandler));
ordensRouter.patch(
  "/:id",
  requireRole("admin", "tecnico", "atendente"),
  validate({ body: updateOrdemSchema }),
  asyncHandler(updateHandler)
);
ordensRouter.patch(
  "/:id/status",
  requireRole("admin", "tecnico"),
  validate({ body: changeStatusSchema }),
  asyncHandler(changeStatusHandler)
);
ordensRouter.delete("/:id", requireRole("admin"), asyncHandler(deleteHandler));
