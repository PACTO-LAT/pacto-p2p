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
