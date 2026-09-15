import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    itemId: z.string().uuid("Invalid Item ID format"),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]),
  }),
  params: z.object({
    id: z.string().uuid("Invalid Order ID format"),
  }),
});
