import { Router } from "express";
import { register, verifyEmail } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { registerSchema, verifyEmailSchema } from "../validators/auth.validator.js";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  verifyEmail
);

export default router;