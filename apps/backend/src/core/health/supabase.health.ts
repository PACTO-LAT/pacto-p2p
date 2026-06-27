// SupabaseService must be a value import: NestJS DI relies on the runtime
// constructor metadata emitted by emitDecoratorMetadata.
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SupabaseService } from '@core/supabase/supabase.service';
import { Injectable } from '@nestjs/common';
import type { HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class SupabaseHealthIndicator {
  constructor(private readonly supabase: SupabaseService) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const { error } = await this.supabase.client
        .from('merchants')
        .select('id', { head: true, count: 'estimated' })
        .limit(1);
      if (error) {
        return { [key]: { status: 'down', message: error.message } };
      }
      return { [key]: { status: 'up' } };
    } catch (e) {
      return { [key]: { status: 'down', message: (e as Error).message } };
    }
  }
}
