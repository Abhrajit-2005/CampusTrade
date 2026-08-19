import { Router } from "express";
import { login, register, verifyEmail, acceptAdminInvitation, refresh } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { loginSchema, registerSchema, verifyEmailSchema, acceptAdminInvitationSchema } from "../validators/auth.validator.js";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  verifyEmail
);

router.post(
  "/admin-invitations/accept",
  validate(acceptAdminInvitationSchema),
  acceptAdminInvitation
);

router.post(
  "/refresh",
  refresh
);

export default router;