import { z } from "zod";
import { ItemCondition } from "@prisma/client";

export const createItemSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(3, "Title must contain at least 3 characters")
      .max(100, "Title cannot exceed 100 characters"),

    description: z
      .string()
      .trim()
      .min(10, "Description must contain at least 10 characters")
      .max(1000, "Description cannot exceed 1000 characters"),

    price: z
      .number()
      .int()
      .min(0, "Price cannot be negative"),

    isNegotiable: z
      .boolean()
      .optional(),

    condition: z.nativeEnum(ItemCondition, {
      message: "Invalid item condition",
    }),

    pickupLocation: z
      .string()
      .trim()
      .min(3, "Pickup location must contain at least 3 characters")
      .max(200, "Pickup location cannot exceed 200 characters"),

    categoryId: z
      .string()
      .uuid("Invalid category ID"),
  }),
});

export const getItemsSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1, "Page must be a positive integer")
      .optional()
      .default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be a positive integer")
      .max(100, "Limit cannot exceed 100")
      .optional()
      .default(20),
    search: z.string().optional(),
    categoryId: z.string().uuid("Invalid category ID").optional(),
    minPrice: z.coerce.number().int().min(0, "minPrice cannot be negative").optional(),
    maxPrice: z.coerce.number().int().min(0, "maxPrice cannot be negative").optional(),
    condition: z.nativeEnum(ItemCondition, { message: "Invalid item condition" }).optional(),
    sortBy: z.enum(["createdAt", "price", "views"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }).refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "minPrice cannot be greater than maxPrice",
      path: ["maxPrice"],
    }
  ),
});

export const publishItemSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid item ID"),
  }),
});

export const getItemSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid item ID"),
  }),
});

export const updateItemSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid item ID"),
  }),
  body: z.object({
    title: z
      .string()
      .trim()
      .min(3, "Title must contain at least 3 characters")
      .max(100, "Title cannot exceed 100 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .min(10, "Description must contain at least 10 characters")
      .max(1000, "Description cannot exceed 1000 characters")
      .optional(),

    price: z
      .number()
      .int()
      .min(0, "Price cannot be negative")
      .optional(),

    isNegotiable: z
      .boolean()
      .optional(),

    condition: z.nativeEnum(ItemCondition, {
      message: "Invalid item condition",
    }).optional(),

    pickupLocation: z
      .string()
      .trim()
      .min(3, "Pickup location must contain at least 3 characters")
      .max(200, "Pickup location cannot exceed 200 characters")
      .optional(),

    categoryId: z
      .string()
      .uuid("Invalid category ID")
      .optional(),
  }).strict(),
});

export const deleteItemSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid item ID"),
  }),
});

export const getMyListingsSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1, "Page must be a positive integer")
      .optional()
      .default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be a positive integer")
      .max(100, "Limit cannot exceed 100")
      .optional()
      .default(20),
  }),
});
