'use client';

import { BaseTradeCard } from '@/components/shared/BaseTradeCard';
import type { MarketplaceListing } from '@/lib/types/marketplace';

interface ListingCardProps {
  listing: MarketplaceListing;
  onTrade: (listing: MarketplaceListing) => void;
}

export function ListingCard({ listing, onTrade }: ListingCardProps) {
  return (
    <BaseTradeCard
      trade={listing}
      variant="marketplace"
      onTrade={onTrade}
      showActions={false}
      showProgress={false}
    />
  );
}
