import { EmailService } from '@core/email/email.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
