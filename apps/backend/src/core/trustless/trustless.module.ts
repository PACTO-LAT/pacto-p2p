import { TrustlessIndexerService } from '@core/trustless/trustless-indexer.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [TrustlessIndexerService],
  exports: [TrustlessIndexerService],
})
export class TrustlessModule {}
