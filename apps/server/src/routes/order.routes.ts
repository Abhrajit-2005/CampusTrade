import { Router } from "express";
import { createOrder } from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createOrderSchema } from "../validators/order.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createOrderSchema),
  createOrder
);

export default router;
