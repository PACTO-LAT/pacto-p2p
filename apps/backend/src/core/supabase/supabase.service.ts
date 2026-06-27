import { Injectable, type OnModuleInit } from '@nestjs/common';
// ConfigService must be a value import: NestJS DI relies on the runtime
// constructor metadata emitted by emitDecoratorMetadata.
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private _client!: SupabaseClient;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const url = this.config.getOrThrow<string>('SUPABASE_URL');
    const key = this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
    this._client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  get client(): SupabaseClient {
    return this._client;
  }
}
