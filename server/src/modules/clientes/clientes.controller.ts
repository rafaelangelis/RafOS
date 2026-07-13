import { Request, Response } from "express";
import * as clientesService from "./clientes.service";

export async function listHandler(req: Request, res: Response) {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  res.json(await clientesService.listClientes(q));
}

export async function getHandler(req: Request, res: Response) {
  res.json(await clientesService.getCliente(Number(req.params.id)));
}

export async function createHandler(req: Request, res: Response) {
  res.status(201).json(await clientesService.createCliente(req.body));
}

export async function updateHandler(req: Request, res: Response) {
  res.json(await clientesService.updateCliente(Number(req.params.id), req.body));
}

export async function deleteHandler(req: Request, res: Response) {
  await clientesService.deleteCliente(Number(req.params.id));
  res.status(204).send();
}

export async function equipamentosHandler(req: Request, res: Response) {
  res.json(await clientesService.listEquipamentosDoCliente(Number(req.params.id)));
}

export async function ordensHandler(req: Request, res: Response) {
  res.json(await clientesService.listOrdensDoCliente(Number(req.params.id)));
}
