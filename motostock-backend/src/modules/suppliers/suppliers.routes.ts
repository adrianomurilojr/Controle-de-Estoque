import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { authenticate, authorize } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { suppliersController } from "./suppliers.controller";
import { createSupplierSchema, idParamSchema, listSuppliersQuerySchema, updateSupplierSchema } from "./suppliers.schema";

const router = Router();

router.use(authenticate);

router.get("/", validate({ query: listSuppliersQuerySchema }), asyncHandler(suppliersController.list));
router.get("/:id", validate({ params: idParamSchema }), asyncHandler(suppliersController.getById));
router.post("/", validate({ body: createSupplierSchema }), asyncHandler(suppliersController.create));
router.put("/:id", validate({ params: idParamSchema, body: updateSupplierSchema }), asyncHandler(suppliersController.update));
router.delete("/:id", authorize("ADMINISTRADOR"), validate({ params: idParamSchema }), asyncHandler(suppliersController.remove));

export default router;
