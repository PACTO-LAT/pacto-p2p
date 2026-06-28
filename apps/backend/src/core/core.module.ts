import { EmailModule } from '@core/email/email.module';
import { HealthModule } from '@core/health/health.module';
import { SupabaseModule } from '@core/supabase/supabase.module';
import { TrustlessModule } from '@core/trustless/trustless.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [SupabaseModule, HealthModule, TrustlessModule, EmailModule],
})
export class CoreModule {}
