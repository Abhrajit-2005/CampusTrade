import { z } from "zod";
import { UserStatus, ItemStatus, ItemCondition } from "@prisma/client";

export const getAdminUsersSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "Page must be a positive integer")
      .transform(Number)
      .optional()
      .default(1 as any),
    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a positive integer")
      .transform(Number)
      .optional()
      .default(20 as any),
    search: z.string().optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }),
});

export const getAdminUserDetailsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
});

export const updateAdminUserStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
  body: z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"]),
  }),
});

export const getAdminItemsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "Page must be a positive integer")
      .transform(Number)
      .optional()
      .default(1 as any),
    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a positive integer")
      .transform(Number)
      .optional()
      .default(20 as any),
    search: z.string().optional(),
    status: z.nativeEnum(ItemStatus).optional(),
    categoryId: z.string().uuid("Invalid category ID format").optional(),
    condition: z.nativeEnum(ItemCondition).optional(),
  }),
});

export const getAdminItemDetailsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid item ID format"),
  }),
});

export const updateAdminItemStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid item ID format"),
  }),
  body: z.object({
    status: z.enum(["REMOVED"]),
  }),
});
