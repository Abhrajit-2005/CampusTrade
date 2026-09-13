import { z } from "zod";

export const addWishlistSchema = z.object({
  body: z.object({
    itemId: z.string().uuid("Invalid Item ID format"),
  }),
});

export const getWishlistSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "Page must be a number").optional(),
    limit: z.string().regex(/^\d+$/, "Limit must be a number").optional(),
  }),
});

export const wishlistParamsSchema = z.object({
  params: z.object({
    itemId: z.string().uuid("Invalid Item ID format"),
  }),
});
