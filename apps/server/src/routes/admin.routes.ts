import { Router } from "express";
import {
  getDashboardStats,
  getAdminUsers,
  getAdminUserDetails,
  updateAdminUserStatus,
  getAdminItems,
  getAdminItemDetails,
  updateAdminItemStatus,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  getAdminUsersSchema,
  getAdminUserDetailsSchema,
  updateAdminUserStatusSchema,
  getAdminItemsSchema,
  getAdminItemDetailsSchema,
  updateAdminItemStatusSchema,
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

router.get(
  "/items",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(getAdminItemsSchema),
  getAdminItems
);

router.get(
  "/items/:id",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(getAdminItemDetailsSchema),
  getAdminItemDetails
);

router.patch(
  "/items/:id/status",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(updateAdminItemStatusSchema),
  updateAdminItemStatus
);

export default router;
