'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreateEscrow } from '@/hooks/use-escrows';
import { useCrossmint } from '@/hooks/use-crossmint';
import {
  ListingsTabs,
  MarketplaceFilters,
  MarketStats,
  TradeConfirmationDialog,
} from '@/components/marketplace';
import type {
  MarketplaceListing,
  ListingFilters,
} from '@/lib/types/marketplace';
import { filterListings, getMarketStats } from '@/lib/marketplace-utils';
import { useMarketplaceListings } from '@/hooks/use-listings';

export default function ListingsPage() {
  const [filters, setFilters] = useState<ListingFilters>({
    searchTerm: '',
    selectedToken: 'all',
    selectedType: 'all',
  });
  const [selectedListing, setSelectedListing] =
    useState<MarketplaceListing | null>(null);
  const [open, setOpen] = useState(false);
  // const { address } = useGlobalAuthenticationStore();
  const handleCloseModal = () => {
    setOpen(false);
    setSelectedListing(null);
  };

  const { mutate, isPending } = useCreateEscrow(handleCloseModal);
  const { walletAddress } = useCrossmint();

  const { data: listings = [], isLoading } = useMarketplaceListings({
    token: filters.selectedToken === 'all' ? undefined : filters.selectedToken,
    type:
      filters.selectedType === 'all'
        ? undefined
        : (filters.selectedType as 'buy' | 'sell'),
    status: 'active',
  });

  const filteredListings = filterListings(listings, filters);
  const marketStats = getMarketStats(listings);

  const handleTrade = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setOpen(true);
  };

  const confirmTrade = () => {
    if (!selectedListing) return;

    console.log('🎯 confirmTrade button clicked');
    console.log('📝 Selected listing:', selectedListing);
    console.log('👤 Current wallet address:', walletAddress);

    mutate({
      listing: {
        ...selectedListing,
        fiatCurrency: selectedListing.fiatCurrency,
        paymentMethod: selectedListing.paymentMethod,
      },
      amount: selectedListing.amount,
      buyer_id: walletAddress || '', // Use current user as buyer
      seller_id: selectedListing.seller,
      token: selectedListing.token,
      fiat_amount: selectedListing.amount * selectedListing.rate,
      fiat_currency: selectedListing.fiatCurrency,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Listings</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Browse and trade stablecoins in stellar network
          </p>
        </div>
        <Link href="/dashboard/listings/create">
          <Button className="btn-emerald">
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </Link>
      </div>

      {/* Market Stats */}
      <MarketStats stats={marketStats} />

      {/* Filters */}
      <MarketplaceFilters filters={filters} onFiltersChange={setFilters} />

      {/* Listings */}
      {isLoading ? (
        <div className="text-muted-foreground">Loading listings...</div>
      ) : (
        <ListingsTabs listings={filteredListings} onTrade={handleTrade} />
      )}

      {/* Trade Confirmation Dialog */}
      <TradeConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        selectedListing={selectedListing}
        onConfirm={confirmTrade}
        isPending={isPending}
      />
    </div>
  );
}
