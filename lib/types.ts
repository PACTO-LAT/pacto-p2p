import {
  EscrowType,
  Flags,
  Roles,
  SingleReleaseMilestone,
  Trustline,
} from "@trustless-work/escrow";

export interface User {
  id: string;
  email: string;
  stellar_address?: string;
  reputation_score: number;
  total_trades: number;
  created_at: string;
  updated_at: string;
}



export interface EscrowMilestone {
  id: string;
  escrow_id: string;
  milestone_number: number;
  name: string;
  status: "pending" | "completed" | "failed";
  completed_at?: string;
  created_at: string;
}

export interface TokenOperation {
  id: string;
  operation_type: "mint" | "burn";
  token: string;
  amount: number;
  stellar_address: string;
  transaction_hash?: string;
  memo?: string;
  status: "pending" | "completed" | "failed";
  created_by: string;
  created_at: string;
}

export interface CreateListingData {
  type: "buy" | "sell";
  token: string;
  amount: number;
  rate: number;
  fiat_currency: string;
  payment_method: string;
  min_amount?: number;
  max_amount?: number;
  description?: string;
}

export interface CreateEscrowData {
  listing: any; // todo: add listing interface
  buyer_id: string;
  seller_id: string;
  token: string;
  amount: number;
  fiat_amount: number;
  fiat_currency: string;
}

// Dashboard UI Types
export interface DashboardListing {
  id: number;
  type: "sell" | "buy";
  token: string;
  amount: number;
  rate: number;
  fiatCurrency: string;
  status: string;
  created: string;
}

export interface DashboardEscrow {
  id: string;
  type: "sell" | "buy";
  token: string;
  amount: number;
  buyer?: string;
  seller?: string;
  status: string;
  progress: number;
  created: string;
}

export type DialogType = "receipt" | "dispute" | null;

export interface TradeCardProps {
  trade: DashboardListing | DashboardEscrow;
  variant: "listing" | "escrow";
  onAction?: (trade: DashboardListing | DashboardEscrow, action: string) => void;
  onOpenDialog?: (trade: DashboardListing | DashboardEscrow, type: "receipt" | "dispute") => void;
}
