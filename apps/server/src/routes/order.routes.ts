import { Router } from "express";
import { createOrder, updateOrderStatus } from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/order.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createOrderSchema),
  createOrder
);

router.patch(
  "/:id/status",
  authenticate,
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
