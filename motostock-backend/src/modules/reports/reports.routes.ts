import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { authenticate } from "../../middlewares/auth";
import { reportsController } from "./reports.controller";

const router = Router();

router.use(authenticate);

router.get("/stock", asyncHandler(reportsController.stock));
router.get("/low-stock", asyncHandler(reportsController.lowStock));
router.get("/out-of-stock", asyncHandler(reportsController.outOfStock));
router.get("/entries", asyncHandler(reportsController.entries));
router.get("/exits", asyncHandler(reportsController.exits));
router.get("/movements", asyncHandler(reportsController.movements));
router.get("/stock-value", asyncHandler(reportsController.stockValue));
router.get("/stock-value-by-category", asyncHandler(reportsController.stockValueByCategory));
router.get("/top-products", asyncHandler(reportsController.topProducts));
router.get("/export/csv", asyncHandler(reportsController.exportCsv));
router.get("/export/pdf", asyncHandler(reportsController.exportPdf));

export default router;
