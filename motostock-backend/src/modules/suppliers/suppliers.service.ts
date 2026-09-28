import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/apiError";
import { buildPaginatedResponse, parsePagination } from "../../utils/pagination";

export const suppliersService = {
  async list(query: { page?: string; perPage?: string; search?: string; status?: string }) {
    const { skip, take, page, perPage } = parsePagination(query);

    const where = {
      AND: [
        query.search
          ? {
              OR: [
                { legalName: { contains: query.search, mode: "insensitive" as const } },
                { tradeName: { contains: query.search, mode: "insensitive" as const } },
                { document: { contains: query.search, mode: "insensitive" as const } },
              ],
            }
          : {},
        query.status ? { status: query.status as any } : {},
      ],
    };

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take,
        orderBy: { legalName: "asc" },
        include: { _count: { select: { products: true } } },
      }),
      prisma.supplier.count({ where }),
    ]);

    const data = suppliers.map((s) => ({ ...s, productsCount: s._count.products, _count: undefined }));
    return buildPaginatedResponse(data, total, page, perPage);
  },

  async getById(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!supplier) throw ApiError.notFound("Fornecedor não encontrado.");
    return { ...supplier, productsCount: supplier._count.products, _count: undefined };
  },

  async create(data: Record<string, unknown>) {
    const existing = await prisma.supplier.findUnique({ where: { document: data.document as string } });
    if (existing) throw ApiError.conflict("Já existe um fornecedor com este CNPJ/CPF.");
    return prisma.supplier.create({ data: data as any });
  },

  async update(id: string, data: Record<string, unknown>) {
    await this.getById(id);
    return prisma.supplier.update({ where: { id }, data: data as any });
  },

  async remove(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!supplier) throw ApiError.notFound("Fornecedor não encontrado.");
    if (supplier._count.products > 0) {
      throw ApiError.badRequest(
        "Não é possível excluir um fornecedor com produtos vinculados. Desative-o em vez disso."
      );
    }
    await prisma.supplier.delete({ where: { id } });
  },
};
