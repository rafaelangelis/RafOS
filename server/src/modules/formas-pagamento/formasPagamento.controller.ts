import { Request, Response } from "express";
import * as formasPagamentoService from "./formasPagamento.service";

export async function listHandler(req: Request, res: Response) {
  res.json(await formasPagamentoService.listFormasPagamento());
}

export async function createHandler(req: Request, res: Response) {
  res.status(201).json(await formasPagamentoService.createFormaPagamento(req.body));
}
