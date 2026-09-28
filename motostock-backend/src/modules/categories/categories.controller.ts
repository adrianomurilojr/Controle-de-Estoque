import { Request, Response } from "express";
import { categoriesService } from "./categories.service";

export const categoriesController = {
  async list(req: Request, res: Response) {
    res.json(await categoriesService.list(req.query as any));
  },
  async getById(req: Request, res: Response) {
    res.json(await categoriesService.getById(req.params.id));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await categoriesService.create(req.body));
  },
  async update(req: Request, res: Response) {
    res.json(await categoriesService.update(req.params.id, req.body));
  },
  async remove(req: Request, res: Response) {
    await categoriesService.remove(req.params.id);
    res.status(204).send();
  },
};
