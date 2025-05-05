import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export type ChangePasswordSchema = z.infer<typeof ChangePasswordSchema>;

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}
