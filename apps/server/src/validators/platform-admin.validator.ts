import { z } from "zod";

export const createCollegeAdminInvitationSchema =
  z.object({
    body: z.object({
      name: z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters"),

      email: z
        .string()
        .trim()
        .email("Invalid email address")
        .transform((value) =>
          value.toLowerCase()
        ),
    }),
  });

export const createCollegeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    domain: z.string().trim().min(3),
    city: z.string().trim().min(2),
    state: z.string().trim().min(2),
    country: z.string().trim().min(2),
  }),
});