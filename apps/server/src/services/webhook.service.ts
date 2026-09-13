import { paymentRepository } from "../repositories/payment.repository.js";
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
  }
};
