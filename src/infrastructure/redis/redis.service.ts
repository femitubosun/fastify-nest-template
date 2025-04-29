import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType } from 'redis';

interface SetOptions {
  ttlSeconds?: number;
  key: string;
  value: unknown;
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly client: RedisClientType,
  ) {}

  async set(input: SetOptions) {
    const { ttlSeconds, key, value } = input;
    const serializedValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    if (ttlSeconds) {
      await this.client.set(key, serializedValue, { EX: ttlSeconds });
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
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
