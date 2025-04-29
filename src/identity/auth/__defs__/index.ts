import { z } from 'zod';

export const SessionUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  roles: z.string().array(),
  sessionVersion: z.number().positive(),
});

export type SessionUserSchema = z.infer<typeof SessionUserSchema>;

export const JwtPayloadSchema = z.object({
  sub: z.string(),
  email: z.string(),
  sessionVersion: z.number(),
});
