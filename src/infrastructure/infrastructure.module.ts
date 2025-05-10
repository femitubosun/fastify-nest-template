import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CryptoModule } from './crypto/crypto.module';
import { QueueModule } from './queue/queue.module';
import { MailModule } from './mail/mail.module';

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
    MailModule,
  ],
  exports: [PrismaModule, RedisModule, CryptoModule, QueueModule, MailModule],
})
export class InfrastructureModule {}
