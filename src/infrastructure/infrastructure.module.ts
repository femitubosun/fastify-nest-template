import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CryptoModule } from './crypto/crypto.module';
import { QueueModule } from './queue/queue.module';

@Global()
@Module({
  imports: [
    PrismaModule,
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        url: configService.get<string>('CACHE_URL')!,
      }),
      inject: [ConfigService],
    }),
    CryptoModule,
    QueueModule,
  ],
  exports: [PrismaModule, RedisModule, CryptoModule, QueueModule],
})
export class InfrastructureModule {}
