import { DisputesModule } from '@domains/platform/disputes/disputes.module';
import { DisputeSlaCron } from '@domains/platform/jobs/dispute-sla.cron';
import { StatsReconcileCron } from '@domains/platform/jobs/stats-reconcile.cron';
import { StatsModule } from '@domains/platform/stats/stats.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [StatsModule, DisputesModule],
  providers: [StatsReconcileCron, DisputeSlaCron],
})
export class JobsModule {}
