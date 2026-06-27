import { DisputesService } from '@domains/platform/disputes/disputes.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [DisputesService],
  exports: [DisputesService],
})
export class DisputesModule {}
