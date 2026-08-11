import { Router } from "express";
import {
  approveUser,
  rejectUser,
  getPendingUsers
} from "../controllers/college-admin.controller.js";
import {
  authenticate,
} from "../middlewares/auth.middleware.js";
import {
  authorizeRoles,
} from "../middlewares/role.middleware.js";

const router = Router();

router.patch(
  "/users/:userId/approve",
  authenticate,
  authorizeRoles("COLLEGE_ADMIN"),
  approveUser
);

router.patch(
  "/users/:userId/reject",
  authenticate,
  authorizeRoles("COLLEGE_ADMIN"),
  rejectUser
);

router.get(
  "/users/pending",
  authenticate,
  authorizeRoles("COLLEGE_ADMIN"),
  getPendingUsers
);

export default router;