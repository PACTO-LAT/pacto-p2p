import type { User } from '@/lib/types';

export interface DbListing {
  id: string;
  user_id: string;
  type: 'buy' | 'sell';
  token: string;
  amount: number;
  rate: number;
  fiat_currency: string;
  payment_method: string;
  min_amount?: number | null;
  max_amount?: number | null;
  description?: string | null;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  user?: User | null;
}
