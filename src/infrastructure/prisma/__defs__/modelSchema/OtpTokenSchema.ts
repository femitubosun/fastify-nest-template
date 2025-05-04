import { z } from 'zod';
import { TokenTypeSchema } from '../inputTypeSchemas/TokenTypeSchema';

/////////////////////////////////////////
// OTP TOKEN SCHEMA
/////////////////////////////////////////

export const OtpTokenSchema = z.object({
  tokenType: TokenTypeSchema,
  id: z.string(),
  userId: z.string(),
  tokenHash: z.string(),
  expiresAt: z.coerce.date(),
  isUsed: z.boolean(),
});

export type OtpToken = z.infer<typeof OtpTokenSchema>;

export default OtpTokenSchema;
