'use client';

import { FC, ReactNode } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { MarketplaceListing } from '@/lib/types/marketplace';
import { ListingCard } from './ListingCard';

interface ListingsTabsProps {
  listings: MarketplaceListing[];
  onTrade: (listing: MarketplaceListing) => void;
  canCreateListing?: boolean;
  onCreateListing?: () => void;
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
  <Card className="glass-card">
    <CardContent className="p-12 text-center">
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {action && <div>{action}</div>}
    </CardContent>
  </Card>
);

const EmptyState: FC<{
  type: 'buy' | 'sell';
  canCreateListing?: boolean;
  onCreateListing?: () => void;
}> = ({ type, canCreateListing, onCreateListing }) => {
  const title = type === 'buy' ? 'No buy orders yet' : 'No sell orders yet';
  const description =
    type === 'buy'
      ? 'There are no active buy orders in the marketplace.'
      : 'There are no active sell orders in the marketplace.';

  const action = canCreateListing ? (
    <Button className="btn-emerald gap-2" onClick={onCreateListing}>
      <Plus className="w-4 h-4" />
      Create Listing
    </Button>
  ) : undefined;

  return (
    <GenericEmptyState
      icon={<ShoppingCart className="w-8 h-8 text-muted-foreground" />}
      title={title}
      description={description}
      action={action}
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

export function ListingsTabs({
  listings,
  onTrade,
  canCreateListing,
  onCreateListing,
}: ListingsTabsProps) {
  const buyListings = listings.filter((l) => l.type === 'buy');
  const sellListings = listings.filter((l) => l.type === 'sell');

  return (
    <Tabs defaultValue="buy" className="space-y-6">
      <TabsList className="inline-flex h-auto p-1 bg-muted/30 backdrop-blur-sm rounded-lg border border-border/50 gap-1">
        <TabsTrigger
          value="buy"
          className="bg-card/60 hover:bg-card/80 active:bg-card/90 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-emerald-600 transition-all duration-200 rounded-md px-4 py-1.5 text-sm font-medium border border-transparent cursor-pointer whitespace-nowrap"
        >
          Buy Orders ({buyListings.length})
        </TabsTrigger>
        <TabsTrigger
          value="sell"
          className="bg-card/60 hover:bg-card/80 active:bg-card/90 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-emerald-600 transition-all duration-200 rounded-md px-4 py-1.5 text-sm font-medium border border-transparent cursor-pointer whitespace-nowrap"
        >
          Sell Orders ({sellListings.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="buy" className="space-y-6">
        {buyListings.length === 0 ? (
          <EmptyState
            type="buy"
            canCreateListing={canCreateListing}
            onCreateListing={onCreateListing}
          />
        ) : (
          <ListingGrid listings={buyListings} onTrade={onTrade} />
        )}
      </TabsContent>

      <TabsContent value="sell" className="space-y-6">
        {sellListings.length === 0 ? (
          <EmptyState
            type="sell"
            canCreateListing={canCreateListing}
            onCreateListing={onCreateListing}
          />
        ) : (
          <ListingGrid listings={sellListings} onTrade={onTrade} />
        )}
      </TabsContent>
    </Tabs>
  );
}
