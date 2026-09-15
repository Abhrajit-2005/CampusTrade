import { Request, Response } from "express";
import { stripe } from "../config/stripe.js";
import { env } from "../config/env.js";
import { webhookService } from "../services/webhook.service.js";
import Stripe from "stripe";

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).json({ success: false, message: "Missing stripe-signature" });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await webhookService.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await webhookService.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "charge.refunded":
        await webhookService.handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      default:
        // Ignore unsupported event types safely
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};
