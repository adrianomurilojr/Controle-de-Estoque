import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/apiError";
import { buildPaginatedResponse, parsePagination } from "../../utils/pagination";

export type StockStatus = "NORMAL" | "BAIXO" | "SEM_ESTOQUE";

export function computeStockStatus(currentStock: number, minStock: number): StockStatus {
  if (currentStock <= 0) return "SEM_ESTOQUE";
  if (currentStock <= minStock) return "BAIXO";
  return "NORMAL";
}

function withStockStatus<T extends { currentStock: number; minStock: number }>(product: T) {
  return { ...product, stockStatus: computeStockStatus(product.currentStock, product.minStock) };
}

interface ListProductsQuery {
  page?: string;
  perPage?: string;
  search?: string;
  categoryId?: string;
  brand?: string;
  supplierId?: string;
  stockStatus?: StockStatus;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const productsService = {
  async list(query: ListProductsQuery) {
    const { skip, take, page, perPage } = parsePagination(query);

    const where = {
      AND: [
        query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: "insensitive" as const } },
                { sku: { contains: query.search, mode: "insensitive" as const } },
                { barcode: { contains: query.search, mode: "insensitive" as const } },
                { brand: { contains: query.search, mode: "insensitive" as const } },
              ],
            }
          : {},
        query.categoryId ? { categoryId: query.categoryId } : {},
        query.brand ? { brand: { equals: query.brand, mode: "insensitive" as const } } : {},
        query.supplierId ? { supplierId: query.supplierId } : {},
        query.status ? { status: query.status as any } : {},
      ],
    };

    const orderBy = { [query.sortBy ?? "name"]: query.sortOrder ?? "asc" } as any;
    const includeRelations = { category: true, supplier: true };

    // Filtro por status de estoque compara duas colunas (currentStock x minStock),
    // o que exige pós-processamento em memória já que o Prisma não compara colunas nativamente.
    if (query.stockStatus) {
      const all = await prisma.product.findMany({ where, orderBy, include: includeRelations });
      const filtered = all
        .map(withStockStatus)
        .filter((p) => p.stockStatus === query.stockStatus);
      const paginated = filtered.slice(skip, skip + take);
      return buildPaginatedResponse(paginated, filtered.length, page, perPage);
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take, orderBy, include: includeRelations }),
      prisma.product.count({ where }),
    ]);

    return buildPaginatedResponse(products.map(withStockStatus), total, page, perPage);
  },

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, supplier: true },
    });
    if (!product) throw ApiError.notFound("Produto não encontrado.");
    return withStockStatus(product);
  },

  async create(data: Record<string, any>) {
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) throw ApiError.conflict("Já existe um produto com este SKU.");

    if (data.barcode) {
      const existingBarcode = await prisma.product.findUnique({ where: { barcode: data.barcode } });
      if (existingBarcode) throw ApiError.conflict("Já existe um produto com este código de barras.");
    }

    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw ApiError.badRequest("Categoria informada não existe.");

    if (data.supplierId) {
      const supplier = await prisma.supplier.findUnique({ where: { id: data.supplierId } });
      if (!supplier) throw ApiError.badRequest("Fornecedor informado não existe.");
    }

    const product = await prisma.product.create({
      data,
      include: { category: true, supplier: true },
    });
    return withStockStatus(product);
  },

  async update(id: string, data: Record<string, any>) {
    await this.getById(id);

    if (data.sku) {
      const existing = await prisma.product.findFirst({ where: { sku: data.sku, NOT: { id } } });
      if (existing) throw ApiError.conflict("Já existe outro produto com este SKU.");
    }
    if (data.barcode) {
      const existing = await prisma.product.findFirst({ where: { barcode: data.barcode, NOT: { id } } });
      if (existing) throw ApiError.conflict("Já existe outro produto com este código de barras.");
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true, supplier: true },
    });
    return withStockStatus(product);
  },

  async remove(id: string) {
    await this.getById(id);
    const movementsCount = await prisma.stockMovement.count({ where: { productId: id } });
    if (movementsCount > 0) {
      // Preserva integridade do histórico: inativa em vez de apagar
      await prisma.product.update({ where: { id }, data: { status: "INATIVO" } });
      return;
    }
    await prisma.product.delete({ where: { id } });
  },

  async lowStock(limit = 10) {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { currentStock: "asc" },
    });
    return products
      .map(withStockStatus)
      .filter((p) => p.stockStatus !== "NORMAL")
      .slice(0, limit);
  },

  // Sugere um SKU no padrão CATEGORIA-MARCA-SEQUENCIAL (ex: TRA-VAZ-0042), com base
  // na categoria e marca informadas. O usuário pode editar livremente antes de salvar.
  async generateSku(categoryId: string, brand?: string) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw ApiError.badRequest("Categoria informada não existe.");

    const normalize = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();

    const categoryPrefix = normalize(category.name).slice(0, 3) || "GEN";
    const brandPrefix = brand ? normalize(brand).slice(0, 3) : "STD";

    const countInCategory = await prisma.product.count({ where: { categoryId } });
    const sequence = String(countInCategory + 1).padStart(4, "0");

    let sku = `${categoryPrefix}-${brandPrefix}-${sequence}`;

    // Garante unicidade caso já exista um SKU igual (raro, mas possível após exclusões)
    let attempt = 0;
    while (await prisma.product.findUnique({ where: { sku } })) {
      attempt += 1;
      sku = `${categoryPrefix}-${brandPrefix}-${String(countInCategory + 1 + attempt).padStart(4, "0")}`;
    }

    return { sku };
  },

  async listBrands() {
    const products = await prisma.product.findMany({
      where: { brand: { not: null } },
      distinct: ["brand"],
      select: { brand: true },
      orderBy: { brand: "asc" },
    });
    return products.map((p) => p.brand).filter(Boolean);
  },
};
