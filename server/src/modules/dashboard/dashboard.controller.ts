import { Request, Response } from "express";
import * as dashboardService from "./dashboard.service";

export async function resumoHandler(req: Request, res: Response) {
  res.json(await dashboardService.getResumo());
}
