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

export interface Listing {
  id: string;
  user_id: string;
  type: "buy" | "sell";
  token: string;
  amount: number;
  rate: number;
  fiat_currency: string;
  payment_method: string;
  min_amount?: number;
  max_amount?: number;
  description?: string;
  status: "active" | "paused" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  user?: User;
}

interface CreatedAt {
  _seconds: number;
  _nanoseconds: number;
}

type UpdatedAt = CreatedAt;

export interface Escrow {
  signer?: string;
  contractId?: string;
  engagementId: string;
  title: string;
  roles: Roles;
  description: string;
  amount: number;
  platformFee: number;
  balance?: number;
  milestones: SingleReleaseMilestone[];
  flags?: Flags;
  trustline: Trustline & { name: string };
  receiverMemo?: number;
  disputeStartedBy?: string;
  fundedBy?: string;
  isActive?: boolean;
  approverFunds?: string;
  receiverFunds?: string;
  user: string;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
  type: EscrowType;
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
