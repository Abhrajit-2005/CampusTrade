import { Router } from "express";
import {
  getDashboardStats,
  getAdminUsers,
  getAdminUserDetails,
  updateAdminUserStatus,
  getAdminItems,
  getAdminItemDetails,
  updateAdminItemStatus,
  getAdminOrders,
  getAdminOrderDetails,
  getAdminPayments,
  getAdminPaymentDetails,
  refundAdminPayment,
  getAdminReports,
  getAdminReportDetails,
  updateAdminReportStatus,
  removeAdminReportedItem,
  suspendAdminReportedSeller,
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
  getAdminOrdersSchema,
  getAdminOrderDetailsSchema,
  getAdminPaymentsSchema,
  getAdminPaymentDetailsSchema,
  refundAdminPaymentSchema,
  getAdminReportsSchema,
  getAdminReportDetailsSchema,
  updateAdminReportStatusSchema,
  removeReportedItemSchema,
  suspendReportedSellerSchema,
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

router.get(
  "/orders",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(getAdminOrdersSchema),
  getAdminOrders
);

router.get(
  "/orders/:id",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(getAdminOrderDetailsSchema),
  getAdminOrderDetails
);

router.get(
  "/payments",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(getAdminPaymentsSchema),
  getAdminPayments
);

router.get(
  "/payments/:id",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(getAdminPaymentDetailsSchema),
  getAdminPaymentDetails
);

router.post(
  "/payments/:id/refund",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(refundAdminPaymentSchema),
  refundAdminPayment
);

router.get(
  "/reports",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(getAdminReportsSchema),
  getAdminReports
);

router.get(
  "/reports/:id",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(getAdminReportDetailsSchema),
  getAdminReportDetails
);

router.patch(
  "/reports/:id/status",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(updateAdminReportStatusSchema),
  updateAdminReportStatus
);

router.post(
  "/reports/:id/remove-item",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(removeReportedItemSchema),
  removeAdminReportedItem
);

router.post(
  "/reports/:id/suspend-seller",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN", "COLLEGE_ADMIN"),
  validate(suspendReportedSellerSchema),
  suspendAdminReportedSeller
);

export default router;
