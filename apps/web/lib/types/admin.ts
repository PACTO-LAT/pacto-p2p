export interface PlatformStats {
  totalUsers: number;
  activeListings: number;
  totalVolume: number;
  completedTrades: number;
}

export interface MerchantApplication {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'revoked';
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  location?: string;
  languages?: string[];
  socials?: Record<string, string>;
  rating: number;
  total_trades: number;
  volume_traded: number;
  status_message?: string;
  status_updated_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    created_at: string;
  };
}
