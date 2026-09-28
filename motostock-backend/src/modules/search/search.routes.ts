import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { authenticate } from "../../middlewares/auth";
import { searchController } from "./search.controller";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(searchController.search));

export default router;
