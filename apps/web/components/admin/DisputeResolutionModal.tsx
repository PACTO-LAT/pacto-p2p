'use client';

import type { Escrow } from '@pacto-p2p/types';
import { AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEscrowActions } from '@/hooks/use-escrow-actions';
import useGlobalAuthenticationStore from '@/store/wallet.store';

interface DisputeResolutionModalProps {
  escrow: Escrow;
  onClose: () => void;
  onResolved: () => void;
}

export function DisputeResolutionModal({
  escrow,
  onClose,
  onResolved,
}: DisputeResolutionModalProps) {
  const { address } = useGlobalAuthenticationStore();
  const { handleResolveDispute, isResolveDisputeLoading } = useEscrowActions();

  const platformAddress = process.env.NEXT_PUBLIC_ROLE_ADDRESS ?? '';
  const isPlatformWallet =
    !!address && !!platformAddress && address === platformAddress;

  const currentBalance = escrow.balance ?? escrow.amount ?? 0;

  const [buyerAmount, setBuyerAmount] = useState<string>('');
  const [sellerAmount, setSellerAmount] = useState<string>('');

  const buyer = escrow.roles.serviceProvider; // buyer = serviceProvider (role inversion)
  const seller = escrow.roles.approver; // seller = approver (role inversion)

  const parsedBuyer = parseFloat(buyerAmount) || 0;
  const parsedSeller = parseFloat(sellerAmount) || 0;
  const total = parseFloat((parsedBuyer + parsedSeller).toFixed(7));
  const isValidSum = Math.abs(total - currentBalance) < 0.0000001;

  const handleBuyerChange = (value: string) => {
    setBuyerAmount(value);
    const parsed = parseFloat(value) || 0;
    const remaining = parseFloat((currentBalance - parsed).toFixed(7));
    setSellerAmount(remaining >= 0 ? String(remaining) : '0');
  };

  const handleSellerChange = (value: string) => {
    setSellerAmount(value);
    const parsed = parseFloat(value) || 0;
    const remaining = parseFloat((currentBalance - parsed).toFixed(7));
    setBuyerAmount(remaining >= 0 ? String(remaining) : '0');
  };

  const handleSubmit = async () => {
    if (!isValidSum || !isPlatformWallet) return;

    const distributions = [
      { address: buyer, amount: parsedBuyer },
      { address: seller, amount: parsedSeller },
    ];

    const success = await handleResolveDispute(escrow, distributions);
    if (success) {
      onResolved();
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Resolve Dispute</DialogTitle>
          <DialogDescription>
            Distribute the escrow balance between buyer and seller. The sum must
            equal the current balance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Escrow info */}
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contract ID</span>
              <span className="font-mono text-xs truncate max-w-[200px]">
                {escrow.contractId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current balance</span>
              <span className="font-semibold">
                {currentBalance} {escrow.trustline?.name ?? ''}
              </span>
            </div>
          </div>

          {/* Platform wallet guard */}
          {!isPlatformWallet && (
            <div className="flex items-start gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Connect the platform wallet (
                {platformAddress || 'not configured'}) to resolve disputes.
                Currently connected: {address || 'none'}
              </span>
            </div>
          )}

          {/* Distribution inputs */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="buyer-amount">
                Buyer{' '}
                <span className="text-muted-foreground font-normal font-mono text-xs">
                  ({buyer})
                </span>
              </Label>
              <Input
                id="buyer-amount"
                type="number"
                min="0"
                max={currentBalance}
                step="0.0000001"
                value={buyerAmount}
                onChange={(e) => handleBuyerChange(e.target.value)}
                placeholder="0"
                disabled={!isPlatformWallet || isResolveDisputeLoading}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="seller-amount">
                Seller{' '}
                <span className="text-muted-foreground font-normal font-mono text-xs">
                  ({seller})
                </span>
              </Label>
              <Input
                id="seller-amount"
                type="number"
                min="0"
                max={currentBalance}
                step="0.0000001"
                value={sellerAmount}
                onChange={(e) => handleSellerChange(e.target.value)}
                placeholder="0"
                disabled={!isPlatformWallet || isResolveDisputeLoading}
              />
            </div>
          </div>

          {/* Sum validation feedback */}
          {(buyerAmount || sellerAmount) && !isValidSum && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                Sum ({total}) must equal current balance ({currentBalance}).
              </span>
            </div>
          )}

          {(buyerAmount || sellerAmount) && isValidSum && (
            <div className="text-sm text-emerald-600 dark:text-emerald-400">
              ✓ Distribution sums to {total} — ready to submit.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isResolveDisputeLoading}
          >
            Cancel
          </Button>
          <Button
            className="btn-emerald"
            onClick={handleSubmit}
            disabled={
              !isPlatformWallet ||
              !isValidSum ||
              !buyerAmount ||
              !sellerAmount ||
              isResolveDisputeLoading
            }
          >
            {isResolveDisputeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resolving…
              </>
            ) : (
              'Resolve Dispute'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
