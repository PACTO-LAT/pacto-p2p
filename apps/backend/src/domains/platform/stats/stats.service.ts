// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SupabaseService } from '@core/supabase/supabase.service';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ReputationService } from '@domains/platform/reputation/reputation.service';
import {
  summarizeTrades,
  type TradeRow,
} from '@domains/platform/stats/trade-summary';
import { Injectable } from '@nestjs/common';

export interface UserStats {
  reputation_score: number;
  total_trades: number;
  total_volume: number;
}
export interface MerchantStats {
  rating: number;
  total_trades: number;
  volume_traded: number;
  completion_rate: number;
  dispute_rate: number;
}

const TRADE_COLUMNS =
  'status, fiat_amount, fiat_amount_usd, fiat_currency, completed_at, buyer_id, seller_id';

@Injectable()
export class StatsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly reputation: ReputationService
  ) {}

  async recomputeForUser(userId: string): Promise<UserStats> {
    const { data: trades, error } = await this.supabase.client
      .from('trades')
      .select(TRADE_COLUMNS)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
    if (error) {
      throw new Error(
        `Failed to load trades for user ${userId}: ${error.message}`
      );
    }
    const summary = summarizeTrades((trades ?? []) as TradeRow[], Date.now());
    const stats: UserStats = {
      reputation_score: this.reputation.score(summary),
      total_trades: summary.completed,
      total_volume: summary.volume,
    };
    const { error: updErr } = await this.supabase.client
      .from('users')
      .update({ ...stats, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (updErr) {
      throw new Error(`Failed to update user ${userId}: ${updErr.message}`);
    }

    await this.recomputeMerchantForUser(userId);
    return stats;
  }

  private async recomputeMerchantForUser(userId: string): Promise<void> {
    const { data: merchant } = await this.supabase.client
      .from('merchants')
      .select('id, user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (!merchant) {
      return;
    }
    const { data: trades, error } = await this.supabase.client
      .from('trades')
      .select(TRADE_COLUMNS)
      .eq('seller_id', userId); // merchant = seller role only
    if (error) {
      throw new Error(
        `Failed to load merchant trades for ${userId}: ${error.message}`
      );
    }
    const summary = summarizeTrades((trades ?? []) as TradeRow[], Date.now());
    const { completionRate, disputeRate } = this.reputation.rates(summary);
    const merchantStats: MerchantStats = {
      rating: this.reputation.score(summary),
      total_trades: summary.completed,
      volume_traded: summary.volume,
      completion_rate: completionRate,
      dispute_rate: disputeRate,
    };
    const { error: updErr } = await this.supabase.client
      .from('merchants')
      .update({ ...merchantStats, updated_at: new Date().toISOString() })
      .eq('id', merchant.id);
    if (updErr) {
      throw new Error(
        `Failed to update merchant ${merchant.id}: ${updErr.message}`
      );
    }
  }

  async recomputeForUsers(userIds: string[]): Promise<UserStats[]> {
    const unique = [...new Set(userIds)];
    const results: UserStats[] = [];
    for (const id of unique) {
      results.push(await this.recomputeForUser(id));
    }
    return results;
  }

  async recomputeAll(): Promise<{ users: number }> {
    const pageSize = 500;
    let from = 0;
    let count = 0;
    for (;;) {
      const { data, error } = await this.supabase.client
        .from('users')
        .select('id')
        .range(from, from + pageSize - 1);
      if (error) {
        throw new Error(`Failed to page users: ${error.message}`);
      }
      const rows = data ?? [];
      for (const row of rows as Array<{ id: string }>) {
        await this.recomputeForUser(row.id);
        count += 1;
      }
      if (rows.length < pageSize) {
        break;
      }
      from += pageSize;
    }
    return { users: count };
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    const { data } = await this.supabase.client
      .from('users')
      .select('reputation_score, total_trades, total_volume')
      .eq('id', userId)
      .maybeSingle();
    if (!data) {
      return null;
    }
    return {
      reputation_score: Number(data.reputation_score ?? 0),
      total_trades: Number(data.total_trades ?? 0),
      total_volume: Number(data.total_volume ?? 0),
    };
  }

  async getMerchantStats(merchantId: string): Promise<MerchantStats | null> {
    const { data } = await this.supabase.client
      .from('merchants')
      .select(
        'rating, total_trades, volume_traded, completion_rate, dispute_rate'
      )
      .eq('id', merchantId)
      .maybeSingle();
    if (!data) {
      return null;
    }
    return {
      rating: Number(data.rating ?? 0),
      total_trades: Number(data.total_trades ?? 0),
      volume_traded: Number(data.volume_traded ?? 0),
      completion_rate: Number(data.completion_rate ?? 0),
      dispute_rate: Number(data.dispute_rate ?? 0),
    };
  }
}
