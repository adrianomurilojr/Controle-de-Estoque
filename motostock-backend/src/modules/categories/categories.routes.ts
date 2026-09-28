import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { authenticate, authorize } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { categoriesController } from "./categories.controller";
import { createCategorySchema, idParamSchema, listCategoriesQuerySchema, updateCategorySchema } from "./categories.schema";

const router = Router();

router.use(authenticate);

router.get("/", validate({ query: listCategoriesQuerySchema }), asyncHandler(categoriesController.list));
router.get("/:id", validate({ params: idParamSchema }), asyncHandler(categoriesController.getById));
router.post("/", authorize("ADMINISTRADOR"), validate({ body: createCategorySchema }), asyncHandler(categoriesController.create));
router.put(
  "/:id",
  authorize("ADMINISTRADOR"),
  validate({ params: idParamSchema, body: updateCategorySchema }),
  asyncHandler(categoriesController.update)
);
router.delete("/:id", authorize("ADMINISTRADOR"), validate({ params: idParamSchema }), asyncHandler(categoriesController.remove));

export default router;
