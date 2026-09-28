import { z } from "zod";

export const reportPeriodQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
