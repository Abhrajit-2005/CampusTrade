import Stripe from "stripe";
import { env } from "./env.js";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20" as any,
});

export const PAYMENT_CURRENCY = env.PAYMENT_CURRENCY.toLowerCase();
