import { prisma } from "../../lib/prisma";
import { buildPaginatedResponse, parsePagination } from "../../utils/pagination";

type NotificationType =
  | "ESTOQUE_BAIXO"
  | "SEM_ESTOQUE"
  | "ENTRADA_REGISTRADA"
  | "SAIDA_REGISTRADA"
  | "AJUSTE_ESTOQUE"
  | "SISTEMA";

export const notificationsService = {
  // userId omitido = notificação global, visível a todos os usuários
  async create(data: { type: NotificationType; message: string; userId?: string }) {
    return prisma.notification.create({ data });
  },

  async list(userId: string, query: { page?: string; perPage?: string; read?: string }) {
    const { skip, take, page, perPage } = parsePagination(query);

    const where = {
      AND: [
        { OR: [{ userId }, { userId: null }] },
        query.read !== undefined ? { read: query.read === "true" } : {},
      ],
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.notification.count({ where }),
    ]);

    return buildPaginatedResponse(notifications, total, page, perPage);
  },

  async unreadCount(userId: string) {
    return prisma.notification.count({
      where: { AND: [{ OR: [{ userId }, { userId: null }] }, { read: false }] },
    });
  },

  async markAsRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { OR: [{ userId }, { userId: null }], read: false },
      data: { read: true },
    });
  },
};
