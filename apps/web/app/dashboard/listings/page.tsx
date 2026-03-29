'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { sileo } from 'sileo';
import {
  ListingsTabs,
  MarketplaceFilters,
  MarketStats,
  TradeConfirmationDialog,
} from '@/components/marketplace';
import { Button } from '@/components/ui/button';
import { useCreateEscrow } from '@/hooks/use-escrows';
import { useAuth } from '@/hooks/use-auth';
import { useMarketplaceListings } from '@/hooks/use-listings';
import { filterListings, getMarketStats } from '@/lib/marketplace-utils';
import { useMerchantStatus } from '@/hooks/useMerchant';
import { CreateListingModal } from '@/components/merchant/CreateListingModal';
import type {
  ListingFilters,
  MarketplaceListing,
} from '@/lib/types/marketplace';
import useGlobalAuthenticationStore from '@/store/wallet.store';

// Helper function to check if a string is a valid Stellar address
const isValidStellarAddress = (address: string): boolean => {
  return /^G[A-Z0-9]{55}$/.test(address);
};

export default function ListingsPage() {
  const { isVerifiedMerchant } = useMerchantStatus();
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState<ListingFilters>({
    searchTerm: '',
    selectedToken: 'all',
    selectedType: 'all',
  });
  const [selectedListing, setSelectedListing] =
    useState<MarketplaceListing | null>(null);
  const [open, setOpen] = useState(false);
  const { address } = useGlobalAuthenticationStore();
  const { user } = useAuth();
  const handleCloseModal = () => {
    setOpen(false);
    setSelectedListing(null);
  };

  const { mutate, isPending } = useCreateEscrow(handleCloseModal);

  const { data: listings = [], isLoading } = useMarketplaceListings({
    token: filters.selectedToken === 'all' ? undefined : filters.selectedToken,
    type:
      filters.selectedType === 'all'
        ? undefined
        : (filters.selectedType as 'buy' | 'sell'),
    status: 'active',
  });

  // Fetch all listings regardless of status for accurate stats calculation
  const { data: allListings = [] } = useMarketplaceListings({ status: 'all' });

  const filteredListings = filterListings(listings, filters);
  const marketStats = getMarketStats(allListings);

  const handleTrade = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setOpen(true);
  };

  const confirmTrade = async ({
    fiatAmount,
    cryptoAmount,
    paymentMethod,
  }: {
    fiatAmount: number;
    cryptoAmount: number;
    paymentMethod: string;
  }) => {
    if (!selectedListing) return;

    // Validate amount is within listing bounds
    const minAmount = selectedListing.minAmount || 0;
    const availableAmount = selectedListing.amountRemaining ?? selectedListing.amount;
    const maxAvailable =
      selectedListing.maxAmount != null
        ? Math.min(selectedListing.maxAmount, availableAmount * selectedListing.rate)
        : availableAmount * selectedListing.rate;

    if (fiatAmount < minAmount || fiatAmount > maxAvailable) {
      sileo.error({
        title: `Amount must be between ${minAmount} and ${maxAvailable} ${selectedListing.fiatCurrency}`,
      });
      return;
    }

    // Wallet address comes from the connected wallet store
    const currentUserAddress = address;

    if (!currentUserAddress) {
      sileo.error({
        title: 'Please connect your wallet to proceed with the trade',
      });
      return;
    }

    if (!isValidStellarAddress(currentUserAddress)) {
      sileo.error({
        title: 'Invalid wallet address. Please reconnect your wallet.',
      });
      return;
    }

    // Listing creator's address is stored on the listing at creation time
    const listingCreatorAddress = selectedListing.seller;

    if (!listingCreatorAddress || !isValidStellarAddress(listingCreatorAddress)) {
      sileo.error({
        title: 'This listing does not have a valid Stellar wallet address. The creator needs to recreate it with a connected wallet.',
      });
      return;
    }

    // Determine seller and buyer based on listing type
    // If listing type is "sell": listing creator is seller, current user is buyer
    // If listing type is "buy": current user is seller, listing creator is buyer
    const seller_id =
      selectedListing.type === 'sell'
        ? listingCreatorAddress
        : currentUserAddress;
    const buyer_id =
      selectedListing.type === 'sell'
        ? currentUserAddress
        : listingCreatorAddress;

    if (seller_id === buyer_id) {
      sileo.error({ title: 'You cannot trade against your own listing' });
      return;
    }

    mutate({
      listing: {
        ...selectedListing,
        fiat_currency: selectedListing.fiatCurrency,
        payment_method: paymentMethod,
      },
      amount: cryptoAmount,
      buyer_id,
      seller_id,
      buyer_uuid: selectedListing.type === 'sell' ? user?.id : selectedListing.creatorUserId,
      seller_uuid: selectedListing.type === 'sell' ? selectedListing.creatorUserId : user?.id,
      token: selectedListing.token,
      fiat_amount: fiatAmount,
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
        {isVerifiedMerchant && (
          <Button className="btn-emerald" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        )}
      </div>

      {/* Market Stats */}
      <MarketStats stats={marketStats} />

      {/* Filters */}
      <MarketplaceFilters filters={filters} onFiltersChange={setFilters} />

      {/* Listings */}
      {isLoading ? (
        <div className="text-muted-foreground">Loading listings...</div>
      ) : (
        <ListingsTabs
          listings={filteredListings}
          onTrade={handleTrade}
        />
      )}

      {/* Trade Confirmation Dialog */}
      <TradeConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        selectedListing={selectedListing}
        onConfirm={confirmTrade}
        isPending={isPending}
      />

      {/* Create Listing Modal */}
      <CreateListingModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => setCreateOpen(false)}
      />
    </div>
  );
}
