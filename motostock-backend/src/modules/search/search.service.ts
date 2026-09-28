import { prisma } from "../../lib/prisma";

export const searchService = {
  async globalSearch(term: string) {
    if (!term || term.trim().length < 2) {
      return { products: [], categories: [], suppliers: [] };
    }

    const insensitive = { contains: term, mode: "insensitive" as const };

    const [products, categories, suppliers] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [{ name: insensitive }, { sku: insensitive }, { barcode: insensitive }, { brand: insensitive }],
        },
        take: 8,
        select: { id: true, name: true, sku: true, currentStock: true, photoUrl: true },
      }),
      prisma.category.findMany({
        where: { name: insensitive },
        take: 5,
        select: { id: true, name: true },
      }),
      prisma.supplier.findMany({
        where: { OR: [{ legalName: insensitive }, { tradeName: insensitive }] },
        take: 5,
        select: { id: true, legalName: true, tradeName: true },
      }),
    ]);

    return { products, categories, suppliers };
  },
};
