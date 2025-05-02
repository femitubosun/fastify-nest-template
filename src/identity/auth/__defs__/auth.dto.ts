import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { UserSchema } from 'src/infrastructure/prisma/__defs__';

export const RegisterUserSchema = UserSchema.pick({
  email: true,
  name: true,
  password: true,
});

export type RegisterUserSchema = z.infer<typeof RegisterUserSchema>;

export class RegisterUserDto extends createZodDto(RegisterUserSchema) {}

export const LoginUserSchema = UserSchema.pick({
  email: true,
  password: true,
});
export type LoginUserSchema = z.infer<typeof LoginUserSchema>;
export class LoginUserDto extends createZodDto(LoginUserSchema) {}
