import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  page: z.string().optional(),
  perPage: z.string().optional(),
  read: z.enum(["true", "false"]).optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid("ID inválido") });
