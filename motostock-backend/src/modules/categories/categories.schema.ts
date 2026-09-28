import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
});

export const listCategoriesQuerySchema = z.object({
  page: z.string().optional(),
  perPage: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid("ID inválido") });
