import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/requireRole";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createHandler,
  deactivateHandler,
  getHandler,
  listHandler,
  updateHandler,
} from "./usuarios.controller";
import { createUsuarioSchema, updateUsuarioSchema } from "./usuarios.schema";

export const usuariosRouter = Router();

usuariosRouter.use(auth, requireRole("admin"));

usuariosRouter.get("/", asyncHandler(listHandler));
usuariosRouter.post("/", validate({ body: createUsuarioSchema }), asyncHandler(createHandler));
usuariosRouter.get("/:id", asyncHandler(getHandler));
usuariosRouter.patch("/:id", validate({ body: updateUsuarioSchema }), asyncHandler(updateHandler));
usuariosRouter.delete("/:id", asyncHandler(deactivateHandler));
