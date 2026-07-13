import { Request, Response } from "express";
import * as pagamentosService from "./pagamentos.service";

export async function listHandler(req: Request, res: Response) {
  res.json(await pagamentosService.listPagamentos(Number(req.params.id)));
}

export async function createHandler(req: Request, res: Response) {
  res
    .status(201)
    .json(await pagamentosService.registrarPagamento(Number(req.params.id), req.body, req.user!.id));
}

export async function deleteHandler(req: Request, res: Response) {
  await pagamentosService.deletePagamento(Number(req.params.id), Number(req.params.pagamentoId));
  res.status(204).send();
}
