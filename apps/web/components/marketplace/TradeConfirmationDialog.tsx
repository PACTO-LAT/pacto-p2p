'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatAmount, formatCurrency } from '@/lib/dashboard-utils';
import { MarketplaceListing } from '@/lib/types/marketplace';

interface TradeConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedListing: MarketplaceListing | null;
  onConfirm: () => void;
  isPending: boolean;
}

export function TradeConfirmationDialog({
  open,
  onOpenChange,
  selectedListing,
  onConfirm,
  isPending,
}: TradeConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-gradient">
            Offer Creation
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {selectedListing && (
              <>
                You are about to{' '}
                {selectedListing.type === 'sell' ? 'buy' : 'sell'}{' '}
                {selectedListing.amount} {selectedListing.token}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {selectedListing && (
          <div className="space-y-4">
            <div className="bg-muted/50 backdrop-blur-sm p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-foreground">
                Trade Details
              </h4>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  Amount: {formatAmount(selectedListing.amount)}{' '}
                  {selectedListing.token}
                </p>
                <p className="text-muted-foreground">
                  Rate: {selectedListing.rate}{' '}
                  {selectedListing.fiatCurrency}/{selectedListing.token}
                </p>
                <p className="text-muted-foreground">
                  Total:{' '}
                  {formatCurrency(
                    selectedListing.amount * selectedListing.rate,
                    selectedListing.fiatCurrency
                  )}
                </p>
                <p className="text-muted-foreground">
                  Payment: {selectedListing.paymentMethod}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 btn-emerald-outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="flex-1 btn-emerald"
                disabled={isPending}
              >
                {isPending ? 'Creating Escrow...' : 'Confirm Trade'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
