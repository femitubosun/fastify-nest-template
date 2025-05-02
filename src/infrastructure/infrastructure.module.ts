import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CryptoModule } from '@infra/crypto/crypto.module';

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
  ],
  exports: [PrismaModule, RedisModule, CryptoModule],
})
export class InfrastructureModule {}
