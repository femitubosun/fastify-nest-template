import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  roles: z.string().array(),
  sessionVersion: z.number().positive(),
});

export type SessionUserSchema = z.infer<typeof SessionUserSchema>;

export class SessionUserDto extends createZodDto(SessionUserSchema) {}

export const JwtPayloadSchema = z.object({
  sub: z.string(),
  email: z.string(),
  sessionVersion: z.number(),
});

export const AuthResponseSchema = z.object({
  token: z.string(),
  message: z.string(),
});

export type AuthResponseSchema = z.infer<typeof AuthResponseSchema>;

export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}
