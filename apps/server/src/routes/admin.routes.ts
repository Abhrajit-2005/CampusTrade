import { Router } from "express";
import { getDashboardStats } from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  getDashboardStats
);

export default router;
