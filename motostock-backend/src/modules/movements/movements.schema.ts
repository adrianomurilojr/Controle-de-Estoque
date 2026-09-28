import { z } from "zod";

export const entryItemSchema = z.object({
  productId: z.string().uuid("Produto inválido"),
  quantity: z.number().int().positive("Quantidade deve ser maior que zero"),
  unitCost: z.number().nonnegative("Preço de custo inválido").optional(),
});

export const createEntrySchema = z.object({
  supplierId: z.string().uuid("Fornecedor inválido").optional(),
  invoiceNumber: z.string().optional(),
  referenceCode: z.string().optional(),
  observation: z.string().optional(),
  items: z.array(entryItemSchema).min(1, "Adicione ao menos um produto"),
});

export const exitItemSchema = z.object({
  productId: z.string().uuid("Produto inválido"),
  quantity: z.number().int().positive("Quantidade deve ser maior que zero"),
});

export const createExitSchema = z.object({
  reason: z.enum(["VENDA", "PERDA", "AVARIA", "USO_INTERNO", "OUTRO"]),
  // Referência do documento de origem: "Pedido Balcão #8841", "OS Oficina #419", etc.
  referenceCode: z.string().optional(),
  observation: z.string().optional(),
  items: z.array(exitItemSchema).min(1, "Adicione ao menos um produto"),
});

export const adjustmentItemSchema = z.object({
  productId: z.string().uuid("Produto inválido"),
  newStock: z.number().int().nonnegative("Novo estoque inválido"),
});

export const createAdjustmentSchema = z.object({
  observation: z.string().optional(),
  items: z.array(adjustmentItemSchema).min(1, "Adicione ao menos um produto"),
});

export const listMovementsQuerySchema = z.object({
  page: z.string().optional(),
  perPage: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  productId: z.string().uuid().optional(),
  type: z.enum(["ENTRADA", "SAIDA", "AJUSTE"]).optional(),
  userId: z.string().uuid().optional(),
});
