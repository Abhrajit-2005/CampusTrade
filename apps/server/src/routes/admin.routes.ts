import { Router } from "express";
import {
  getDashboardStats,
  getAdminUsers,
  getAdminUserDetails,
  updateAdminUserStatus,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  getAdminUsersSchema,
  getAdminUserDetailsSchema,
  updateAdminUserStatusSchema,
} from "../validators/admin.validator.js";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  getDashboardStats
);

router.get(
  "/users",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(getAdminUsersSchema),
  getAdminUsers
);

router.get(
  "/users/:id",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(getAdminUserDetailsSchema),
  getAdminUserDetails
);

router.patch(
  "/users/:id/status",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(updateAdminUserStatusSchema),
  updateAdminUserStatus
);

export default router;
