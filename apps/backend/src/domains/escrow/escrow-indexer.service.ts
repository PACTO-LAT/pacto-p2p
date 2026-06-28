// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SupabaseService } from '@core/supabase/supabase.service';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { TrustlessIndexerService } from '@core/trustless/trustless-indexer.service';
import { toEscrowPatch } from '@domains/escrow/escrow-mapper';
import { detectEscrowTransition } from '@domains/notifications/escrow-transition';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { NotificationsService } from '@domains/notifications/notifications.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EscrowIndexerService {
  private readonly logger = new Logger(EscrowIndexerService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly indexer: TrustlessIndexerService,
    private readonly notifications: NotificationsService
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

      // Read prior state to detect a transition (and to resolve the parties).
      const { data: existing } = await this.supabase.client
        .from('escrows')
        .select('id, on_chain_status, buyer_id, seller_id')
        .eq('engagement_id', escrow.engagementId)
        .maybeSingle();
      if (!existing) {
        unmatched += 1;
        continue; // web owns row creation; we only enrich existing rows
      }

      // Crash-safe: notify BEFORE writing the new status (re-index re-detects
      // until the status write lands; NotificationsService dedups via UNIQUE).
      const transition = detectEscrowTransition(
        existing.on_chain_status,
        patch.on_chain_status
      );
      if (transition?.kind === 'escrow_released') {
        await this.notifications.onEscrowReleased({
          escrowId: existing.id,
          buyerId: existing.buyer_id,
          sellerId: existing.seller_id,
          engagementId: escrow.engagementId,
          amount: patch.token_amount,
        });
      }

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
