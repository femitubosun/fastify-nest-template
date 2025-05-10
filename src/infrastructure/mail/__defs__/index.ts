import { z } from 'zod';

export const SendMailInputSchema = z.object({
  to: z.string().email(),
  from: z.string().email(),
  subject: z.string(),
  template: z.string(),
  context: z.record(z.string(), z.any()),
});

export type SendMailInputSchema = z.infer<typeof SendMailInputSchema>;

export const SendWelcomeMailInputSchema = z.object({
  email: z.string(),
  firstName: z.string(),
  otp: z.string(),
});

export type SendWelcomeMailInputSchema = z.infer<
  typeof SendWelcomeMailInputSchema
>;

export const MailTemplates = {
  welcome: {
    subject: 'Welcome to App',
    template: 'confirmation',
  },
  passwordReset: {
    subject: 'Reset Your Password',
    template: 'reset-password',
  },
} as const;

export type MailTemplateType = keyof typeof MailTemplates;
