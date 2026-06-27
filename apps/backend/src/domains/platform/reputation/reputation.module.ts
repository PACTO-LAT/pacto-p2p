import { ReputationService } from '@domains/platform/reputation/reputation.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [ReputationService],
  exports: [ReputationService],
})
export class ReputationModule {}
