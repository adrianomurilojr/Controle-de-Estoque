import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/apiError";
import { buildPaginatedResponse, parsePagination } from "../../utils/pagination";

export const categoriesService = {
  async list(query: { page?: string; perPage?: string; search?: string; status?: string }) {
    const { skip, take, page, perPage } = parsePagination(query);

    const where = {
      AND: [
        query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {},
        query.status ? { status: query.status as any } : {},
      ],
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      }),
      prisma.category.count({ where }),
    ]);

    const data = categories.map((c) => ({
      ...c,
      productsCount: c._count.products,
      _count: undefined,
    }));

    return buildPaginatedResponse(data, total, page, perPage);
  },

  async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw ApiError.notFound("Categoria não encontrada.");
    return { ...category, productsCount: category._count.products, _count: undefined };
  },

  async create(data: { name: string; description?: string }) {
    const existing = await prisma.category.findUnique({ where: { name: data.name } });
    if (existing) throw ApiError.conflict("Já existe uma categoria com este nome.");
    return prisma.category.create({ data });
  },

  async update(id: string, data: { name?: string; description?: string; status?: "ATIVO" | "INATIVO" }) {
    await this.getById(id);
    return prisma.category.update({ where: { id }, data });
  },

  async remove(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw ApiError.notFound("Categoria não encontrada.");
    if (category._count.products > 0) {
      throw ApiError.badRequest(
        "Não é possível excluir uma categoria que possui produtos vinculados. Desative-a ou mova os produtos primeiro."
      );
    }
    await prisma.category.delete({ where: { id } });
  },
};
