'use client';

import { FC, ReactNode } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { MarketplaceListing } from '@/lib/types/marketplace';
import { ListingCard } from './ListingCard';

interface ListingsTabsProps {
  listings: MarketplaceListing[];
  onTrade: (listing: MarketplaceListing) => void;
}

interface GenericEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  iconContainerClassName?: string;
}

export const GenericEmptyState: React.FC<GenericEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  iconContainerClassName = '',
}) => (
  <Card className="rounded-xl border border-border/50 bg-card/60">
    <CardContent className="p-12 text-center">
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {action && <div>{action}</div>}
    </CardContent>
  </Card>
);

const EmptyState: FC<{ type: 'buy' | 'sell' }> = ({ type }) => {
  const title = type === 'buy' ? 'No buy orders yet' : 'No sell orders yet';
  const description =
    type === 'buy'
      ? 'There are no active buy orders in the marketplace.'
      : 'There are no active sell orders in the marketplace.';

  return (
    <GenericEmptyState
      icon={<ShoppingCart className="w-8 h-8 text-muted-foreground" />}
      title={title}
      description={description}
      iconContainerClassName="glow-emerald"
    />
  );
};

interface ListingGridProps {
  listings: MarketplaceListing[];
  onTrade: (listing: MarketplaceListing) => void;
}

const ListingGrid: FC<ListingGridProps> = ({ listings, onTrade }) => (
  <div className="grid gap-6">
    {listings.map((listing) => (
      <ListingCard key={listing.id} listing={listing} onTrade={onTrade} />
    ))}
  </div>
);

export function ListingsTabs({ listings, onTrade }: ListingsTabsProps) {
  if (listings.length === 0) {
    return <EmptyState type="buy" />;
  }

  return <ListingGrid listings={listings} onTrade={onTrade} />;
}
