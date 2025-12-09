'use client';

import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TokenIcon } from '@/components/shared/TokenIcon';
import { TradeTypeBadge } from '@/components/shared/TradeTypeBadge';
import { formatAmount, formatDate } from '@/lib/dashboard-utils';
import { MarketplaceListing } from '@/lib/types/marketplace';

interface ListingCardProps {
  listing: MarketplaceListing;
  onTrade: (listing: MarketplaceListing) => void;
}

export function ListingCard({ listing, onTrade }: ListingCardProps) {
  return (
    <Card className="card hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-fade-in">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex flex-col items-center sm:items-center">
                <TradeTypeBadge type={listing.type} className="mb-3" />
                <TokenIcon token={listing.token} size="lg" />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-3">
                    <h3 className="text-3xl font-bold text-foreground">
                      {formatAmount(listing.amount)}
                    </h3>
                    <span className="text-xl font-semibold text-muted-foreground">
                      {listing.token}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground font-medium">
                        Exchange Rate
                      </p>
                      <p className="text-foreground font-semibold">
                        {Number(listing.rate).toFixed(2)} {listing.fiatCurrency}
                        /{listing.token}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">
                        Payment Method
                      </p>
                      <p className="text-foreground font-semibold">
                        {listing.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Trader</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm text-foreground break-all">
                          {listing.type === 'sell'
                            ? listing.seller
                            : listing.buyer}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs bg-yellow-50/80 backdrop-blur-sm text-yellow-700 border-yellow-200/50"
                        >
                          ⭐ {listing.reputation} ({listing.trades})
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 rounded-lg bg-muted/30 p-4 sm:w-auto sm:items-end sm:bg-transparent sm:p-0 sm:text-right">
              <div className="text-left sm:text-right">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Value
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {formatAmount(listing.amount * listing.rate)}
                </p>
                <p className="text-lg font-semibold text-muted-foreground">
                  {listing.fiatCurrency}
                </p>
              </div>

              <Button
                onClick={() => onTrade(listing)}
                className="btn-emerald w-full justify-center px-8 py-2 text-base font-semibold sm:w-auto"
              >
                {listing.type === 'sell' ? 'Buy Now' : 'Sell Now'}
              </Button>
            </div>
          </div>

          <div className="border-t border-border/50 pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Active
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Published: {formatDate(listing.created)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
