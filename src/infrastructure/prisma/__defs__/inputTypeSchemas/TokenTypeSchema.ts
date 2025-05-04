import { z } from 'zod';

export const TokenTypeSchema = z.enum(['PASSWORD_RESET', 'SIGNUP']);

export type TokenTypeType = `${z.infer<typeof TokenTypeSchema>}`;

export default TokenTypeSchema;
