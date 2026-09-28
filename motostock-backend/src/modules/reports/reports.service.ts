import { prisma } from "../../lib/prisma";
import { computeStockStatus } from "../products/products.service";

interface PeriodQuery {
  dateFrom?: string;
  dateTo?: string;
}

function dateRangeWhere(query: PeriodQuery) {
  return {
    ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
    ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
  };
}

export const reportsService = {
  async stockReport() {
    const products = await prisma.product.findMany({
      include: { category: true, supplier: true },
      orderBy: { name: "asc" },
    });
    return products.map((p) => ({
      ...p,
      stockStatus: computeStockStatus(p.currentStock, p.minStock),
      stockValue: Number((p.currentStock * Number(p.costPrice)).toFixed(2)),
    }));
  },

  async lowStockReport() {
    const products = await this.stockReport();
    return products.filter((p) => p.stockStatus === "BAIXO");
  },

  async outOfStockReport() {
    const products = await this.stockReport();
    return products.filter((p) => p.stockStatus === "SEM_ESTOQUE");
  },

  async entriesReport(query: PeriodQuery) {
    const dateFilter = dateRangeWhere(query);
    return prisma.stockOperation.findMany({
      where: { type: "ENTRADA", ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}) },
      include: { items: { include: { product: true } }, supplier: true, user: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async exitsReport(query: PeriodQuery) {
    const dateFilter = dateRangeWhere(query);
    return prisma.stockOperation.findMany({
      where: { type: "SAIDA", ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}) },
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async movementsReport(query: PeriodQuery) {
    const dateFilter = dateRangeWhere(query);
    return prisma.stockMovement.findMany({
      where: Object.keys(dateFilter).length ? { createdAt: dateFilter } : {},
      include: { product: true, user: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async stockValue() {
    const products = await prisma.product.findMany();
    const totalCost = products.reduce((sum, p) => sum + p.currentStock * Number(p.costPrice), 0);
    const totalSale = products.reduce((sum, p) => sum + p.currentStock * Number(p.salePrice), 0);
    return {
      totalCostValue: Number(totalCost.toFixed(2)),
      totalSaleValue: Number(totalSale.toFixed(2)),
      potentialProfit: Number((totalSale - totalCost).toFixed(2)),
    };
  },

  async stockValueByCategory() {
    const categories = await prisma.category.findMany({ include: { products: true } });
    return categories.map((c) => ({
      categoryId: c.id,
      categoryName: c.name,
      totalItems: c.products.reduce((sum, p) => sum + p.currentStock, 0),
      stockValue: Number(
        c.products.reduce((sum, p) => sum + p.currentStock * Number(p.costPrice), 0).toFixed(2)
      ),
    }));
  },

  async topMovedProducts(query: PeriodQuery & { limit?: number }) {
    const dateFilter = dateRangeWhere(query);
    const movements = await prisma.stockMovement.findMany({
      where: Object.keys(dateFilter).length ? { createdAt: dateFilter } : {},
      include: { product: true },
    });

    const grouped = new Map<string, { productId: string; name: string; sku: string; totalQuantity: number }>();
    for (const m of movements) {
      const key = m.productId;
      if (!grouped.has(key)) {
        grouped.set(key, { productId: key, name: m.product.name, sku: m.product.sku, totalQuantity: 0 });
      }
      grouped.get(key)!.totalQuantity += m.quantity;
    }

    return Array.from(grouped.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, query.limit ?? 10);
  },
};
