import { FastifyRequest } from 'fastify';
import { SessionUserSchema } from '@identity/auth/__defs__';

export type AuthedRequest = FastifyRequest & { user: SessionUserSchema };
