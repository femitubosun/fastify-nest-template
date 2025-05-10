import bullMqConfig from '@/config/bullmq';
import { QueueService } from '@/infrastructure/queue/queue.service';
import { FastifyAdapter } from '@bull-board/fastify';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QNames } from './__defs__/queue.dto';
import { SendMailProcessor } from './notification/send-mail.processor';
import { registerAllNamedQueues } from './utils';

@Module({
  imports: [
    BullModule.forRoot({
      connection: bullMqConfig,
    }),
    BullBoardModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        route:
          configService.get<string>('BULLMQ_DASHBOARD_ROUTE') ||
          '/admin/queues',
        adapter: FastifyAdapter,
      }),
      inject: [ConfigService],
    }),
    ...registerAllNamedQueues(QNames),
  ],
  providers: [QueueService, SendMailProcessor],
  exports: [QueueService],
})
export class QueueModule {}
