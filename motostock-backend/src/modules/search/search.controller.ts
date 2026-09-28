import { Request, Response } from "express";
import { searchService } from "./search.service";

export const searchController = {
  async search(req: Request, res: Response) {
    const term = (req.query.q as string) ?? "";
    res.json(await searchService.globalSearch(term));
  },
};
