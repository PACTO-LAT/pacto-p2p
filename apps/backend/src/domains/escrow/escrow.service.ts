// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SupabaseService } from '@core/supabase/supabase.service';
import { Injectable } from '@nestjs/common';

const ESCROW_COLUMNS =
  'id, engagement_id, contract_id, status, fiat_amount, balance, token_amount, on_chain_flags, on_chain_status, last_indexed_at, buyer_id, seller_id, listing_id, created_at, updated_at';

@Injectable()
export class EscrowService {
  constructor(private readonly supabase: SupabaseService) {}

  async getEscrowsForUser(userId: string): Promise<unknown[]> {
    const { data, error } = await this.supabase.client
      .from('escrows')
      .select(ESCROW_COLUMNS)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) {
      throw new Error(`Failed to load escrows for ${userId}: ${error.message}`);
    }
    return data ?? [];
  }
}
