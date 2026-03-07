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
}
