import { Request, Response } from "express";
import { authService } from "./auth.service";

export const authController = {
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.json(result);
  },

  async refresh(req: Request, res: Response) {
    const result = await authService.refresh(req.body.refreshToken);
    res.json(result);
  },

  async me(req: Request, res: Response) {
    const user = await authService.me(req.user!.sub);
    res.json(user);
  },

  async logout(req: Request, res: Response) {
    // Com JWT stateless, o logout é tratado no cliente (descartar tokens).
    // Endpoint mantido para simetria com o front-end e para futura blacklist de tokens.
    res.status(204).send();
  },
};
