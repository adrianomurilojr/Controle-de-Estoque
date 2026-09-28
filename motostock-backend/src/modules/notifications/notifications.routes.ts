import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { authenticate } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { notificationsController } from "./notifications.controller";
import { idParamSchema, listNotificationsQuerySchema } from "./notifications.schema";

const router = Router();

router.use(authenticate);

router.get("/", validate({ query: listNotificationsQuerySchema }), asyncHandler(notificationsController.list));
router.get("/unread-count", asyncHandler(notificationsController.unreadCount));
router.put("/:id/read", validate({ params: idParamSchema }), asyncHandler(notificationsController.markAsRead));
router.put("/read-all", asyncHandler(notificationsController.markAllAsRead));

export default router;
