import type { User } from '@/lib/types';
import type { DbListing } from '@/lib/types/db';
import type {
  ListingFilters,
  MarketplaceListing,
} from '@/lib/types/marketplace';

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

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function getMarketStats(listings: MarketplaceListing[]) {
  const now = Date.now();
  const ms7d = 7 * 24 * 60 * 60 * 1000;
  const ms24h = 24 * 60 * 60 * 1000;

  // Split listings by age
  const thisWeek = listings.filter(
    (l) => now - new Date(l.created).getTime() < ms7d
  );
  const lastWeek = listings.filter((l) => {
    const age = now - new Date(l.created).getTime();
    return age >= ms7d && age < ms7d * 2;
  });

  const last24h = listings.filter(
    (l) => now - new Date(l.created).getTime() < ms24h
  );
  const prev24h = listings.filter((l) => {
    const age = now - new Date(l.created).getTime();
    return age >= ms24h && age < ms24h * 2;
  });

  const totalValue = listings.reduce((sum, l) => sum + l.amount * l.rate, 0);
  const last24hValue = last24h.reduce((sum, l) => sum + l.amount * l.rate, 0);
  const prev24hValue = prev24h.reduce((sum, l) => sum + l.amount * l.rate, 0);

  const avgCurrent = listings.length > 0 ? totalValue / listings.length : 0;
  const avgLastWeek =
    lastWeek.length > 0
      ? lastWeek.reduce((sum, l) => sum + l.amount * l.rate, 0) /
        lastWeek.length
      : 0;

  return {
    activeListings: listings.length,
    totalVolume24h: totalValue,
    avgTradeSize: avgCurrent,
    activeListingsChange: pctChange(thisWeek.length, lastWeek.length),
    volumeChange: pctChange(last24hValue, prev24hValue),
    tradeSizeChange: pctChange(avgCurrent, avgLastWeek),
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
    seller:
      listing.seller_address ||
      user?.stellar_address ||
      user?.email ||
      listing.user_id,
    buyer: '',
    reputation: user?.reputation_score ?? 0,
    trades: user?.total_trades ?? 0,
    created: listing.created_at,
    status: listing.status,
    description: listing.description || '',
    avatarUrl: user?.avatar_url,
    fullName: user?.full_name,
    amountRemaining:
      listing.amount_remaining != null
        ? Number(listing.amount_remaining)
        : Number(listing.amount),
    creatorUserId: listing.user_id,
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
  sellerAddress?: string; // connected wallet address at listing creation time
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

  const totalFiat = amount * rate;
  const minAmount = input.minAmount ? Number.parseFloat(input.minAmount) : 0;
  const maxAmount = input.maxAmount
    ? Number.parseFloat(input.maxAmount)
    : totalFiat;

  return {
    type: input.type,
    token: input.token,
    amount,
    rate,
    fiat_currency: input.fiatCurrency,
    payment_method: input.paymentMethod,
    min_amount: minAmount,
    max_amount: maxAmount,
    description: input.description?.trim() || undefined,
    seller_address: input.sellerAddress || undefined,
  };
}
