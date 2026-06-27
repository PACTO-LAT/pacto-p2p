import { HealthModule } from '@core/health/health.module';
import { SupabaseModule } from '@core/supabase/supabase.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [SupabaseModule, HealthModule],
})
export class CoreModule {}
