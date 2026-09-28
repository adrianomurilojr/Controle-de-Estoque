import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

// Evita múltiplas instâncias do PrismaClient em hot-reload durante o desenvolvimento
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    log: env.nodeEnv === "development" ? ["warn", "error"] : ["error"],
  });

if (env.nodeEnv !== "production") {
  global.__prisma__ = prisma;
}
