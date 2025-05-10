import { Injectable } from '@nestjs/common';
import { QueueService } from '@/infrastructure/queue/queue.service';
import {
  MailTemplates,
  SendMailInputSchema,
  SendWelcomeMailInputSchema,
} from '@/infrastructure/mail/__defs__';
import { QNames } from '@/infrastructure/queue/__defs__/queue.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailDispatcherService {
  #defaultFromEmail: string;

  constructor(
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
  ) {
    this.#defaultFromEmail =
      this.configService.get<string>('DEFAULT_EMAIL_FROM') || '';
  }

  async sendWelcomeMail(input: SendWelcomeMailInputSchema) {
    const { otp, firstName, email } = input;

    const { subject, template } = MailTemplates.welcome;

    await this.queueService.addToQueue<SendMailInputSchema>({
      queueName: QNames.sendMail,
      data: {
        to: email,
        subject,
        template,
        from: this.#defaultFromEmail,
        context: {
          firstName,
          otp,
        },
      },
    });
  }
}
