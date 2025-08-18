import { MarketplaceListing, ListingFilters } from '@/lib/types/marketplace';

export function filterListings(
  listings: MarketplaceListing[],
  filters: ListingFilters
): MarketplaceListing[] {
  return listings.filter((listing) => {
    const matchesSearch =
      listing.token.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      listing.fiatCurrency.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesToken =
      filters.selectedToken === 'all' || listing.token === filters.selectedToken;
    const matchesType = filters.selectedType === 'all' || listing.type === filters.selectedType;

    return matchesSearch && matchesToken && matchesType;
  });
}

export function getMarketStats(listings: MarketplaceListing[]) {
  const totalVolume24h = listings.reduce((sum, listing) => {
    return sum + (listing.amount * listing.rate);
  }, 0);

  const avgTradeSize = listings.length > 0 ? totalVolume24h / listings.length : 0;

  return {
    activeListings: listings.length,
    totalVolume24h,
    avgTradeSize,
    activeListingsChange: 12, // Mock data - in real app this would come from API
    volumeChange: 8, // Mock data
    tradeSizeChange: -3, // Mock data
  };
}
