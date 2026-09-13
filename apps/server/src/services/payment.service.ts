import { randomUUID } from "crypto";
import { stripe, PAYMENT_CURRENCY } from "../config/stripe.js";
import { paymentRepository } from "../repositories/payment.repository.js";
import { orderRepository } from "../repositories/order.repository.js";
import { AppError } from "../utils/AppError.js";

export const paymentService = {
  createPaymentIntent: async (orderId: string, buyerId: string) => {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
    }

    if (order.buyerId !== buyerId) {
      throw new AppError("You do not have permission to pay for this order", 403, "FORBIDDEN");
    }

    if (order.status !== "PENDING") {
      throw new AppError(`Cannot pay for order with status ${order.status}`, 400, "INVALID_ORDER_STATUS");
    }

    if (order.item.status !== "RESERVED" || order.item.deletedAt !== null) {
      throw new AppError("Item is no longer available for payment", 400, "ITEM_UNAVAILABLE");
    }

    const stripeAmount = order.price * 100;

    const paymentId = randomUUID();

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create(
        {
          amount: stripeAmount,
          currency: PAYMENT_CURRENCY,
          metadata: {
            paymentId,
            orderId: order.id,
            buyerId,
          },
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never"
          },
        },
        {
          idempotencyKey: paymentId,
        }
      );
    } catch (error) {
      console.error("Stripe PaymentIntent creation failed:", error);
      throw new AppError("Failed to initialize payment with provider", 502, "PAYMENT_PROVIDER_ERROR");
    }

    try {
      await paymentRepository.createPayment({
        id: paymentId,
        orderId: order.id,
        provider: "stripe",
        providerPaymentId: paymentIntent.id,
        amount: stripeAmount,
        currency: PAYMENT_CURRENCY,
      });
    } catch (error) {
      console.error("Failed to create Payment DB record. Cancelling Stripe Intent.", error);
      
      try {
        await stripe.paymentIntents.cancel(paymentIntent.id);
      } catch (cancelError) {
        console.error("Failed to cancel Stripe PaymentIntent after DB failure:", cancelError);
      }

      throw new AppError("An internal error occurred while initializing payment", 500, "INTERNAL_SERVER_ERROR");
    }

    return {
      paymentId,
      orderId: order.id,
      provider: "stripe",
      providerPaymentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: stripeAmount,
      currency: PAYMENT_CURRENCY,
      status: "PENDING",
    };
  },
};
