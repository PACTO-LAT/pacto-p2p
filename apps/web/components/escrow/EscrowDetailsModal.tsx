'use client';

import {
  Banknote,
  CheckCircle,
  ExternalLink,
  Loader2,
  TimerReset,
  Unlock,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { TradeChatPanel } from '@/components/chat/TradeChatPanel';
import { TrustlineBanner } from '@/components/shared/TrustlineBanner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { formatAmount } from '@/lib/dashboard-utils';
import {
  canCancel,
  canConfirmPayment,
  canDeposit,
  canDispute,
  canReleaseFunds,
  canReportPayment,
  getEscrowCancellationGraceHours,
  getEscrowCreatedAt,
} from '@/lib/escrow-utils';
import type { EscrowTransactionHashes } from '@/lib/services/trades';
import { TradesService } from '@/lib/services/trades';
import type { Escrow } from '@/lib/types/escrow';
import { getTrustlineName } from '@/utils/getTrustline';
import { TrustlineError } from '@/utils/stellar/TrustlineError';
import { EscrowTransactionHashesDisplay } from './TransactionHashDisplay';

interface EscrowDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escrow: Escrow | null;
  activeTab: 'buyer' | 'seller';
  isCancellingEscrow?: boolean;
  onReportPayment: (escrow: Escrow) => void;
  onConfirmPayment: (escrow: Escrow) => void;
  onDeposit: (escrow: Escrow) => void;
  onDisputeEscrow: (escrow: Escrow) => void;
  onReleaseFunds: (escrow: Escrow) => void;
  onCancelEscrow: (escrow: Escrow) => Promise<void> | void;
  isReportPaymentLoading?: boolean;
}

export function EscrowDetailsModal({
  open,
  onOpenChange,
  escrow,
  activeTab,
  isCancellingEscrow = false,
  onReportPayment,
  onConfirmPayment,
  onDeposit,
  onDisputeEscrow,
  onReleaseFunds,
  onCancelEscrow,
  isReportPaymentLoading,
}: EscrowDetailsModalProps) {
  const { user } = useAuth();
  const [transactionHashes, setTransactionHashes] =
    useState<EscrowTransactionHashes | null>(null);
  const [trustlineError, setTrustlineError] = useState<TrustlineError | null>(
    null
  );

  useEffect(() => {
    if (open && escrow?.engagementId) {
      TradesService.getEscrowByEngagementId(escrow.engagementId)
        .then((result) => {
          if (result?.transaction_hashes) {
            setTransactionHashes(result.transaction_hashes);
          }
        })
        .catch(() => {});
    }
  }, [open, escrow?.engagementId]);

  if (!escrow) return null;

  const cancellationGraceHours = getEscrowCancellationGraceHours();
  const createdAt = getEscrowCreatedAt(escrow);
  const userRole = activeTab;
  const token = getTrustlineName(escrow.trustline.address);

  const getStatusInfo = () => {
    if (escrow.flags?.released) {
      return { text: 'Released', color: 'text-emerald-600' };
    }
    if (escrow.flags?.resolved) {
      return { text: 'Resolved', color: 'text-emerald-600' };
    }
    if (escrow.flags?.disputed) {
      return { text: 'Disputed', color: 'text-red-600' };
    }
    if (escrow.milestones[0].status === 'pendingApproval') {
      return { text: 'Pending Approval', color: 'text-yellow-600' };
    }
    if (escrow.milestones[0].approved) {
      return { text: 'Confirmed', color: 'text-emerald-600' };
    }
    return { text: 'Active', color: 'text-blue-600' };
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card !max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-emerald-gradient">
            Escrow Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          {/* ── DETAILS TAB ── */}
          <TabsContent value="details" className="space-y-5">
            {/* Amount + status hero */}
            <div className="flex items-center justify-between bg-muted/40 rounded-lg px-5 py-4">
              <div>
                <p className="text-3xl font-bold text-emerald-500">
                  {formatAmount(escrow.amount)} {token}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Balance: {formatAmount(escrow.balance || 0)} {token}
                </p>
                <p className="text-muted-foreground text-sm">
                  Created: {createdAt.toLocaleString()}
                </p>
              </div>
              <span className={`text-sm font-semibold ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>

            {/* Description */}
            {escrow.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm text-foreground bg-muted/30 rounded-md px-3 py-2">
                  {escrow.description}
                </p>
              </div>
            )}

            {/* Parties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-muted/40 rounded-md px-3 py-2.5">
                <p className="text-xs text-muted-foreground mb-1">
                  Seller (releases crypto)
                </p>
                <p className="font-mono text-xs text-foreground break-all">
                  {escrow.roles.approver}
                </p>
              </div>
              <div className="bg-muted/40 rounded-md px-3 py-2.5">
                <p className="text-xs text-muted-foreground mb-1">
                  Buyer (pays fiat)
                </p>
                <p className="font-mono text-xs text-foreground break-all">
                  {escrow.roles.serviceProvider}
                </p>
              </div>
            </div>

            {/* Engagement ID */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Engagement ID
              </p>
              <p className="font-mono text-xs text-foreground bg-muted/30 rounded-md px-3 py-2 break-all">
                {escrow.engagementId}
              </p>
            </div>

            {/* Transaction hashes */}
            <EscrowTransactionHashesDisplay
              transactionHashes={transactionHashes}
              network="testnet"
            />

            {/* Trustline error */}
            {trustlineError && <TrustlineBanner error={trustlineError} />}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
              {activeTab === 'buyer' && canReportPayment(escrow, userRole) && (
                <Button
                  onClick={() => onReportPayment(escrow)}
                  className="btn-emerald-outline flex-1"
                  variant="outline"
                  disabled={isReportPaymentLoading}
                >
                  {isReportPaymentLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Banknote className="w-4 h-4 mr-2" />
                  )}
                  I&apos;ve Sent Payment
                </Button>
              )}

              {activeTab === 'seller' && (
                <>
                  {canConfirmPayment(escrow, userRole) && (
                    <Button
                      onClick={() => onConfirmPayment(escrow)}
                      className="btn-emerald-outline flex-1"
                      variant="outline"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Payment
                    </Button>
                  )}

                  {canDeposit(escrow, userRole) && (
                    <Button
                      onClick={async () => {
                        setTrustlineError(null);
                        try {
                          await onDeposit(escrow);
                        } catch (err) {
                          if (err instanceof TrustlineError) {
                            setTrustlineError(err);
                          }
                        }
                      }}
                      className="btn-emerald-outline flex-1"
                      variant="outline"
                    >
                      <Banknote className="w-4 h-4 mr-2" />
                      Deposit
                    </Button>
                  )}

                  {canReleaseFunds(escrow, userRole) && (
                    <Button
                      onClick={async () => {
                        setTrustlineError(null);
                        try {
                          await onReleaseFunds(escrow);
                        } catch (err) {
                          if (err instanceof TrustlineError)
                            setTrustlineError(err);
                        }
                      }}
                      className="btn-emerald-outline flex-1"
                      variant="outline"
                    >
                      <Unlock className="w-4 h-4 mr-2" />
                      Release Funds
                    </Button>
                  )}
                </>
              )}

              {canCancel(escrow, userRole) && (
                <Button
                  onClick={() => onCancelEscrow(escrow)}
                  className="w-full btn-emerald-outline"
                  variant="outline"
                  disabled={isCancellingEscrow}
                >
                  <TimerReset className="w-4 h-4 mr-2" />
                  {isCancellingEscrow ? 'Cancelling...' : 'Cancel Trade'}
                </Button>
              )}

              {!canCancel(escrow, userRole) &&
                activeTab === 'buyer' &&
                escrow.balance === 0 &&
                !escrow.flags?.disputed &&
                !escrow.flags?.resolved &&
                !escrow.flags?.released && (
                  <p className="text-sm text-muted-foreground md:col-span-2 lg:col-span-3">
                    Unfunded escrows can be cancelled by the buyer after{' '}
                    {cancellationGraceHours} hours.
                  </p>
                )}

              {canDispute(escrow) && (
                <Button
                  onClick={() => onDisputeEscrow(escrow)}
                  className="w-full btn-emerald-outline"
                  variant="outline"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Dispute
                </Button>
              )}

              {escrow.contractId && (
                <Button
                  variant="outline"
                  className="btn-emerald-outline flex-1"
                  onClick={() =>
                    window.open(
                      `https://viewer.trustlesswork.com/${escrow.contractId}`,
                      '_blank'
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Escrow Viewer
                </Button>
              )}
            </div>
          </TabsContent>

          {/* ── CHAT TAB ── */}
          <TabsContent value="chat">
            {user && (
              <TradeChatPanel
                engagementId={escrow.engagementId}
                currentUserId={user.id}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
