import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  ACCESS_TOKEN_SECRET: z
    .string()
    .min(15, "ACCESS_TOKEN_SECRET must be at least 15 characters"),

  REFRESH_TOKEN_SECRET: z
    .string()
    .min(15, "REFRESH_TOKEN_SECRET must be at least 15 characters"),

  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),

  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");

  console.error(z.prettifyError(parsedEnv.error));

  process.exit(1);
}

export const env = parsedEnv.data;