import type { MarketplaceListing, ListingFilters } from '@/lib/types/marketplace';
import type { DbListing } from '@/lib/types/db';
import type { User } from '@/lib/types';

export function filterListings(
  listings: MarketplaceListing[],
  filters: ListingFilters
): MarketplaceListing[] {
  return listings.filter((listing) => {
    const matchesSearch =
      listing.token.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      listing.fiatCurrency
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase());
    const matchesToken =
      filters.selectedToken === 'all' ||
      listing.token === filters.selectedToken;
    const matchesType =
      filters.selectedType === 'all' || listing.type === filters.selectedType;

    return matchesSearch && matchesToken && matchesType;
  });
}

export function getMarketStats(listings: MarketplaceListing[]) {
  const totalVolume24h = listings.reduce((sum, listing) => {
    return sum + listing.amount * listing.rate;
  }, 0);

  const avgTradeSize =
    listings.length > 0 ? totalVolume24h / listings.length : 0;

  return {
    activeListings: listings.length,
    totalVolume24h,
    avgTradeSize,
    activeListingsChange: 12, // Mock data - in real app this would come from API
    volumeChange: 8, // Mock data
    tradeSizeChange: -3, // Mock data
  };
}

export function mapDbListingToMarketplace(
  listing: DbListing
): MarketplaceListing {
  const user = listing.user as unknown as User | null;
  return {
    id: listing.id,
    type: listing.type,
    token: listing.token,
    amount: Number(listing.amount),
    rate: Number(listing.rate),
    fiatCurrency: listing.fiat_currency,
    paymentMethod: listing.payment_method,
    seller: user?.stellar_address || user?.email || listing.user_id,
    buyer: '',
    reputation: user?.reputation_score ?? 0,
    trades: user?.total_trades ?? 0,
    created: listing.created_at,
    status: listing.status,
    description: listing.description || '',
  };
}

export type UIListingFormInput = {
  type: 'buy' | 'sell';
  token: string; // token code like USDC/CRCX
  amount: string; // numeric string
  rate: string; // numeric string
  fiatCurrency: string;
  paymentMethod: string;
  minAmount?: string;
  maxAmount?: string;
  description?: string;
};

export function toCreateListingData(input: UIListingFormInput) {
  const amount = Number.parseFloat(input.amount || '0');
  const rate = Number.parseFloat(input.rate || '0');

  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  if (rate <= 0) {
    throw new Error('Rate must be greater than 0');
  }

  return {
    type: input.type,
    token: input.token,
    amount,
    rate,
    fiat_currency: input.fiatCurrency,
    payment_method: input.paymentMethod,
    min_amount: input.minAmount
      ? Number.parseFloat(input.minAmount)
      : undefined,
    max_amount: input.maxAmount
      ? Number.parseFloat(input.maxAmount)
      : undefined,
    description: input.description?.trim() || undefined,
  };
}
