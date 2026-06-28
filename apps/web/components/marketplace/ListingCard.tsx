'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { sileo } from 'sileo';
import { TokenIcon } from '@/components/shared/TokenIcon';
import { TradeTypeBadge } from '@/components/shared/TradeTypeBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useDeleteListing } from '@/hooks/use-listings';
import { formatAmount, formatDate } from '@/lib/dashboard-utils';
import type { MarketplaceListing } from '@/lib/types/marketplace';
import useGlobalAuthenticationStore from '@/store/wallet.store';

interface ListingCardProps {
  listing: MarketplaceListing;
  onTrade: (listing: MarketplaceListing) => void;
}

export function ListingCard({ listing, onTrade }: ListingCardProps) {
  const { address } = useGlobalAuthenticationStore();
  const { user } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteListing = useDeleteListing();

  const isOwnListing =
    listing.seller === address ||
    listing.seller === user?.id ||
    listing.buyer === address ||
    listing.buyer === user?.id;

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await deleteListing.mutateAsync(listing.id);
      sileo.success({ title: 'Listing deleted' });
    } catch {
      sileo.error({ title: 'Failed to delete listing' });
    } finally {
      setConfirmDelete(false);
    }
  };

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
                      {formatAmount(listing.amountRemaining ?? listing.amount)}
                    </h3>
                    <span className="text-xl font-semibold text-muted-foreground">
                      {listing.token}
                    </span>
                    {listing.amountRemaining != null &&
                      listing.amountRemaining < listing.amount && (
                        <span className="text-sm text-muted-foreground">
                          of {formatAmount(listing.amount)} total
                        </span>
                      )}
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
                    <Avatar className="w-10 h-10 rounded-xl border border-border/50">
                      <AvatarImage
                        src={listing.avatarUrl || '/placeholder.svg'}
                        alt={listing.fullName || 'Trader'}
                      />
                      <AvatarFallback className="rounded-xl bg-muted/50 text-xs font-semibold">
                        {(
                          listing.fullName ||
                          (listing.type === 'sell'
                            ? listing.seller
                            : listing.buyer) ||
                          'TR'
                        )
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-muted-foreground">Trader</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm text-foreground break-all">
                          {listing.fullName ||
                            (listing.type === 'sell'
                              ? listing.seller
                              : listing.buyer)}
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
                  {formatAmount(
                    (listing.amountRemaining ?? listing.amount) * listing.rate
                  )}
                </p>
                <p className="text-lg font-semibold text-muted-foreground">
                  {listing.fiatCurrency}
                </p>
              </div>

              <Button
                onClick={() => onTrade(listing)}
                disabled={isOwnListing}
                title={isOwnListing ? 'This is your listing' : ''}
                className="btn-emerald w-full justify-center px-8 py-2 text-base font-semibold sm:w-auto"
              >
                {isOwnListing
                  ? 'Your Listing'
                  : listing.type === 'sell'
                    ? 'Buy Now'
                    : 'Sell Now'}
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

              {isOwnListing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteListing.isPending}
                  className={`gap-2 text-sm ${
                    confirmDelete
                      ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10'
                      : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  {confirmDelete ? 'Confirm delete' : 'Delete listing'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
