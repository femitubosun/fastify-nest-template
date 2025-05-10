import bullMqConfig from '@/config/bull-mq';
import { QueueService } from '@/infrastructure/queue/queue.service';
import { FastifyAdapter } from '@bull-board/fastify';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QNames } from './__defs__/queue.dto';
import { SendMailProcessor } from './notification/send-mail.processor';
import { registerAllNamedQueues } from './utils';

@Module({
  imports: [
    BullModule.forRoot({
      connection: bullMqConfig,
    }),
    BullBoardModule.forRoot({
      route: '/management/queues',
      adapter: FastifyAdapter,
      // middleware: (req, res, next) => {
      //   fastifyBasicAuth({
      //     validate: async (username, password, req, reply) => {
      //       const validUsername = process.env.ADMIN_USERNAME;
      //       const validPassword = process.env.ADMIN_PASSWORD;
      //       if (username === validUsername && password === validPassword) {
      //         return;
      //       }
      //       reply.code(401).send({ error: 'Unauthorized' });
      //     },
      //   })(req, res, next);
      // },
    }),
    ...registerAllNamedQueues(QNames),
  ],
  providers: [QueueService, SendMailProcessor],
  exports: [QueueService],
})
export class QueueModule {}
