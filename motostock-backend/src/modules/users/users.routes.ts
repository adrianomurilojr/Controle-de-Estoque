import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { authenticate, authorize } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { usersController } from "./users.controller";
import { createUserSchema, idParamSchema, listUsersQuerySchema, updateUserSchema } from "./users.schema";

const router = Router();

router.use(authenticate, authorize("ADMINISTRADOR"));

router.get("/", validate({ query: listUsersQuerySchema }), asyncHandler(usersController.list));
router.get("/:id", validate({ params: idParamSchema }), asyncHandler(usersController.getById));
router.post("/", validate({ body: createUserSchema }), asyncHandler(usersController.create));
router.put("/:id", validate({ params: idParamSchema, body: updateUserSchema }), asyncHandler(usersController.update));
router.delete("/:id", validate({ params: idParamSchema }), asyncHandler(usersController.remove));

export default router;
