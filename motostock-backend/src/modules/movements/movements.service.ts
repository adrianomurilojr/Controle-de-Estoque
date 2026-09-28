import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/apiError";
import { buildPaginatedResponse, parsePagination } from "../../utils/pagination";
import { notificationsService } from "../notifications/notifications.service";

interface EntryInput {
  supplierId?: string;
  invoiceNumber?: string;
  referenceCode?: string;
  observation?: string;
  items: { productId: string; quantity: number; unitCost?: number }[];
}

interface ExitInput {
  reason: "VENDA" | "PERDA" | "AVARIA" | "USO_INTERNO" | "OUTRO";
  referenceCode?: string;
  observation?: string;
  items: { productId: string; quantity: number }[];
}

interface AdjustmentInput {
  observation?: string;
  items: { productId: string; newStock: number }[];
}

async function fetchProductsMap(productIds: string[]) {
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== new Set(productIds).size) {
    throw ApiError.badRequest("Um ou mais produtos informados não foram encontrados.");
  }
  return new Map(products.map((p) => [p.id, p]));
}

export const movementsService = {
  async createEntry(userId: string, input: EntryInput) {
    const productsMap = await fetchProductsMap(input.items.map((i) => i.productId));

    return prisma.$transaction(async (tx) => {
      let totalValue = 0;
      const totalItems = input.items.reduce((sum, i) => sum + i.quantity, 0);

      const operation = await tx.stockOperation.create({
        data: {
          type: "ENTRADA",
          supplierId: input.supplierId,
          invoiceNumber: input.invoiceNumber,
          referenceCode: input.referenceCode,
          observation: input.observation,
          userId,
          totalItems,
          totalValue: 0,
        },
      });

      for (const item of input.items) {
        const product = productsMap.get(item.productId)!;
        const previousStock = product.currentStock;
        const newStock = previousStock + item.quantity;
        const unitCost = item.unitCost ?? Number(product.costPrice);
        totalValue += unitCost * item.quantity;

        await tx.product.update({ where: { id: product.id }, data: { currentStock: newStock } });

        await tx.stockOperationItem.create({
          data: {
            operationId: operation.id,
            productId: product.id,
            quantity: item.quantity,
            unitPrice: unitCost,
            previousStock,
            newStock,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            operationId: operation.id,
            type: "ENTRADA",
            quantity: item.quantity,
            previousStock,
            newStock,
            observation: input.observation,
            userId,
          },
        });
      }

      await tx.stockOperation.update({ where: { id: operation.id }, data: { totalValue } });

      await notificationsService.create({
        type: "ENTRADA_REGISTRADA",
        message: `Entrada de ${totalItems} produto(s) registrada.`,
      });

      return tx.stockOperation.findUnique({
        where: { id: operation.id },
        include: { items: { include: { product: true } }, supplier: true, user: true },
      });
    });
  },

  async createExit(userId: string, input: ExitInput) {
    const productsMap = await fetchProductsMap(input.items.map((i) => i.productId));

    // Valida disponibilidade de estoque de todos os itens antes de aplicar qualquer alteração
    for (const item of input.items) {
      const product = productsMap.get(item.productId)!;
      if (item.quantity > product.currentStock) {
        throw ApiError.badRequest(
          `Quantidade solicitada para "${product.name}" (${item.quantity}) é maior que o estoque disponível (${product.currentStock}).`
        );
      }
    }

    return prisma.$transaction(async (tx) => {
      const totalItems = input.items.reduce((sum, i) => sum + i.quantity, 0);

      const operation = await tx.stockOperation.create({
        data: {
          type: "SAIDA",
          reason: input.reason,
          referenceCode: input.referenceCode,
          observation: input.observation,
          userId,
          totalItems,
          totalValue: 0,
        },
      });

      let totalValue = 0;

      for (const item of input.items) {
        const product = productsMap.get(item.productId)!;
        const previousStock = product.currentStock;
        const newStock = previousStock - item.quantity;
        totalValue += Number(product.salePrice) * item.quantity;

        await tx.product.update({ where: { id: product.id }, data: { currentStock: newStock } });

        await tx.stockOperationItem.create({
          data: {
            operationId: operation.id,
            productId: product.id,
            quantity: item.quantity,
            unitPrice: product.salePrice,
            previousStock,
            newStock,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            operationId: operation.id,
            type: "SAIDA",
            quantity: item.quantity,
            previousStock,
            newStock,
            reason: input.reason,
            observation: input.observation,
            userId,
          },
        });

        if (newStock <= 0) {
          await notificationsService.create({
            type: "SEM_ESTOQUE",
            message: `${product.name} está sem estoque.`,
          });
        } else if (newStock <= product.minStock) {
          await notificationsService.create({
            type: "ESTOQUE_BAIXO",
            message: `${product.name} está com estoque baixo.`,
          });
        }
      }

      await tx.stockOperation.update({ where: { id: operation.id }, data: { totalValue } });

      return tx.stockOperation.findUnique({
        where: { id: operation.id },
        include: { items: { include: { product: true } }, user: true },
      });
    });
  },

  async createAdjustment(userId: string, input: AdjustmentInput) {
    const productsMap = await fetchProductsMap(input.items.map((i) => i.productId));

    return prisma.$transaction(async (tx) => {
      const operation = await tx.stockOperation.create({
        data: {
          type: "AJUSTE",
          observation: input.observation,
          userId,
          totalItems: input.items.length,
          totalValue: 0,
        },
      });

      for (const item of input.items) {
        const product = productsMap.get(item.productId)!;
        const previousStock = product.currentStock;
        const newStock = item.newStock;
        const quantity = Math.abs(newStock - previousStock);

        await tx.product.update({ where: { id: product.id }, data: { currentStock: newStock } });

        await tx.stockOperationItem.create({
          data: {
            operationId: operation.id,
            productId: product.id,
            quantity,
            unitPrice: product.costPrice,
            previousStock,
            newStock,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            operationId: operation.id,
            type: "AJUSTE",
            quantity,
            previousStock,
            newStock,
            observation: input.observation,
            userId,
          },
        });
      }

      await notificationsService.create({
        type: "AJUSTE_ESTOQUE",
        message: "Estoque ajustado manualmente.",
      });

      return tx.stockOperation.findUnique({
        where: { id: operation.id },
        include: { items: { include: { product: true } }, user: true },
      });
    });
  },

  async list(query: {
    page?: string;
    perPage?: string;
    dateFrom?: string;
    dateTo?: string;
    productId?: string;
    type?: "ENTRADA" | "SAIDA" | "AJUSTE";
    userId?: string;
  }) {
    const { skip, take, page, perPage } = parsePagination(query);

    const where = {
      AND: [
        query.productId ? { productId: query.productId } : {},
        query.type ? { type: query.type } : {},
        query.userId ? { userId: query.userId } : {},
        query.dateFrom ? { createdAt: { gte: new Date(query.dateFrom) } } : {},
        query.dateTo ? { createdAt: { lte: new Date(query.dateTo) } } : {},
      ],
    };

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true, avatarUrl: true } },
          operation: { select: { invoiceNumber: true, referenceCode: true } },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return buildPaginatedResponse(movements, total, page, perPage);
  },

  async recent(limit = 10) {
    return prisma.stockMovement.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        user: { select: { id: true, name: true, avatarUrl: true } },
        operation: { select: { invoiceNumber: true, referenceCode: true } },
      },
    });
  },
};
