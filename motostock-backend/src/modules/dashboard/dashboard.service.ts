import { prisma } from "../../lib/prisma";
import { stockService } from "../stock/stock.service";
import { productsService } from "../products/products.service";
import { movementsService } from "../movements/movements.service";
import { reportsService } from "../reports/reports.service";

type Period = "7d" | "30d" | "90d" | "1y";

function periodToDate(period: Period): Date {
  const now = new Date();
  const days = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }[period];
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date;
}

export const dashboardService = {
  async stats() {
    const summary = await stockService.summary();
    return {
      totalProducts: summary.totalProducts,
      productsInStock: await prisma.product.count({ where: { currentStock: { gt: 0 }, status: "ATIVO" } }),
      lowStock: summary.lowStock,
      outOfStock: summary.outOfStock,
      stockValue: summary.totalValue,
    };
  },

  async movementsChart(period: Period = "30d") {
    const since = periodToDate(period);
    const movements = await prisma.stockMovement.findMany({
      where: { createdAt: { gte: since }, type: { in: ["ENTRADA", "SAIDA"] } },
      select: { type: true, quantity: true, createdAt: true },
    });

    const grouped = new Map<string, { date: string; entradas: number; saidas: number }>();

    for (const m of movements) {
      const key = m.createdAt.toISOString().slice(0, 10);
      if (!grouped.has(key)) grouped.set(key, { date: key, entradas: 0, saidas: 0 });
      const bucket = grouped.get(key)!;
      if (m.type === "ENTRADA") bucket.entradas += m.quantity;
      else bucket.saidas += m.quantity;
    }

    return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
  },

  async lowStockTable(limit = 10) {
    return productsService.lowStock(limit);
  },

  async recentMovements(limit = 10) {
    return movementsService.recent(limit);
  },

  // Composição do valor do estoque por categoria (para o gráfico de rosca "Valor por Categoria")
  async stockValueByCategory() {
    const data = await reportsService.stockValueByCategory();
    const total = data.reduce((sum, c) => sum + c.stockValue, 0);
    return data
      .map((c) => ({ ...c, percentage: total > 0 ? Number(((c.stockValue / total) * 100).toFixed(1)) : 0 }))
      .sort((a, b) => b.stockValue - a.stockValue);
  },
};
