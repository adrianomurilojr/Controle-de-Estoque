import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { authenticate } from "../../middlewares/auth";
import { dashboardController } from "./dashboard.controller";

const router = Router();

router.use(authenticate);

router.get("/stats", asyncHandler(dashboardController.stats));
router.get("/movements-chart", asyncHandler(dashboardController.movementsChart));
router.get("/low-stock", asyncHandler(dashboardController.lowStock));
router.get("/recent-movements", asyncHandler(dashboardController.recentMovements));
router.get("/stock-value-by-category", asyncHandler(dashboardController.stockValueByCategory));

export default router;
