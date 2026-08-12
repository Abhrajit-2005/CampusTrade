import { Router } from "express";

import {
  createCollegeAdminInvitation,
} from "../controllers/platform-admin.controller.js";

import {
  authenticate,
} from "../middlewares/auth.middleware.js";

import {
  authorizeRoles,
} from "../middlewares/role.middleware.js";

import {
  validate,
} from "../middlewares/validation.middleware.js";

import {
  createCollegeAdminInvitationSchema,
} from "../validators/platform-admin.validator.js";

const router = Router();

router.post(
  "/colleges/:collegeId/admins/invite",
  authenticate,
  authorizeRoles("PLATFORM_ADMIN"),
  validate(createCollegeAdminInvitationSchema),
  createCollegeAdminInvitation
);

export default router;