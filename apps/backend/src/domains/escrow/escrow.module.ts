import { EscrowController } from '@domains/escrow/escrow.controller';
import { EscrowService } from '@domains/escrow/escrow.service';
import { EscrowIndexCron } from '@domains/escrow/escrow-index.cron';
import { EscrowIndexerService } from '@domains/escrow/escrow-indexer.service';
import { NotificationsModule } from '@domains/notifications/notifications.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [NotificationsModule],
  controllers: [EscrowController],
  providers: [EscrowService, EscrowIndexerService, EscrowIndexCron],
})
export class EscrowModule {}
