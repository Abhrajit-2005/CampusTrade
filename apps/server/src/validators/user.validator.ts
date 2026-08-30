import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),

    username: z
      .string()
      .trim()
      .min(3, "Username must contain at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      )
      .transform((value) => value.toLowerCase())
      .nullable()
      .optional(),

    bio: z
      .string()
      .trim()
      .max(500, "Bio cannot exceed 500 characters")
      .nullable()
      .optional(),

    phone: z
      .string()
      .trim()
      .min(7, "Phone number must contain at least 7 characters")
      .max(20, "Phone number cannot exceed 20 characters")
      .nullable()
      .optional(),

    profileImage: z
      .string()
      .trim()
      .url("Invalid profile image URL")
      .nullable()
      .optional(),

    location: z
      .string()
      .trim()
      .min(1, "Location must not be empty")
      .max(200, "Location cannot exceed 200 characters")
      .nullable()
      .optional(),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID"),
  }),
});
