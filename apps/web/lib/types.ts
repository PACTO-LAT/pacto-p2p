// Trustless Work types imported for future use
// import {
//   EscrowType,
//   Flags,
//   Roles,
//   SingleReleaseMilestone,
//   Trustline,
// } from "@trustless-work/escrow";

export interface User {
  id: string;
  email: string;
  stellar_address?: string;
  reputation_score: number;
  total_trades: number;
  total_volume?: number;
  full_name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  country?: string;
  kyc_status?: 'pending' | 'verified' | 'rejected';
  notifications?: {
    email_trades: boolean;
    email_escrows: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
  };
  security?: {
    two_factor_enabled: boolean;
    login_notifications: boolean;
  };
  payment_methods?: {
    sinpe_number?: string;
    bank_iban?: string;
    bank_name?: string;
    bank_account_holder?: string;
    preferred_method?: 'sinpe' | 'bank_transfer';
  };
  created_at: string;
  updated_at: string;
}

export interface EscrowMilestone {
  id: string;
  escrow_id: string;
  milestone_number: number;
  name: string;
  status: 'pending' | 'completed' | 'failed';
  completed_at?: string;
  created_at: string;
}

export interface TokenOperation {
  id: string;
  operation_type: 'mint' | 'burn';
  token: string;
  amount: number;
  stellar_address: string;
  transaction_hash?: string;
  memo?: string;
  status: 'pending' | 'completed' | 'failed';
  created_by: string;
  created_at: string;
}

export interface CreateListingData {
  type: 'buy' | 'sell';
  token: string;
  amount: number;
  rate: number;
  fiatCurrency: string;
  paymentMethod: string;
  min_amount?: number;
  max_amount?: number;
  description?: string;
}

export interface CreateEscrowData {
  listing: CreateListingData; // Using the existing CreateListingData interface
  buyer_id: string;
  seller_id: string;
  token: string;
  amount: number;
  fiat_amount: number;
  fiat_currency: string;
}

// Dashboard UI Types
export interface DashboardListing {
  id: string;
  type: 'sell' | 'buy';
  token: string;
  amount: number;
  rate: number;
  fiatCurrency: string;
  status: string;
  created: string;
  seller?: string;
  buyer?: string;
  description?: string;
  paymentMethod?: string;
}

export interface DashboardEscrow {
  id: string;
  type: 'sell' | 'buy';
  token: string;
  amount: number;
  buyer?: string;
  seller?: string;
  status: string;
  progress: number;
  created: string;
}

export interface MarketplaceListing {
  id: string;
  type: 'sell' | 'buy';
  token: string;
  amount: number;
  rate: number;
  fiatCurrency: string;
  paymentMethod: string;
  seller: string;
  buyer: string;
  reputation: number;
  trades: number;
  created: string;
  status: string;
  description: string;
}

export type DialogType = 'receipt' | 'dispute' | null;

// Token types
export type MarketplaceToken = 'USDC' | 'USDT' | 'XLM';

export type MarketplaceListingType = 'buy' | 'sell';

export type Listing = {
  id: string;
  type: 'sell' | 'buy';
  token: string;
  amount: number;
  rate: number;
  fiatCurrency: string;
  paymentMethod: string;
  seller: string;
  buyer: string;
  reputation: number;
  trades: number;
  created: string;
  status: string;
  description: string;
};
