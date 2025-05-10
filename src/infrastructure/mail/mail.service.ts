import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailInputSchema } from '@/infrastructure/mail/__defs__';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(input: SendMailInputSchema) {
    const { to, context, template, subject } = input;

    await this.mailerService.sendMail({
      to,
      subject,
      template,
      context,
    });
  }
}
