import { User } from 'src/infrastructure/prisma/generated';
import { SessionUserSchema } from '../__defs__';

export function makeSessionKey(identifier: string): string {
  return `session:${identifier}`;
}

export function makeSessionUser(
  user: User,
  sessionVersion: number,
): SessionUserSchema {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? '',
    roles: ['user'],
    sessionVersion,
  };
}
