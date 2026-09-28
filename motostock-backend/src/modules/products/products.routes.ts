import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { authenticate, authorize } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { productsController } from "./products.controller";
import {
  createProductSchema,
  generateSkuQuerySchema,
  idParamSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from "./products.schema";

const router = Router();

router.use(authenticate);

router.get("/", validate({ query: listProductsQuerySchema }), asyncHandler(productsController.list));
router.get("/low-stock", asyncHandler(productsController.lowStock));
router.get("/brands", asyncHandler(productsController.brands));
router.get("/generate-sku", validate({ query: generateSkuQuerySchema }), asyncHandler(productsController.generateSku));
router.get("/:id", validate({ params: idParamSchema }), asyncHandler(productsController.getById));
router.post("/", validate({ body: createProductSchema }), asyncHandler(productsController.create));
router.put("/:id", validate({ params: idParamSchema, body: updateProductSchema }), asyncHandler(productsController.update));
router.delete("/:id", authorize("ADMINISTRADOR"), validate({ params: idParamSchema }), asyncHandler(productsController.remove));

export default router;
