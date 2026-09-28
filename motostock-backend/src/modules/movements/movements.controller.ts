import { Request, Response } from "express";
import { movementsService } from "./movements.service";

export const movementsController = {
  async createEntry(req: Request, res: Response) {
    res.status(201).json(await movementsService.createEntry(req.user!.sub, req.body));
  },
  async createExit(req: Request, res: Response) {
    res.status(201).json(await movementsService.createExit(req.user!.sub, req.body));
  },
  async createAdjustment(req: Request, res: Response) {
    res.status(201).json(await movementsService.createAdjustment(req.user!.sub, req.body));
  },
  async list(req: Request, res: Response) {
    res.json(await movementsService.list(req.query as any));
  },
  async recent(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    res.json(await movementsService.recent(limit));
  },
};
