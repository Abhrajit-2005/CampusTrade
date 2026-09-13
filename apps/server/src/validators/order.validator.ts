import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    itemId: z.string().uuid("Invalid Item ID format"),
  }),
});
