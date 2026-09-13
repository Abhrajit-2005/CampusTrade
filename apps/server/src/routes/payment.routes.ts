import { Router } from "express";
import { createPaymentIntent } from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createPaymentSchema } from "../validators/payment.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createPaymentSchema),
  createPaymentIntent
);

export default router;
