import { z } from 'zod';

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullish(),
  password: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export default UserSchema;
