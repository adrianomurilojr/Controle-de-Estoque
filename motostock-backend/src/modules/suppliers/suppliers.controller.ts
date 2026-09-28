import { Request, Response } from "express";
import { suppliersService } from "./suppliers.service";

export const suppliersController = {
  async list(req: Request, res: Response) {
    res.json(await suppliersService.list(req.query as any));
  },
  async getById(req: Request, res: Response) {
    res.json(await suppliersService.getById(req.params.id));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await suppliersService.create(req.body));
  },
  async update(req: Request, res: Response) {
    res.json(await suppliersService.update(req.params.id, req.body));
  },
  async remove(req: Request, res: Response) {
    await suppliersService.remove(req.params.id);
    res.status(204).send();
  },
};
