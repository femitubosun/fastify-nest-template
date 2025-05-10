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
});

export type EnvSchema = z.infer<typeof EnvSchema>;
