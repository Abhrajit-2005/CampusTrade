import { z } from "zod";

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z
      .string()
      .min(1, "Verification token is required"),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),

    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .transform((value) => value.toLowerCase()),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(128, "Password cannot exceed 128 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .transform((value) => value.toLowerCase()),

    password: z
      .string()
      .min(1, "Password is required"),
  }),
});

export const acceptAdminInvitationSchema = z.object({
  body: z.object({
    token: z
      .string()
      .min(1, "Invitation token is required"),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters"),
  }),
});