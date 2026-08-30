import { Router } from "express";
import {
  getMe,
  updateMe,
  getPublicProfile,
} from "../controllers/user.controller.js";
import {
  authenticate,
} from "../middlewares/auth.middleware.js";
import {
  validate,
} from "../middlewares/validation.middleware.js";
import {
  updateProfileSchema,
  getUserByIdSchema,
} from "../validators/user.validator.js";

const router = Router();

router.get(
  "/me",
  authenticate,
  getMe
);

router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  updateMe
);

router.get(
  "/:id",
  authenticate,
  validate(getUserByIdSchema),
  getPublicProfile
);

export default router;
