import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QNames } from '../__defs__/queue.dto';
import { MailService } from '@/infrastructure/mail/mail.service';
import { SendMailInputSchema } from '@/infrastructure/mail/__defs__';

@Processor(QNames.sendMail)
export class SendMailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<SendMailInputSchema, any, string>) {
    await this.mailService.sendMail(job.data);
  }
}
