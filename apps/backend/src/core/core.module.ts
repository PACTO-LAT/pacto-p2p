import { SupabaseModule } from '@core/supabase/supabase.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [SupabaseModule],
})
export class CoreModule {}
