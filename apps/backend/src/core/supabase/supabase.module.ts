import { SupabaseService } from '@core/supabase/supabase.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
