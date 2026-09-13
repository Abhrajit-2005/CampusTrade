import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid("Invalid Order ID format"),
  }),
});
