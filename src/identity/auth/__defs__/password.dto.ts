import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/***
 * Request Password Reset Token
 */

// Request
export const RequestPasswordResetToken = z.object({
  email: z.string().email(),
});

export type RequestPasswordResetToken = z.infer<
  typeof RequestPasswordResetToken
>;

export class RequestPasswordResetTokenDto extends createZodDto(
  RequestPasswordResetToken,
) {}

// Response
export const RequestPasswordResetTokenResponse = z.object({
  token: z.string(),
});

export type RequestPasswordResetTokenResponse = z.infer<
  typeof RequestPasswordResetTokenResponse
>;

export class RequestPasswordResetTokenResponseDto extends createZodDto(
  RequestPasswordResetTokenResponse,
) {}

/***
 * Reset Password
 */

// Request
export const ResetPassword = z.object({
  token: z.string(),
  password: z.string(),
});

export type ResetPassword = z.infer<typeof ResetPassword>;

export class ResetPasswordDto extends createZodDto(ResetPassword) {}
