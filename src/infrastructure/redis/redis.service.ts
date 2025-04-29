import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType } from 'redis';

interface SetOptions {
  ttlSeconds?: number;
  key: string;
  value: string;
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly client: RedisClientType,
  ) {}

  async set(input: SetOptions) {
    const { ttlSeconds, key, value } = input;

    if (ttlSeconds) {
      await this.client.set(key, value, { EX: ttlSeconds });
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async delete(key: string) {
    return this.client.del(key);
  }

  async *scan(pattern = '*') {
    const iterator = this.client.scanIterator({ MATCH: pattern });
    for await (const key of iterator) {
      yield key;
    }
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }
}
