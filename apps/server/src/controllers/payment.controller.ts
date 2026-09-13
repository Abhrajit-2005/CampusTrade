import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { paymentService } from "../services/payment.service.js";
import { sendSuccess } from "../utils/response.js";

export const createPaymentIntent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body;
    
    const paymentResponse = await paymentService.createPaymentIntent(orderId, req.user!.sub);

    return sendSuccess(
      res,
      paymentResponse,
      "Payment intent created successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};
