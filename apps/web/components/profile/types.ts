export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  username: string;
  bio: string;
  avatar_url: string;
  phone: string;
  country: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
}

export interface ProfileStatsData {
  reputation_score: number;
  total_trades: number;
  total_volume: number;
  created_at: string;
}

import type { PaymentMethodId } from '@/lib/payment-methods';

export interface PaymentMethodsData {
  preferred_method: PaymentMethodId;
  method_details: Partial<Record<PaymentMethodId, string>>;
  bank_accounts: Array<{
    bank_identifier: string;
    bank_name: string;
    bank_account_holder: string;
  }>;
}

export interface UserData {
  id: string;
  email: string;
  full_name: string;
  username: string;
  bio: string;
  avatar_url: string;
  stellar_address: string;
  phone: string;
  country: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  reputation_score: number;
  total_trades: number;
  total_volume: number;
  created_at: string;
  payment_methods: PaymentMethodsData;
}
