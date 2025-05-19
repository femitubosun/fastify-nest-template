import { Injectable } from '@nestjs/common';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { RedisService } from './infrastructure/cache/services/redis.service';

@Injectable()
export class AppService {
  constructor(
    private prismaService: PrismaService,
    private cacheService: RedisService,
  ) {}

  async getHello() {
    const cacheKey = 'hello';
    const cacheValue = await this.cacheService.get(cacheKey);

    if (cacheValue) {
      console.log('cache hit');
      return cacheValue;
    }

    const data = ['some things'];

    console.log('cache miss');
    return data;
  }
}
