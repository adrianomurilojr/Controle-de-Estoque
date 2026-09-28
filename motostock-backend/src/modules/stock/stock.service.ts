import { prisma } from "../../lib/prisma";
import { buildPaginatedResponse, parsePagination } from "../../utils/pagination";
import { computeStockStatus } from "../products/products.service";

interface StockOverviewQuery {
  page?: string;
  perPage?: string;
  categoryId?: string;
  brand?: string;
  location?: string;
  stockStatus?: "NORMAL" | "BAIXO" | "SEM_ESTOQUE";
}

export const stockService = {
  async summary() {
    const products = await prisma.product.findMany({ where: { status: "ATIVO" } });

    const totalItems = products.reduce((sum, p) => sum + p.currentStock, 0);
    const totalValue = products.reduce((sum, p) => sum + p.currentStock * Number(p.costPrice), 0);
    const lowStock = products.filter((p) => computeStockStatus(p.currentStock, p.minStock) === "BAIXO").length;
    const outOfStock = products.filter((p) => p.currentStock <= 0).length;

    return {
      totalProducts: products.length,
      totalItems,
      totalValue: Number(totalValue.toFixed(2)),
      lowStock,
      outOfStock,
    };
  },

  async overview(query: StockOverviewQuery) {
    const { skip, take, page, perPage } = parsePagination(query);

    const where = {
      AND: [
        query.categoryId ? { categoryId: query.categoryId } : {},
        query.brand ? { brand: { equals: query.brand, mode: "insensitive" as const } } : {},
        query.location ? { location: { contains: query.location, mode: "insensitive" as const } } : {},
      ],
    };

    const all = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
    });

    let withStatus = all.map((p) => ({ ...p, stockStatus: computeStockStatus(p.currentStock, p.minStock) }));

    if (query.stockStatus) {
      withStatus = withStatus.filter((p) => p.stockStatus === query.stockStatus);
    }

    const paginated = withStatus.slice(skip, skip + take);
    return buildPaginatedResponse(paginated, withStatus.length, page, perPage);
  },
};
