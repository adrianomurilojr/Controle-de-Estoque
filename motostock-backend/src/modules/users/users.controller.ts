import { Request, Response } from "express";
import { usersService } from "./users.service";

export const usersController = {
  async list(req: Request, res: Response) {
    res.json(await usersService.list(req.query as any));
  },
  async getById(req: Request, res: Response) {
    res.json(await usersService.getById(req.params.id));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await usersService.create(req.body));
  },
  async update(req: Request, res: Response) {
    res.json(await usersService.update(req.params.id, req.body));
  },
  async remove(req: Request, res: Response) {
    await usersService.remove(req.params.id);
    res.status(204).send();
  },
};
