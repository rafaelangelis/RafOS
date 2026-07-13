import { Router } from "express";
import { auth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { loginHandler, meHandler } from "./auth.controller";
import { loginSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post(
  "/login",
  validate({ body: loginSchema }),
  asyncHandler(loginHandler)
);

authRouter.get("/me", auth, asyncHandler(meHandler));
