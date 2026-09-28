import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/apiError";
import { env } from "../config/env";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // Erros de validação Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Erros conhecidos do Prisma (ex: violação de unicidade, registro não encontrado)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        message: `Já existe um registro com esse valor (${(err.meta?.target as string[])?.join(", ")}).`,
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
  }

  // Erros de negócio conhecidos (lançados propositalmente pelos services)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  // Erros inesperados
  console.error(err);
  return res.status(500).json({
    message: "Erro interno do servidor.",
    stack: env.nodeEnv === "development" && err instanceof Error ? err.stack : undefined,
  });
}
