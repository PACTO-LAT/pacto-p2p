import { StatsModule } from '@domains/platform/stats/stats.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [StatsModule],
})
export class PlatformModule {}
