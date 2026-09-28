import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório"),
});

export type LoginInput = z.infer<typeof loginSchema>;
