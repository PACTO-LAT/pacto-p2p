import { ReputationModule } from '@domains/platform/reputation/reputation.module';
import { StatsController } from '@domains/platform/stats/stats.controller';
import { StatsService } from '@domains/platform/stats/stats.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [ReputationModule],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
