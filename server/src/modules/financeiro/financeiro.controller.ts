import { Request, Response } from "express";
import * as financeiroService from "./financeiro.service";

export async function contasAReceberHandler(req: Request, res: Response) {
  res.json(await financeiroService.listContasAReceber());
}

export async function parcelasEmAbertoHandler(req: Request, res: Response) {
  res.json(await financeiroService.listParcelasEmAberto());
}

export async function saldoPorContaHandler(req: Request, res: Response) {
  res.json(await financeiroService.listSaldoPorConta());
}

export async function recebidoHandler(req: Request, res: Response) {
  const { inicio, fim } = req.query as { inicio: string; fim: string };
  res.json(await financeiroService.getRecebidoPeriodo(inicio, fim));
}

export async function exportHandler(req: Request, res: Response) {
  const { inicio, fim } = req.query as { inicio: string; fim: string };
  const csv = await financeiroService.exportarCsv(inicio, fim);
  res.type("text/csv").attachment(`recebimentos_${inicio}_a_${fim}.csv`).send(csv);
}
