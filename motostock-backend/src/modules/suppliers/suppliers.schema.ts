import { z } from "zod";

export const supplierBaseSchema = {
  legalName: z.string().min(2, "Razão social é obrigatória"),
  tradeName: z.string().optional(),
  document: z.string().min(11, "CNPJ/CPF inválido"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  zipCode: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  observations: z.string().optional(),
};

export const createSupplierSchema = z.object(supplierBaseSchema);

export const updateSupplierSchema = z.object({
  ...Object.fromEntries(Object.entries(supplierBaseSchema).map(([k, v]) => [k, v.optional()])),
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
} as any);

export const listSuppliersQuerySchema = z.object({
  page: z.string().optional(),
  perPage: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid("ID inválido") });
