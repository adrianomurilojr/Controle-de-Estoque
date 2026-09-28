import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { authenticate } from "../../middlewares/auth";
import { stockController } from "./stock.controller";

const router = Router();

router.use(authenticate);

router.get("/summary", asyncHandler(stockController.summary));
router.get("/", asyncHandler(stockController.overview));

export default router;
