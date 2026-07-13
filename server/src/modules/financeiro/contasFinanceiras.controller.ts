import { Request, Response } from "express";
import * as contasFinanceirasService from "./contasFinanceiras.service";

export async function listHandler(req: Request, res: Response) {
  res.json(await contasFinanceirasService.listContasFinanceiras());
}

export async function createHandler(req: Request, res: Response) {
  res.status(201).json(await contasFinanceirasService.createContaFinanceira(req.body));
}
