import { Request, Response } from "express";
import { dashboardService } from "./dashboard.service";

export const dashboardController = {
  async stats(req: Request, res: Response) {
    res.json(await dashboardService.stats());
  },
  async movementsChart(req: Request, res: Response) {
    const period = (req.query.period as any) ?? "30d";
    res.json(await dashboardService.movementsChart(period));
  },
  async lowStock(req: Request, res: Response) {
    res.json(await dashboardService.lowStockTable(Number(req.query.limit) || 10));
  },
  async recentMovements(req: Request, res: Response) {
    res.json(await dashboardService.recentMovements(Number(req.query.limit) || 10));
  },
  async stockValueByCategory(req: Request, res: Response) {
    res.json(await dashboardService.stockValueByCategory());
  },
};
