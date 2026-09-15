import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { orderService } from "../services/order.service.js";
import { sendSuccess } from "../utils/response.js";

export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { itemId } = req.body;
    
    const order = await orderService.createOrder(req.user!.sub, itemId);

    return sendSuccess(
      res,
      order,
      "Order created successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const status = req.body.status as "CONFIRMED" | "CANCELLED" | "COMPLETED";
    const userId = req.user!.sub as string;

    const order = await orderService.updateOrderStatus(
      userId,
      id,
      status
    );

    return sendSuccess(
      res,
      order,
      `Order status updated to ${status} successfully`,
      200
    );
  } catch (error) {
    next(error);
  }
};
