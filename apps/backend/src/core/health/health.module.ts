import { HealthController } from '@core/health/health.controller';
import { SupabaseHealthIndicator } from '@core/health/supabase.health';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [SupabaseHealthIndicator],
})
export class HealthModule {}
