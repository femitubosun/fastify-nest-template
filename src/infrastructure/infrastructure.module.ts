import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CryptoModule } from '@infra/crypto/crypto.module';

@Global()
@Module({
  imports: [PrismaModule, RedisModule, CryptoModule],
  exports: [PrismaModule, RedisModule],
})
export class InfrastructureModule {}
