import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QNames } from '../__defs__/queue.dto';

@Processor(QNames.sendMail)
export class SendMailProcessor extends WorkerHost {
  process(job: Job<any, any, string>): any {
    console.log(job.data);
  }
}
