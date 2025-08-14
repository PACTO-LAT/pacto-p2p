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
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <TradeTypeBadge type={listing.type} className="mb-3" />
                <TokenIcon token={listing.token} size="lg" />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <h3 className="text-3xl font-bold text-foreground">
                      {formatAmount(listing.amount)}
                    </h3>
                    <span className="text-xl font-semibold text-muted-foreground">
                      {listing.token}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground font-medium">
                        Exchange Rate
                      </p>
                      <p className="text-foreground font-semibold">
                        {listing.rate} {listing.fiatCurrency}/{listing.token}
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

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Trader</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-foreground">
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

            <div className="flex flex-col items-end gap-4">
              <div className="text-right">
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
                className="btn-emerald px-8 py-2 text-base font-semibold"
              >
                {listing.type === 'sell' ? 'Buy Now' : 'Sell Now'}
              </Button>
            </div>
          </div>

          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-between">
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
