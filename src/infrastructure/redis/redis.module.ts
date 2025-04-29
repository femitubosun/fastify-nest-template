import { Module, DynamicModule, Provider } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisService as RedisService } from './redis.service';

export interface RedisModuleOptions {
  url: string;
}

@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions): DynamicModule {
    const redisProvider: Provider = {
      provide: 'FATE_REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({ url: options.url });
        client.on('error', (err) => console.error('Redis Client Error', err));

        await client.connect();
        return client;
      },
    };
    return {
      module: RedisModule,
      providers: [redisProvider],
      exports: [redisProvider],
    };
  }

  static forRootAsync(options: {
    useFactory: (
      ...args: any[]
    ) => Promise<RedisModuleOptions> | RedisModuleOptions;
    inject?: any[];
  }): DynamicModule {
    const asyncRedisProvider: Provider = {
      provide: 'REDIS_CLIENT',
      useFactory: async (...args: any[]) => {
        const opts = await options.useFactory(...args);
        const client = createClient({ url: opts.url });
        client.on('error', (err) => console.error('Redis Client Error', err));
        await client.connect();
        return client;
      },
      inject: options.inject || [],
    };

    return {
      module: RedisModule,
      providers: [asyncRedisProvider, RedisService],
      exports: [RedisService],
    };
  }
}
