import {
  OtpTokenSchema,
  TokenTypeSchema,
} from '@/infrastructure/prisma/__defs__';
import { z } from 'zod';

export const CreateOtpTokenSchema = OtpTokenSchema.pick({
  userId: true,
  tokenType: true,
  tokenHash: true,
  expiresAt: true,
});

export type CreateOtpTokenSchema = z.infer<typeof CreateOtpTokenSchema>;

export const MarkAllAsUsedSchema = OtpTokenSchema.pick({
  userId: true,
  tokenType: true,
});

export type MarkAllAsUsedSchema = z.infer<typeof MarkAllAsUsedSchema>;

export const FindValidTokenSchema = OtpTokenSchema.pick({
  tokenHash: true,
}).extend({
  tokenType: TokenTypeSchema.optional(),
});

export type FindValidTokenSchema = z.infer<typeof FindValidTokenSchema>;
