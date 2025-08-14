export type MerchantVerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'revoked';

export type Merchant = {
  id: string;
  slug: string;
  display_name: string;
  is_public: boolean;
  verification_status: MerchantVerificationStatus;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  location?: string;
  languages?: string[];
  socials?: { twitter?: string; telegram?: string; website?: string };
  rating: number;
  total_trades: number;
  volume_traded: number; // 30d or lifetime; we’ll show clearly which
};

export type MerchantBadge = {
  id: string;
  code: string; // 'verified-kyc','100-trades','sbt-merchant-v1'
  title: string;
  description?: string;
  icon_url?: string;
  earned_at: string;
  kind: 'sbt' | 'nft' | 'programmatic';
};

export type MerchantKpis = {
  total_trades: number;
  completed_trades: number;
  disputed_trades: number;
  completion_rate_pct: number;
  dispute_rate_pct: number;
  volume_30d: number;
  median_release_minutes: number | null;
};

export type MerchantListing = {
  id: string;
  side: 'buy' | 'sell';
  asset_code: string;
  price_rate: number;
  quote_currency: string;
  amount: number;
  min_amount?: number;
  max_amount?: number;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  created_at: string;
  payment_methods?: Array<{
    method: string;
    details?: Record<string, unknown>;
  }>;
};

export type VolumePoint = { d: string; volume: number };
export type SpeedBucket = { bucketLabel: string; count: number };
