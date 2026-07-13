import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/requireRole";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createHandler,
  deleteHandler,
  equipamentosHandler,
  getHandler,
  listHandler,
  ordensHandler,
  updateHandler,
} from "./clientes.controller";
import { createClienteSchema, updateClienteSchema } from "./clientes.schema";

export const clientesRouter = Router();

clientesRouter.use(auth);

clientesRouter.get("/", asyncHandler(listHandler));
clientesRouter.post(
  "/",
  requireRole("admin", "atendente"),
  validate({ body: createClienteSchema }),
  asyncHandler(createHandler)
);
clientesRouter.get("/:id", asyncHandler(getHandler));
clientesRouter.patch(
  "/:id",
  requireRole("admin", "atendente"),
  validate({ body: updateClienteSchema }),
  asyncHandler(updateHandler)
);
clientesRouter.delete("/:id", requireRole("admin"), asyncHandler(deleteHandler));
clientesRouter.get("/:id/equipamentos", asyncHandler(equipamentosHandler));
clientesRouter.get("/:id/ordens", asyncHandler(ordensHandler));
