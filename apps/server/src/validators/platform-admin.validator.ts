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