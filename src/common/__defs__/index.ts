import { FastifyRequest } from 'fastify';

import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { SessionUserSchema } from 'src/identity/auth/__defs__';

export type AuthedRequest = FastifyRequest & { user: SessionUserSchema };

/**
 * Empty Request
 */
export const EmptyRequestSchema = z.object({});
export type EmptyRequestSchema = z.infer<typeof EmptyRequestSchema>;

export class EmptyRequestDto extends createZodDto(EmptyRequestSchema) {}

/**
 * Message Response
 */
export const MessageResponseSchema = z.object({
  message: z.string(),
});
export type MessageResponseSchema = z.infer<typeof MessageResponseSchema>;
export class MessageResponseDto extends createZodDto(MessageResponseSchema) {}
