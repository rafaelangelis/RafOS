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
import {
  createHandler as createItemHandler,
  deleteHandler as deleteItemHandler,
  listHandler as listItensHandler,
} from "./itens.controller";
import { criarItemSchema, listItensQuerySchema } from "./itens.schema";
import {
  createHandler as createPagamentoHandler,
  deleteHandler as deletePagamentoHandler,
  listHandler as listPagamentosHandler,
} from "./pagamentos.controller";
import { criarPagamentoSchema } from "./pagamentos.schema";

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

ordensRouter.get("/:id/pagamentos", asyncHandler(listPagamentosHandler));
ordensRouter.post(
  "/:id/pagamentos",
  requireRole("admin", "atendente"),
  validate({ body: criarPagamentoSchema }),
  asyncHandler(createPagamentoHandler)
);
ordensRouter.delete(
  "/:id/pagamentos/:pagamentoId",
  requireRole("admin"),
  asyncHandler(deletePagamentoHandler)
);

ordensRouter.get(
  "/:id/itens",
  validate({ query: listItensQuerySchema }),
  asyncHandler(listItensHandler)
);
ordensRouter.post(
  "/:id/itens",
  requireRole("admin", "tecnico", "atendente"),
  validate({ body: criarItemSchema }),
  asyncHandler(createItemHandler)
);
ordensRouter.delete(
  "/:id/itens/:itemId",
  requireRole("admin", "tecnico", "atendente"),
  asyncHandler(deleteItemHandler)
);
