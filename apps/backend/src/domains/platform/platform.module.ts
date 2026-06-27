import { JobsModule } from '@domains/platform/jobs/jobs.module';
import { StatsModule } from '@domains/platform/stats/stats.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [StatsModule, JobsModule],
})
export class PlatformModule {}
