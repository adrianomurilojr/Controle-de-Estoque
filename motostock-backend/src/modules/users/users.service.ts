import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/apiError";
import { buildPaginatedResponse, parsePagination } from "../../utils/pagination";

function sanitize(user: { passwordHash: string; [key: string]: unknown }) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export const usersService = {
  async list(query: { page?: string; perPage?: string; search?: string; role?: string; status?: string }) {
    const { skip, take, page, perPage } = parsePagination(query);

    const where = {
      AND: [
        query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: "insensitive" as const } },
                { email: { contains: query.search, mode: "insensitive" as const } },
              ],
            }
          : {},
        query.role ? { role: query.role as any } : {},
        query.status ? { status: query.status as any } : {},
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take, orderBy: { name: "asc" } }),
      prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(users.map(sanitize), total, page, perPage);
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw ApiError.notFound("Usuário não encontrado.");
    return sanitize(user);
  },

  async create(data: { name: string; email: string; password: string; role: "ADMINISTRADOR" | "FUNCIONARIO" }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw ApiError.conflict("Já existe um usuário com este e-mail.");

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, passwordHash, role: data.role },
    });
    return sanitize(user);
  },

  async update(
    id: string,
    data: { name?: string; email?: string; password?: string; role?: "ADMINISTRADOR" | "FUNCIONARIO"; status?: "ATIVO" | "INATIVO" }
  ) {
    await this.getById(id);

    const updateData: Record<string, unknown> = { ...data };
    delete updateData.password;

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({ where: { id }, data: updateData });
    return sanitize(user);
  },

  async remove(id: string) {
    await this.getById(id);
    // Inativação lógica em vez de exclusão física, para preservar histórico de movimentações
    await prisma.user.update({ where: { id }, data: { status: "INATIVO" } });
  },
};
