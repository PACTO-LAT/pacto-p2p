import type { Escrow } from '@pacto-p2p/types';
import { supabase } from '@/lib/supabase';
import type { DashboardListing } from '@/lib/types';
import { getTrustlineName } from '@/utils/getTrustline';

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

export interface DbEscrow {
  id: string;
  engagement_id: string;
  contract_id: string | null;
  created_at: string;
  cancelled_at: string | null;
  status: 'active' | 'cancelled' | 'completed' | 'resolved';
  transaction_hashes: EscrowTransactionHashes | null;
}

export interface EscrowPlatformState {
  escrowId: string;
  engagementId: string;
  status: DbEscrow['status'];
  createdAt: string;
  contractId: string | null;
  cancelledAt: string | null;
}

interface RecoveryListingRow {
  id: string;
  rate: number;
  fiat_currency: string;
  payment_method: string;
}

interface RecoveryUserRow {
  id: string;
  stellar_address: string;
}

function inferListingIdFromEngagementId(engagementId: string): string | null {
  const match = engagementId.match(/^(.*)-(\d{13})$/);
  return match?.[1] ?? null;
}

function calculateFiatAmount(amount: number, rate: number): number {
  return Math.round(amount * rate * 100) / 100;
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

  static async getEscrowStatesByEngagementIds(
    engagementIds: string[]
  ): Promise<Map<string, EscrowPlatformState>> {
    if (engagementIds.length === 0) {
      return new Map();
    }

    const { data, error } = await supabase
      .from('escrows')
      .select(
        'id, engagement_id, contract_id, created_at, cancelled_at, status'
      )
      .in('engagement_id', engagementIds);

    if (error) throw new Error(error.message);

    return new Map(
      ((data ?? []) as DbEscrow[]).map((row) => [
        row.engagement_id,
        {
          escrowId: row.id,
          engagementId: row.engagement_id,
          status: row.status,
          createdAt: row.created_at,
          contractId: row.contract_id,
          cancelledAt: row.cancelled_at,
        },
      ])
    );
  }

  static async recoverOrphanedEscrows(escrows: Escrow[]): Promise<boolean> {
    if (escrows.length === 0) {
      return false;
    }

    const engagementIds = escrows.map((escrow) => escrow.engagementId);
    const existingStates =
      await TradesService.getEscrowStatesByEngagementIds(engagementIds);
    const orphanedEscrows = escrows.filter(
      (escrow) => !existingStates.has(escrow.engagementId)
    );

    if (orphanedEscrows.length === 0) {
      return false;
    }

    const listingIds = Array.from(
      new Set(
        orphanedEscrows
          .map((escrow) => inferListingIdFromEngagementId(escrow.engagementId))
          .filter((value): value is string => Boolean(value))
      )
    );
    const stellarAddresses = Array.from(
      new Set(
        orphanedEscrows.flatMap((escrow) => [
          escrow.roles.serviceProvider,
          escrow.roles.approver,
        ])
      )
    );

    const [
      { data: listingRows, error: listingError },
      { data: userRows, error: userError },
    ] = await Promise.all([
      listingIds.length > 0
        ? supabase
            .from('listings')
            .select('id, rate, fiat_currency, payment_method')
            .in('id', listingIds)
        : Promise.resolve({ data: [], error: null }),
      stellarAddresses.length > 0
        ? supabase
            .from('users')
            .select('id, stellar_address')
            .in('stellar_address', stellarAddresses)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (listingError) throw new Error(listingError.message);
    if (userError) throw new Error(userError.message);

    const listingsById = new Map(
      ((listingRows ?? []) as RecoveryListingRow[]).map((row) => [row.id, row])
    );
    const usersByAddress = new Map(
      ((userRows ?? []) as RecoveryUserRow[]).map((row) => [
        row.stellar_address,
        row,
      ])
    );

    for (const escrow of orphanedEscrows) {
      const listingId = inferListingIdFromEngagementId(escrow.engagementId);
      const listing = listingId ? listingsById.get(listingId) : undefined;
      const buyer = usersByAddress.get(escrow.roles.serviceProvider);
      const seller = usersByAddress.get(escrow.roles.approver);

      if (!listing || !buyer || !seller) {
        console.warn(
          'Skipping orphaned escrow recovery due to missing platform data',
          {
            engagementId: escrow.engagementId,
            listingId,
            hasListing: Boolean(listing),
            hasBuyer: Boolean(buyer),
            hasSeller: Boolean(seller),
          }
        );
        continue;
      }

      const fiatAmount = calculateFiatAmount(
        Number(escrow.amount),
        Number(listing.rate)
      );
      const token = getTrustlineName(escrow.trustline.address);

      const { data: escrowRow, error: escrowError } = await supabase
        .from('escrows')
        .upsert(
          {
            listing_id: listing.id,
            buyer_id: buyer.id,
            seller_id: seller.id,
            engagement_id: escrow.engagementId,
            contract_id: escrow.contractId ?? null,
            fiat_amount: fiatAmount,
            status: 'active',
          },
          {
            onConflict: 'engagement_id',
          }
        )
        .select('id')
        .single();

      if (escrowError) {
        throw new Error(escrowError.message);
      }

      const { data: existingTrade, error: tradeLookupError } = await supabase
        .from('trades')
        .select('id')
        .eq('escrow_id', escrowRow.id)
        .maybeSingle();

      if (tradeLookupError) {
        throw new Error(tradeLookupError.message);
      }

      if (!existingTrade) {
        const { error: tradeInsertError } = await supabase
          .from('trades')
          .insert({
            escrow_id: escrowRow.id,
            listing_id: listing.id,
            buyer_id: buyer.id,
            seller_id: seller.id,
            token,
            token_amount: escrow.amount,
            fiat_amount: fiatAmount,
            fiat_currency: listing.fiat_currency,
            rate: listing.rate,
            payment_method: listing.payment_method,
            status: 'active',
          });

        if (tradeInsertError) {
          throw new Error(tradeInsertError.message);
        }
      }
    }

    return true;
  }

  /**
   * Syncs on-chain status back to Supabase for a given engagement ID.
   * Called when TW indicates an escrow is released/resolved but Supabase still shows active.
   */
  static async syncCompletedStatus(engagementId: string): Promise<void> {
    const { data: escrowRow } = await supabase
      .from('escrows')
      .select('id')
      .eq('engagement_id', engagementId)
      .maybeSingle();

    if (!escrowRow?.id) return;

    const completedAt = new Date().toISOString();

    await supabase
      .from('escrows')
      .update({ status: 'completed' })
      .eq('id', escrowRow.id);

    await supabase
      .from('trades')
      .update({ status: 'completed', completed_at: completedAt })
      .eq('escrow_id', escrowRow.id);
  }

  static async cancelUnfundedEscrow(engagementId: string): Promise<void> {
    const escrow = await TradesService.getEscrowByEngagementId(engagementId);

    if (!escrow?.id) {
      throw new Error('Escrow record not found in Supabase.');
    }

    const cancelledAt = new Date().toISOString();
    const { error: escrowUpdateError } = await supabase
      .from('escrows')
      .update({
        status: 'cancelled',
        cancelled_at: cancelledAt,
      })
      .eq('id', escrow.id);

    if (escrowUpdateError) throw new Error(escrowUpdateError.message);

    const trade = await TradesService.getTradeByEscrowId(engagementId);
    if (trade?.id) {
      await TradesService.updateTrade(trade.id, {
        status: 'cancelled',
        completed_at: cancelledAt,
      });
    }
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

    const currentHashes =
      (escrow?.transaction_hashes as EscrowTransactionHashes) ?? {};
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
  static async getTradeByEscrowId(
    engagementId: string
  ): Promise<DbTrade | null> {
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
    status?: DbEscrow['status'];
    created_at?: string;
    cancelled_at?: string | null;
    contract_id?: string | null;
    transaction_hashes: EscrowTransactionHashes | null;
  } | null> {
    const { data, error } = await supabase
      .from('escrows')
      .select(
        'id, status, created_at, cancelled_at, contract_id, transaction_hashes'
      )
      .eq('engagement_id', engagementId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return data as {
      id: string;
      status?: DbEscrow['status'];
      created_at?: string;
      cancelled_at?: string | null;
      contract_id?: string | null;
      transaction_hashes: EscrowTransactionHashes | null;
    } | null;
  }
}
