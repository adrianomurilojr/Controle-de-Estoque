import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { authenticate } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { authController } from "./auth.controller";
import { loginSchema, refreshSchema } from "./auth.schema";

const router = Router();

router.post("/login", validate({ body: loginSchema }), asyncHandler(authController.login));
router.post("/refresh", validate({ body: refreshSchema }), asyncHandler(authController.refresh));
router.post("/logout", authenticate, asyncHandler(authController.logout));
router.get("/me", authenticate, asyncHandler(authController.me));

export default router;
