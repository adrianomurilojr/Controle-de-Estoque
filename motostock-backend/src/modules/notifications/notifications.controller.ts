import { Request, Response } from "express";
import { notificationsService } from "./notifications.service";

export const notificationsController = {
  async list(req: Request, res: Response) {
    res.json(await notificationsService.list(req.user!.sub, req.query as any));
  },
  async unreadCount(req: Request, res: Response) {
    res.json({ count: await notificationsService.unreadCount(req.user!.sub) });
  },
  async markAsRead(req: Request, res: Response) {
    res.json(await notificationsService.markAsRead(req.params.id));
  },
  async markAllAsRead(req: Request, res: Response) {
    await notificationsService.markAllAsRead(req.user!.sub);
    res.status(204).send();
  },
};
