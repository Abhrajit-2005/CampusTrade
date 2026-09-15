import { paymentRepository } from "../repositories/payment.repository.js";
import { orderRepository } from "../repositories/order.repository.js";
import Stripe from "stripe";

export const webhookService = {
  handlePaymentIntentSucceeded: async (paymentIntent: Stripe.PaymentIntent) => {
    const payment = await paymentRepository.findByProviderPaymentId(paymentIntent.id);
    
    if (!payment) {
      console.warn(`PaymentIntent succeeded for unknown providerPaymentId: ${paymentIntent.id}`);
      return;
    }

    if (payment.status === "SUCCESS") {
      return; // Idempotent duplicate
    }

    if (payment.amount !== paymentIntent.amount || payment.currency !== paymentIntent.currency) {
      console.warn(`Amount/currency mismatch for payment ${payment.id}. DB: ${payment.amount} ${payment.currency}, Stripe: ${paymentIntent.amount} ${paymentIntent.currency}`);
      return; // Do not mark success
    }

    if (payment.status === "PENDING") {
      await paymentRepository.confirmPaymentAndOrder(payment.id, payment.orderId);
    }
  },

  handlePaymentIntentFailed: async (paymentIntent: Stripe.PaymentIntent) => {
    const payment = await paymentRepository.findByProviderPaymentId(paymentIntent.id);

    if (!payment) {
      console.warn(`PaymentIntent failed for unknown providerPaymentId: ${paymentIntent.id}`);
      return;
    }

    if (payment.status === "FAILED") {
      return; // Idempotent duplicate
    }

    if (payment.status === "PENDING") {
      const failureReason = paymentIntent.last_payment_error?.message || "Payment failed";
      await paymentRepository.updatePaymentFailed(payment.id, failureReason);
    }
  },

  handleChargeRefunded: async (charge: Stripe.Charge) => {
    const paymentIntentId = typeof charge.payment_intent === 'string' 
      ? charge.payment_intent 
      : charge.payment_intent?.id;
      
    if (!paymentIntentId) {
      console.warn("Charge refunded without payment_intent");
      return;
    }

    const payment = await paymentRepository.findByProviderPaymentId(paymentIntentId);

    if (!payment) {
      console.warn(`Charge refunded for unknown providerPaymentId: ${paymentIntentId}`);
      return;
    }

    if (payment.status === "REFUNDED") {
      return;
    }

    if (charge.amount_refunded !== payment.amount) {
      console.warn(`Partial refund not supported. Payment: ${payment.amount}, Refunded: ${charge.amount_refunded}`);
      return;
    }

    const order = await orderRepository.findById(payment.orderId);
    
    if (order && order.status === "CONFIRMED") {
      try {
        await paymentRepository.refundPaymentAndCancelOrder(payment.id, order.id, order.itemId);
      } catch (error) {
        console.error("Failed to safely finalize refund in DB:", error);
      }
    } else if (payment.status === "SUCCESS") {
      await paymentRepository.updatePaymentStatus(payment.id, "REFUNDED");
    }
  }
};
