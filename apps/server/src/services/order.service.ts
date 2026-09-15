import { orderRepository } from "../repositories/order.repository.js";
import { itemRepository } from "../repositories/item.repository.js";
import { paymentRepository } from "../repositories/payment.repository.js";
import { paymentService } from "./payment.service.js";
import { AppError } from "../utils/AppError.js";

export const orderService = {
  createOrder: async (buyerId: string, itemId: string) => {
    const item = await itemRepository.findById(itemId);

    if (!item || item.deletedAt !== null) {
      throw new AppError("Item not found", 404, "ITEM_NOT_FOUND");
    }

    if (item.status !== "AVAILABLE") {
      throw new AppError("Item is no longer available", 409, "ITEM_NOT_AVAILABLE");
    }

    if (item.sellerId === buyerId) {
      throw new AppError("You cannot purchase your own listing", 403, "FORBIDDEN");
    }

    const order = await orderRepository.createOrderWithAtomicReservation(
      buyerId,
      item.sellerId,
      item.id,
      item.price,
      item.title
    );

    return order;
  },

  updateOrderStatus: async (userId: string, orderId: string, status: "CONFIRMED" | "CANCELLED" | "COMPLETED") => {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
    }

    if (status === "CONFIRMED") {
      if (order.sellerId !== userId) {
        throw new AppError("Only the seller can confirm the order", 403, "FORBIDDEN");
      }

      if (order.status !== "PENDING") {
        throw new AppError("Order is not in PENDING state", 409, "INVALID_ORDER_STATUS");
      }

      return orderRepository.updateOrderStatus(order.id, order.itemId, "CONFIRMED", "PENDING");
    }

    if (status === "CANCELLED") {
      if (order.buyerId !== userId && order.sellerId !== userId) {
        throw new AppError("You don't have permission to cancel this order", 403, "FORBIDDEN");
      }

      if (order.status === "CONFIRMED") {
        const payments = await paymentRepository.findByOrderId(order.id);
        const successfulPayment = payments.find(p => p.status === "SUCCESS");
        
        if (!successfulPayment) {
          throw new AppError("No successful payment found for this order", 409, "INVALID_PAYMENT_STATE");
        }

        await paymentService.refundPayment(successfulPayment);

        try {
          return await paymentRepository.refundPaymentAndCancelOrder(successfulPayment.id, order.id, order.itemId);
        } catch (dbError) {
          console.error("DB transaction failed after successful Stripe refund:", dbError);
          throw new AppError("Failed to finalize order cancellation in database. Please contact support.", 500, "INTERNAL_SERVER_ERROR");
        }
      }

      if (order.status === "PENDING") {
        return orderRepository.updateOrderStatus(order.id, order.itemId, "CANCELLED", "PENDING", "RESERVED", "AVAILABLE");
      }

      throw new AppError("Order cannot be cancelled", 409, "INVALID_ORDER_STATUS");
    }

    if (status === "COMPLETED") {
      if (order.buyerId !== userId && order.sellerId !== userId) {
        throw new AppError("You don't have permission to complete this order", 403, "FORBIDDEN");
      }

      if (order.status !== "CONFIRMED") {
        throw new AppError("Order is not in CONFIRMED state", 409, "INVALID_ORDER_STATUS");
      }

      return orderRepository.updateOrderStatus(order.id, order.itemId, "COMPLETED", "CONFIRMED", "RESERVED", "SOLD");
    }
  },
};
