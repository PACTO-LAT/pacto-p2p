// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SupabaseService } from '@core/supabase/supabase.service';
import { Injectable } from '@nestjs/common';

export interface DisputeRow {
  created_at: string;
  trade_chats: {
    escrow_id: string | null;
    buyer_id: string | null;
    seller_id: string | null;
    escrows: { status: string; engagement_id: string } | null;
  } | null;
}

export interface OverdueDispute {
  escrowId: string;
  engagementId: string;
  buyerId: string | null;
  sellerId: string | null;
  disputeRaisedAt: string;
  hoursOpen: number;
}

const HOUR_MS = 3_600_000;

export function selectOverdue(
  rows: DisputeRow[],
  now: number,
  thresholdHours: number
): OverdueDispute[] {
  const out: OverdueDispute[] = [];
  for (const r of rows) {
    const chat = r.trade_chats;
    const escrow = chat?.escrows;
    if (!chat || !escrow || !chat.escrow_id) {
      continue;
    }
    if (escrow.status !== 'active') {
      continue; // resolved / cancelled / completed = not an open dispute
    }
    const raisedMs = Date.parse(r.created_at);
    if (Number.isNaN(raisedMs)) {
      continue;
    }
    const hoursOpen = (now - raisedMs) / HOUR_MS;
    if (hoursOpen <= thresholdHours) {
      continue;
    }
    out.push({
      escrowId: chat.escrow_id,
      engagementId: escrow.engagement_id,
      buyerId: chat.buyer_id,
      sellerId: chat.seller_id,
      disputeRaisedAt: r.created_at,
      hoursOpen: Math.round(hoursOpen * 100) / 100,
    });
  }
  return out;
}

@Injectable()
export class DisputesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findOverdueDisputes(
    now: number,
    thresholdHours: number
  ): Promise<OverdueDispute[]> {
    const cutoffIso = new Date(now - thresholdHours * HOUR_MS).toISOString();
    const { data, error } = await this.supabase.client
      .from('trade_messages')
      .select(
        'created_at, metadata, trade_chats!inner(escrow_id, buyer_id, seller_id, escrows!inner(status, engagement_id))'
      )
      .eq('message_type', 'system')
      .eq('metadata->>event', 'dispute_raised')
      .lte('created_at', cutoffIso);
    if (error) {
      throw new Error(`Failed to load disputes: ${error.message}`);
    }
    return selectOverdue(
      (data ?? []) as unknown as DisputeRow[],
      now,
      thresholdHours
    );
  }
}
