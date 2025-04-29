import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Global()
@Module({
  imports: [PrismaModule, RedisModule],
  exports: [PrismaModule, RedisModule],
})
export class InfrastructureModule {}
