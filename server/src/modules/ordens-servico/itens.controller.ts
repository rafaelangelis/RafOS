import { Request, Response } from "express";
import * as itensService from "./itens.service";

export async function listHandler(req: Request, res: Response) {
  const tipo = req.query.tipo as "peca" | "servico" | undefined;
  res.json(await itensService.listItens(Number(req.params.id), tipo));
}

export async function createHandler(req: Request, res: Response) {
  res.status(201).json(await itensService.criarItem(Number(req.params.id), req.body));
}

export async function deleteHandler(req: Request, res: Response) {
  await itensService.deletarItem(Number(req.params.id), Number(req.params.itemId));
  res.status(204).send();
}
