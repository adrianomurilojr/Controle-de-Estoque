import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/apiError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { LoginInput } from "./auth.schema";

function sanitizeUser(user: { passwordHash: string; [key: string]: unknown }) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export const authService = {
  async login({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.status === "INATIVO") {
      throw ApiError.unauthorized("E-mail ou senha inválidos.");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw ApiError.unauthorized("E-mail ou senha inválidos.");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastAccessAt: new Date() },
    });

    const tokenPayload = { sub: user.id, role: user.role, name: user.name, email: user.email };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ sub: user.id });

    return { user: sanitizeUser(user), accessToken, refreshToken };
  },

  async refresh(refreshToken: string) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Refresh token inválido ou expirado.");
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user || user.status === "INATIVO") {
      throw ApiError.unauthorized("Usuário não encontrado ou inativo.");
    }

    const tokenPayload = { sub: user.id, role: user.role, name: user.name, email: user.email };
    const accessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken({ sub: user.id });

    return { accessToken, refreshToken: newRefreshToken };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound("Usuário não encontrado.");
    return sanitizeUser(user);
  },
};
