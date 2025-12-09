'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MarketplaceListing } from '@/lib/types/marketplace';
import { ListingCard } from './ListingCard';

interface ListingsTabsProps {
  listings: MarketplaceListing[];
  onTrade: (listing: MarketplaceListing) => void;
}

export function ListingsTabs({ listings, onTrade }: ListingsTabsProps) {
  const buyListings = listings.filter((l) => l.type === 'buy');
  const sellListings = listings.filter((l) => l.type === 'sell');

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="glass-card bg-white/80 backdrop-blur-sm border border-white/30 p-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <TabsTrigger
          value="all"
          className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 w-full sm:w-auto"
        >
          All Listings ({listings.length})
        </TabsTrigger>
        <TabsTrigger
          value="buy"
          className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 w-full sm:w-auto"
        >
          Buy Orders ({buyListings.length})
        </TabsTrigger>
        <TabsTrigger
          value="sell"
          className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 w-full sm:w-auto"
        >
          Sell Orders ({sellListings.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <div className="grid gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onTrade={onTrade} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="buy" className="space-y-6">
        <div className="grid gap-6">
          {buyListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onTrade={onTrade} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="sell" className="space-y-6">
        <div className="grid gap-6">
          {sellListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onTrade={onTrade} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
