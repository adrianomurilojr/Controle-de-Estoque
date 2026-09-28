import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { authenticate } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { movementsController } from "./movements.controller";
import {
  createAdjustmentSchema,
  createEntrySchema,
  createExitSchema,
  listMovementsQuerySchema,
} from "./movements.schema";

const router = Router();

router.use(authenticate);

router.get("/", validate({ query: listMovementsQuerySchema }), asyncHandler(movementsController.list));
router.get("/recent", asyncHandler(movementsController.recent));
router.post("/entry", validate({ body: createEntrySchema }), asyncHandler(movementsController.createEntry));
router.post("/exit", validate({ body: createExitSchema }), asyncHandler(movementsController.createExit));
router.post("/adjustment", validate({ body: createAdjustmentSchema }), asyncHandler(movementsController.createAdjustment));

export default router;
