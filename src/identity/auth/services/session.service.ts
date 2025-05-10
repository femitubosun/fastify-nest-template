import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { makeSessionKey, makeSessionUser } from '../utils/session.utils';
import { SessionUserSchema } from '../__defs__';

import { User } from '@/infrastructure/prisma/__defs__';
import { RedisService } from '@/infrastructure/redis/services/redis.service';

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

  async initializeSession(user: User) {
    const sessionVersion = 1;
    await this.createSession(user, sessionVersion);

    return sessionVersion;
  }

  async invalidateSession(userId: string): Promise<void> {
    const key = makeSessionKey(userId);
    await this.redisService.delete(key);
  }

  async refreshSession(user: User): Promise<number> {
    const currentSession = await this.getSession(user.id);
    const newVersion = (currentSession?.sessionVersion || 1) + 1;
    await this.createSession(user, newVersion);
    return newVersion;
  }
}
