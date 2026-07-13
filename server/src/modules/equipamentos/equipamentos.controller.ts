import { Request, Response } from "express";
import * as equipamentosService from "./equipamentos.service";

export async function getHandler(req: Request, res: Response) {
  res.json(await equipamentosService.getEquipamento(Number(req.params.id)));
}

export async function updateHandler(req: Request, res: Response) {
  res.json(await equipamentosService.updateEquipamento(Number(req.params.id), req.body));
}
