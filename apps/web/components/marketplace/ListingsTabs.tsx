"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MarketplaceListing } from "@/lib/types/marketplace";
import { ListingCard } from "./ListingCard";

interface ListingsTabsProps {
  listings: MarketplaceListing[];
  onTrade: (listing: MarketplaceListing) => void;
}

interface GenericEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export const GenericEmptyState: React.FC<GenericEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <Card className="glass-card">
    <CardContent className="p-12 text-center">
      <div className="w-16 h-16 bg-muted/50 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center glow-emerald">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {action && <div>{action}</div>}
    </CardContent>
  </Card>
);

const EmptyState: React.FC<{ type: "buy" | "sell" }> = ({ type }) => {
  const title = type === "buy" ? "No buy orders yet" : "No sell orders yet";
  const description =
    type === "buy"
      ? "There are no active buy orders in the marketplace."
      : "There are no active sell orders in the marketplace.";

  const action = (
    <Button asChild>
      <Link href="/dashboard/listings/create" className="gap-2">
        <Plus className="w-4 h-4" />
        Create Listing
      </Link>
    </Button>
  );

  return (
    <GenericEmptyState
      icon={<ShoppingCart className="w-8 h-8 text-muted-foreground" />}
      title={title}
      description={description}
      action={action}
    />
  );
};

interface ListingGridProps {
  listings: MarketplaceListing[];
  onTrade: (listing: MarketplaceListing) => void;
}

const ListingGrid: React.FC<ListingGridProps> = ({ listings, onTrade }) => (
  <div className="grid gap-6">
    {listings.map((listing) => (
      <ListingCard key={listing.id} listing={listing} onTrade={onTrade} />
    ))}
  </div>
);

export function ListingsTabs({ listings, onTrade }: ListingsTabsProps) {
  const buyListings = listings.filter((l) => l.type === "buy");
  const sellListings = listings.filter((l) => l.type === "sell");

  return (
    <Tabs defaultValue="buy" className="space-y-6">
      <TabsList className="glass-card bg-white/80 backdrop-blur-sm border border-white/30 p-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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

      <TabsContent value="buy" className="space-y-6">
        {buyListings.length === 0 ? (
          <EmptyState type="buy" />
        ) : (
          <ListingGrid listings={buyListings} onTrade={onTrade} />
        )}
      </TabsContent>

      <TabsContent value="sell" className="space-y-6">
        {sellListings.length === 0 ? (
          <EmptyState type="sell" />
        ) : (
          <ListingGrid listings={sellListings} onTrade={onTrade} />
        )}
      </TabsContent>
    </Tabs>
  );
}
