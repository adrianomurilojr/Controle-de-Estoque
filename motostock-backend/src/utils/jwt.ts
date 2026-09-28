import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface TokenPayload {
  sub: string; // id do usuário
  role: string;
  name: string;
  email: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn as jwt.SignOptions["expiresIn"] });
}

export function signRefreshToken(payload: Pick<TokenPayload, "sub">): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwt.secret) as TokenPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwt.refreshSecret) as { sub: string };
}
