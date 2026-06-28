// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SupabaseService } from '@core/supabase/supabase.service';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { TrustlessIndexerService } from '@core/trustless/trustless-indexer.service';
import { toEscrowPatch } from '@domains/escrow/escrow-mapper';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EscrowIndexerService {
  private readonly logger = new Logger(EscrowIndexerService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly indexer: TrustlessIndexerService
  ) {}

  async indexAll(): Promise<{ indexed: number; unmatched: number }> {
    if (!this.indexer.isConfigured()) {
      this.logger.warn(
        'TLW not configured (TLW_API_KEY/PLATFORM_ROLE_ADDRESS); skipping escrow indexing'
      );
      return { indexed: 0, unmatched: 0 };
    }
    const escrows = await this.indexer.getPlatformEscrows();
    const now = Date.now();
    let indexed = 0;
    let unmatched = 0;
    for (const escrow of escrows) {
      if (!escrow.engagementId) {
        continue;
      }
      const patch = toEscrowPatch(escrow, now);
      const { error } = await this.supabase.client
        .from('escrows')
        .update({ ...patch, updated_at: new Date(now).toISOString() })
        .eq('engagement_id', escrow.engagementId);
      if (error) {
        this.logger.error(
          `index ${escrow.engagementId} failed: ${error.message}`
        );
        unmatched += 1;
      } else {
        indexed += 1;
      }
    }
    this.logger.log(
      `escrow index done indexed=${indexed} unmatched=${unmatched}`
    );
    return { indexed, unmatched };
  }
}
