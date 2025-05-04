import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { makeSessionKey, makeSessionUser } from '../utils/session.utils';
import { SessionUserSchema } from '../__defs__';
import { User } from 'src/infrastructure/prisma/generated';
import { RedisService } from 'src/infrastructure/redis/services/redis.service';

@Injectable()
export class SessionService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async createSession(user: User, sessionVersion = 1): Promise<void> {
    const key = makeSessionKey(user.id);
    const value = makeSessionUser(user, sessionVersion);

    await this.redisService.set({
      key,
      value,
      ttlSeconds: this.configService.get('SESSION_TTL'),
    });
  }

  async getSession(userId: string): Promise<SessionUserSchema | null> {
    return this.redisService.get(makeSessionKey(userId));
  }
}
