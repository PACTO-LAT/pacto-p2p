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
  sellerName?: string;
  buyerName?: string;
  sellerAvatarUrl?: string;
  buyerAvatarUrl?: string;
  reputation: number;
  trades: number;
  created: string;
  status: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  terms?: Array<{
    type: 'positive' | 'negative';
    text: string;
  }>;
}

export interface MarketStats {
  activeListings: number;
  totalVolume24h: number;
  avgTradeSize: number;
  activeListingsChange: number;
  volumeChange: number;
  tradeSizeChange: number;
}

export interface ListingFilters {
  searchTerm: string;
  selectedToken: string;
  selectedType: string;
}
