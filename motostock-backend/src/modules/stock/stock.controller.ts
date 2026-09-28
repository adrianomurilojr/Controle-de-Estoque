import { Request, Response } from "express";
import { stockService } from "./stock.service";

export const stockController = {
  async summary(req: Request, res: Response) {
    res.json(await stockService.summary());
  },
  async overview(req: Request, res: Response) {
    res.json(await stockService.overview(req.query as any));
  },
};
