import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatAmount, formatCurrency, formatDate } from '@/lib/dashboard-utils';
import type { DashboardListing } from '@/lib/types';

interface ListingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: DashboardListing | null;
}

export function ListingDetailsDialog({ open, onOpenChange, listing }: ListingDetailsDialogProps) {
  const creatorAddress = listing
    ? listing.type === 'sell'
      ? listing.seller
      : listing.buyer
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-gradient">Listing Details</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Detailed information about this listing.
          </DialogDescription>
        </DialogHeader>

        {listing && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Listing ID</p>
                <p className="font-medium">{listing.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(listing.created)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{listing.type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Token</p>
                <p className="font-medium">{formatAmount(listing.amount)} {listing.token}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rate</p>
                <p className="font-medium">{listing.rate} {listing.fiatCurrency}/{listing.token}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="font-medium">{formatCurrency(listing.amount * listing.rate, listing.fiatCurrency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{listing.status.replace('_', ' ')}</p>
              </div>
              {listing.paymentMethod && (
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{listing.paymentMethod}</p>
                </div>
              )}
            </div>

            {creatorAddress && (
              <div>
                <p className="text-xs text-muted-foreground">Created by</p>
                <p className="font-mono text-xs bg-muted/50 backdrop-blur-sm px-2 py-1 rounded break-all">{creatorAddress}</p>
              </div>
            )}

            {listing.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground/90">{listing.description}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


