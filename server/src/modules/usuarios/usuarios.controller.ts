import { Request, Response } from "express";
import * as usuariosService from "./usuarios.service";

export async function listHandler(req: Request, res: Response) {
  res.json(await usuariosService.listUsuarios());
}

export async function listTecnicosHandler(req: Request, res: Response) {
  res.json(await usuariosService.listTecnicos());
}

export async function getHandler(req: Request, res: Response) {
  res.json(await usuariosService.getUsuario(Number(req.params.id)));
}

export async function createHandler(req: Request, res: Response) {
  res.status(201).json(await usuariosService.createUsuario(req.body));
}

export async function updateHandler(req: Request, res: Response) {
  res.json(await usuariosService.updateUsuario(Number(req.params.id), req.body));
}

export async function deactivateHandler(req: Request, res: Response) {
  await usuariosService.deactivateUsuario(Number(req.params.id));
  res.status(204).send();
}
