import { Injectable, Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type EmailSendStatus = 'sent' | 'failed' | 'skipped';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  isEnabled(): boolean {
    return !!this.config.get<string>('RESEND_API_KEY');
  }

  async send(input: SendEmailInput): Promise<{ status: EmailSendStatus }> {
    const apiKey = this.config.get<string>('RESEND_API_KEY', '');
    if (!apiKey) {
      return { status: 'skipped' };
    }
    const from = this.config.get<string>(
      'EMAIL_FROM',
      'Pacto <no-reply@pacto.app>'
    );
    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });
      if (error) {
        this.logger.error(`email send failed: ${error.message}`);
        return { status: 'failed' };
      }
      return { status: 'sent' };
    } catch (err) {
      this.logger.error(`email send threw: ${(err as Error).message}`);
      return { status: 'failed' };
    }
  }
}
