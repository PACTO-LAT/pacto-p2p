'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCreateEscrow } from '@/hooks/use-escrows';
import useGlobalAuthenticationStore from '@/store/wallet.store';
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
import { useAuth } from '@/hooks/use-auth';
import { AuthService } from '@/lib/services/auth';
import { supabase } from '@/lib/supabase';

// Helper function to check if a string is a valid Stellar address
const isValidStellarAddress = (address: string): boolean => {
  return /^G[A-Z0-9]{55}$/.test(address);
};

export default function ListingsPage() {
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

  const filteredListings = filterListings(listings, filters);
  const marketStats = getMarketStats(listings);

  const handleTrade = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setOpen(true);
  };

  const confirmTrade = async () => {
    if (!selectedListing) return;

    // Get current user's wallet address
    const currentUserAddress = address || user?.stellar_address;
    
    if (!currentUserAddress) {
      toast.error('Please connect your wallet to proceed with the trade');
      return;
    }

    if (!isValidStellarAddress(currentUserAddress)) {
      toast.error('Invalid wallet address. Please reconnect your wallet.');
      return;
    }

    if (!selectedListing.seller) {
      toast.error('Invalid listing: seller address is missing');
      return;
    }

    // Get the listing creator's Stellar address
    let listingCreatorAddress = selectedListing.seller;
    
    // If seller is not a valid Stellar address (might be UUID or email), fetch it
    if (!isValidStellarAddress(listingCreatorAddress)) {
      try {
        // Try to fetch user by ID (if it's a UUID)
        // UUIDs are typically in format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingCreatorAddress);
        
        if (isUUID) {
          const listingUser = await AuthService.getUserProfile(listingCreatorAddress).catch(() => null);
          if (listingUser?.stellar_address) {
            listingCreatorAddress = listingUser.stellar_address;
          } else {
            toast.error('Listing creator does not have a Stellar wallet address linked. They need to connect their wallet first.');
            return;
          }
        } else {
          // If it's an email or other identifier, query users table by email
          const { data: userData, error: queryError } = await supabase
            .from('users')
            .select('stellar_address')
            .eq('email', listingCreatorAddress)
            .maybeSingle();
          
          if (queryError && queryError.code !== 'PGRST116') {
            // PGRST116 means no rows found, which is fine - we'll handle it below
            throw queryError;
          }
          
          if (userData?.stellar_address) {
            listingCreatorAddress = userData.stellar_address;
          } else {
            toast.error('Listing creator does not have a Stellar wallet address linked. They need to connect their wallet first.');
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching listing creator address:', error);
        toast.error('Failed to get listing creator wallet address. Please ensure they have linked their wallet.');
        return;
      }
    }

    if (!isValidStellarAddress(listingCreatorAddress)) {
      toast.error('Listing creator does not have a valid Stellar wallet address');
      return;
    }

    // Determine seller and buyer based on listing type
    // If listing type is "sell": listing creator is seller, current user is buyer
    // If listing type is "buy": current user is seller, listing creator is buyer
    const seller_id = selectedListing.type === 'sell' 
      ? listingCreatorAddress 
      : currentUserAddress;
    const buyer_id = selectedListing.type === 'sell'
      ? currentUserAddress
      : listingCreatorAddress;

    mutate({
      listing: {
        ...selectedListing,
        fiat_currency: selectedListing.fiatCurrency,
        payment_method: selectedListing.paymentMethod,
      },
      amount: selectedListing.amount,
      buyer_id,
      seller_id,
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
