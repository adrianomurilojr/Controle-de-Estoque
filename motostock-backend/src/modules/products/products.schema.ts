import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  sku: z.string().min(1, "SKU é obrigatório"),
  barcode: z.string().optional(),
  categoryId: z.string().uuid("Categoria inválida"),
  brand: z.string().optional(),
  application: z.string().optional(),
  description: z.string().optional(),
  costPrice: z.number().nonnegative("Preço de custo inválido"),
  salePrice: z.number().nonnegative("Preço de venda inválido"),
  currentStock: z.number().int().nonnegative().default(0),
  minStock: z.number().int().nonnegative().default(0),
  location: z.string().optional(),
  photoUrl: z.string().optional(),
  supplierId: z.string().uuid("Fornecedor inválido").optional(),
  supplierProductCode: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
});

export const listProductsQuerySchema = z.object({
  page: z.string().optional(),
  perPage: z.string().optional(),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brand: z.string().optional(),
  supplierId: z.string().uuid().optional(),
  stockStatus: z.enum(["NORMAL", "BAIXO", "SEM_ESTOQUE"]).optional(),
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
  sortBy: z.enum(["name", "sku", "currentStock", "salePrice", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid("ID inválido") });

export const generateSkuQuerySchema = z.object({
  categoryId: z.string().uuid("Categoria inválida"),
  brand: z.string().optional(),
});

