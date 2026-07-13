import { Router } from "express";
import { auth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { resumoHandler } from "./dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.get("/resumo", auth, asyncHandler(resumoHandler));
