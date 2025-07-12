export interface User {
  id: string
  email: string
  stellar_address?: string
  reputation_score: number
  total_trades: number
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  user_id: string
  type: "buy" | "sell"
  token: string
  amount: number
  rate: number
  fiat_currency: string
  payment_method: string
  min_amount?: number
  max_amount?: number
  description?: string
  status: "active" | "paused" | "completed" | "cancelled"
  created_at: string
  updated_at: string
  user?: User
}

export interface Escrow {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  token: string
  amount: number
  fiat_amount: number
  fiat_currency: string
  status: "created" | "awaiting_payment" | "payment_confirmed" | "completed" | "disputed" | "cancelled"
  trustless_work_contract_id?: string
  payment_receipt_url?: string
  created_at: string
  updated_at: string
  buyer?: User
  seller?: User
  listing?: Listing
  milestones?: EscrowMilestone[]
}

export interface EscrowMilestone {
  id: string
  escrow_id: string
  milestone_number: number
  name: string
  status: "pending" | "completed" | "failed"
  completed_at?: string
  created_at: string
}

export interface TokenOperation {
  id: string
  operation_type: "mint" | "burn"
  token: string
  amount: number
  stellar_address: string
  transaction_hash?: string
  memo?: string
  status: "pending" | "completed" | "failed"
  created_by: string
  created_at: string
}

export interface CreateListingData {
  type: "buy" | "sell"
  token: string
  amount: number
  rate: number
  fiat_currency: string
  payment_method: string
  min_amount?: number
  max_amount?: number
  description?: string
}

export interface CreateEscrowData {
  listing_id: string
  buyer_id: string
  seller_id: string
  token: string
  amount: number
  fiat_amount: number
  fiat_currency: string
}
