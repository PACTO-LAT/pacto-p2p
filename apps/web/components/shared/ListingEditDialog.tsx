'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DashboardListing } from '@/lib/types';
import { useUpdateListing } from '@/hooks/use-listings';

interface ListingEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: DashboardListing | null;
}

export function ListingEditDialog({ open, onOpenChange, listing }: ListingEditDialogProps) {
  const [amount, setAmount] = useState<string>(listing ? String(listing.amount) : '');
  const [rate, setRate] = useState<string>(listing ? String(listing.rate) : '');
  const [paymentMethod, setPaymentMethod] = useState<string>(listing?.paymentMethod || '');
  const [description, setDescription] = useState<string>(listing?.description || '');

  const { mutate: updateListing, isPending } = useUpdateListing();

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      onOpenChange(false);
    }
  };

  const handleSave = () => {
    if (!listing) return;
    updateListing({
      listingId: String(listing.id),
      updates: {
        amount: Number.parseFloat(amount),
        rate: Number.parseFloat(rate),
        payment_method: paymentMethod,
        description: description || null,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-gradient">Edit Listing</DialogTitle>
          <DialogDescription className="text-muted-foreground">Update your listing settings.</DialogDescription>
        </DialogHeader>

        {listing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-3" htmlFor="amount">Amount ({listing.token})</Label>
                <Input className="border border-white/20" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <Label className="mb-3"htmlFor="rate">Rate ({listing.fiatCurrency}/{listing.token})</Label>
                <Input className="border border-white/20" id="rate" value={rate} onChange={(e) => setRate(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="mb-3" htmlFor="paymentMethod">Payment Method</Label>
              <Input className="border border-white/20" id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
            </div>
            <div>
              <Label className="mb-3"htmlFor="description">Description</Label>
              <Input className="border border-white/20 mb-7" id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="flex gap-3 justify-end">
              <Button className="btn-details-glass" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button className="btn-emerald" onClick={handleSave} disabled={isPending}>Save</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


