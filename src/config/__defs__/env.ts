import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string(),

  CACHE_URL: z.string(),

  BULLMQ_REDIS_URL: z.string(),
  BULLMQ_DASHBOARD_USER: z.string(),
  BULLMQ_DASHBOARD_PASSWORD: z.string(),
  BULLMQ_DASHBOARD_ROUTE: z.string(),

  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  DEFAULT_EMAIL_FROM: z.string(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;
