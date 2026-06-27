import { SkipAuth } from '@common/decorators/skip-auth.decorator';
// SupabaseHealthIndicator must be a value import: NestJS DI relies on the runtime
// constructor metadata emitted by emitDecoratorMetadata.
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SupabaseHealthIndicator } from '@core/health/supabase.health';
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
// HealthCheckService must be a value import: NestJS DI relies on the runtime
// constructor metadata emitted by emitDecoratorMetadata.
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly supabaseIndicator: SupabaseHealthIndicator
  ) {}

  @Get()
  @SkipAuth()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.supabaseIndicator.isHealthy('supabase'),
    ]);
  }
}
