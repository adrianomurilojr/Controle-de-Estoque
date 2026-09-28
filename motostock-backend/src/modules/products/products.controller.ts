import { Request, Response } from "express";
import { productsService } from "./products.service";

export const productsController = {
  async list(req: Request, res: Response) {
    res.json(await productsService.list(req.query as any));
  },
  async getById(req: Request, res: Response) {
    res.json(await productsService.getById(req.params.id));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await productsService.create(req.body));
  },
  async update(req: Request, res: Response) {
    res.json(await productsService.update(req.params.id, req.body));
  },
  async remove(req: Request, res: Response) {
    await productsService.remove(req.params.id);
    res.status(204).send();
  },
  async lowStock(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    res.json(await productsService.lowStock(limit));
  },
  async brands(req: Request, res: Response) {
    res.json(await productsService.listBrands());
  },
  async generateSku(req: Request, res: Response) {
    const { categoryId, brand } = req.query as { categoryId: string; brand?: string };
    res.json(await productsService.generateSku(categoryId, brand));
  },
};
