export interface MarketplaceListing {
  id: number;
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
