export interface Token {
  symbol: string;
  name: string;
  totalSupply: number;
  circulating: number;
  issuer: string;
  status: 'active' | 'supported' | 'inactive';
}

export interface Transaction {
  id: string;
  type: 'mint' | 'burn';
  token: string;
  amount: number;
  recipient: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface PlatformStats {
  totalUsers: number;
  activeListings: number;
  totalVolume: number;
  completedTrades: number;
}

export interface MintFormData {
  token: string;
  amount: string;
  recipient: string;
  memo: string;
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
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    created_at: string;
  };
}
