import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  role: z.enum(["ADMINISTRADOR", "FUNCIONARIO"]).default("FUNCIONARIO"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["ADMINISTRADOR", "FUNCIONARIO"]).optional(),
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
});

export const listUsersQuerySchema = z.object({
  page: z.string().optional(),
  perPage: z.string().optional(),
  search: z.string().optional(),
  role: z.enum(["ADMINISTRADOR", "FUNCIONARIO"]).optional(),
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid("ID inválido") });
