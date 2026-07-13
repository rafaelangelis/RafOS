import { Request, Response } from "express";
import * as categoriasFinanceirasService from "./categoriasFinanceiras.service";

export async function listHandler(req: Request, res: Response) {
  res.json(await categoriasFinanceirasService.listCategoriasFinanceiras());
}

export async function createHandler(req: Request, res: Response) {
  res.status(201).json(await categoriasFinanceirasService.createCategoriaFinanceira(req.body));
}
