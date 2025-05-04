import { z } from 'zod';

export const OtpTokenScalarFieldEnumSchema = z.enum([
  'id',
  'userId',
  'tokenType',
  'tokenHash',
  'expiresAt',
  'isUsed',
]);

export default OtpTokenScalarFieldEnumSchema;
