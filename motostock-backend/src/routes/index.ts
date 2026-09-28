import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import usersRoutes from "../modules/users/users.routes";
import categoriesRoutes from "../modules/categories/categories.routes";
import suppliersRoutes from "../modules/suppliers/suppliers.routes";
import productsRoutes from "../modules/products/products.routes";
import stockRoutes from "../modules/stock/stock.routes";
import movementsRoutes from "../modules/movements/movements.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import reportsRoutes from "../modules/reports/reports.routes";
import notificationsRoutes from "../modules/notifications/notifications.routes";
import searchRoutes from "../modules/search/search.routes";
import uploadsRoutes from "../modules/uploads/uploads.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/categories", categoriesRoutes);
router.use("/suppliers", suppliersRoutes);
router.use("/products", productsRoutes);
router.use("/stock", stockRoutes);
router.use("/movements", movementsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/search", searchRoutes);
router.use("/uploads", uploadsRoutes);

export default router;
