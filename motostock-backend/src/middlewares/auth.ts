import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { verifyAccessToken } from "../utils/jwt";

// Garante que a requisição possui um token JWT válido no header Authorization
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Token de acesso não informado.");
  }

  const token = header.replace("Bearer ", "");

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    throw ApiError.unauthorized("Token inválido ou expirado.");
  }
}

// Restringe o acesso a determinados papéis (ex: apenas ADMINISTRADOR)
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden("Você não tem permissão para executar esta ação.");
    }
    next();
  };
}
