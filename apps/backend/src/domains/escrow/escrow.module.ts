import { EscrowController } from '@domains/escrow/escrow.controller';
import { EscrowService } from '@domains/escrow/escrow.service';
import { EscrowIndexCron } from '@domains/escrow/escrow-index.cron';
import { EscrowIndexerService } from '@domains/escrow/escrow-indexer.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [EscrowController],
  providers: [EscrowService, EscrowIndexerService, EscrowIndexCron],
})
export class EscrowModule {}
