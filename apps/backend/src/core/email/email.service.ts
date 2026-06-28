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
  private readonly resend: Resend | null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY', '');
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  isEnabled(): boolean {
    return this.resend !== null;
  }

  async send(input: SendEmailInput): Promise<{ status: EmailSendStatus }> {
    if (this.resend === null) {
      return { status: 'skipped' };
    }
    const from = this.config.get<string>(
      'EMAIL_FROM',
      'Pacto <no-reply@pacto.app>'
    );
    try {
      const { error } = await this.resend.emails.send({
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
