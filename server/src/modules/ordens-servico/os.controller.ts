import { Request, Response } from "express";
import * as osService from "./os.service";

export async function listHandler(req: Request, res: Response) {
  const { status, clienteId, tecnicoId } = req.query as {
    status?: string;
    clienteId?: string;
    tecnicoId?: string;
  };
  res.json(
    await osService.listOrdens({
      status,
      clienteId: clienteId ? Number(clienteId) : undefined,
      tecnicoId: tecnicoId ? Number(tecnicoId) : undefined,
    })
  );
}

export async function getHandler(req: Request, res: Response) {
  res.json(await osService.getOrdem(Number(req.params.id)));
}

export async function historicoHandler(req: Request, res: Response) {
  res.json(await osService.getHistorico(Number(req.params.id)));
}

export async function createHandler(req: Request, res: Response) {
  res.status(201).json(await osService.createOrdem(req.body, req.user!.id));
}

export async function updateHandler(req: Request, res: Response) {
  res.json(await osService.updateOrdem(Number(req.params.id), req.body));
}

export async function changeStatusHandler(req: Request, res: Response) {
  res.json(await osService.changeStatus(Number(req.params.id), req.body, req.user!.id));
}

export async function deleteHandler(req: Request, res: Response) {
  await osService.deleteOrdem(Number(req.params.id));
  res.status(204).send();
}
