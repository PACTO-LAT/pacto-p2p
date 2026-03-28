import { supabase } from '@/lib/supabase';
import type { DashboardListing } from '@/lib/types';

export interface DbTrade {
  id: string;
  token: string;
  token_amount: number;
  fiat_amount: number;
  fiat_currency: string;
  rate: number;
  payment_method: string;
  stellar_transaction_hash: string | null;
  status: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string | null;
  created_at: string;
}

export interface EscrowTransactionHashes {
  init?: string | null;
  fund?: string | null;
  report?: string | null;
  release?: string | null;
  dispute?: string | null;
}

function mapTradeToDashboardListing(
  trade: DbTrade,
  currentUserId: string
): DashboardListing {
  const isBuyer = trade.buyer_id === currentUserId;
  return {
    id: trade.id,
    type: isBuyer ? 'buy' : 'sell',
    token: trade.token,
    amount: Number(trade.token_amount),
    rate: Number(trade.rate),
    fiatCurrency: trade.fiat_currency,
    status: trade.status,
    created: trade.created_at,
    paymentMethod: trade.payment_method,
  };
}

// biome-ignore lint/complexity/noStaticOnlyClass: Service class pattern
export class TradesService {
  static async getUserTrades(userId: string): Promise<DashboardListing[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const trades = (data as DbTrade[]) ?? [];
    return trades.map((t) => mapTradeToDashboardListing(t, userId));
  }

  /**
   * Updates the transaction hash for a specific escrow action
   */
  static async updateEscrowTransactionHash(
    escrowId: string,
    action: keyof EscrowTransactionHashes,
    txHash: string
  ): Promise<void> {
    // Get current transaction hashes
    const { data: escrow, error: fetchError } = await supabase
      .from('escrows')
      .select('transaction_hashes')
      .eq('id', escrowId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const currentHashes = (escrow?.transaction_hashes as EscrowTransactionHashes) ?? {};
    const updatedHashes = { ...currentHashes, [action]: txHash };

    // Update the escrow with new transaction hash
    const { error: updateError } = await supabase
      .from('escrows')
      .update({ transaction_hashes: updatedHashes })
      .eq('id', escrowId);

    if (updateError) throw new Error(updateError.message);
  }

  /**
   * Updates the trade status and optionally the transaction hash
   */
  static async updateTrade(
    tradeId: string,
    updates: {
      status?: string;
      stellar_transaction_hash?: string | null;
      completed_at?: string;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', tradeId);

    if (error) throw new Error(error.message);
  }

  /**
   * Gets a trade by engagement ID (via escrow lookup)
   */
  static async getTradeByEscrowId(engagementId: string): Promise<DbTrade | null> {
    const { data: escrow, error: escrowError } = await supabase
      .from('escrows')
      .select('id')
      .eq('engagement_id', engagementId)
      .single();

    if (escrowError && escrowError.code !== 'PGRST116') {
      throw new Error(escrowError.message);
    }

    if (!escrow) return null;

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('escrow_id', escrow.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return data as DbTrade | null;
  }

  /**
   * Gets an escrow by engagement ID
   */
  static async getEscrowByEngagementId(engagementId: string): Promise<{
    id: string;
    transaction_hashes: EscrowTransactionHashes | null;
  } | null> {
    const { data, error } = await supabase
      .from('escrows')
      .select('id, transaction_hashes')
      .eq('engagement_id', engagementId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return data as { id: string; transaction_hashes: EscrowTransactionHashes | null } | null;
  }
}
