'use client';

import {
  Banknote,
  CheckCircle,
  ExternalLink,
  Unlock,
  User,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatAmount } from '@/lib/dashboard-utils';
import { getTrustlineName } from '@/utils/getTrustline';
import { Escrow } from '@/lib/types/escrow';

interface EscrowDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escrow: Escrow | null;
  activeTab: 'buyer' | 'seller';
  onReportPayment: (escrow: Escrow) => void;
  onConfirmPayment: (escrow: Escrow) => void;
  onDeposit: (escrow: Escrow) => void;
  onDisputeEscrow: (escrow: Escrow) => void;
  onReleaseFunds: (escrow: Escrow) => void;
}

export function EscrowDetailsModal({
  open,
  onOpenChange,
  escrow,
  activeTab,
  onReportPayment,
  onConfirmPayment,
  onDeposit,
  onDisputeEscrow,
  onReleaseFunds,
}: EscrowDetailsModalProps) {
  if (!escrow) return null;

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

  const status = getStatusInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card !max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-emerald-gradient">
            Escrow Details
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Complete information and available actions for this escrow contract
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-muted/50 backdrop-blur-sm p-6 rounded-lg border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-emerald-600">
                  {formatAmount(escrow.amount)}{' '}
                  {getTrustlineName(escrow.trustline.address)}
                  <span className="text-muted-foreground mx-3">
                    | {formatAmount(escrow.balance || 0)}{' '}
                    {getTrustlineName(escrow.trustline.address)}
                  </span>
                </h3>
                <p className="text-muted-foreground mt-1">
                  Engagement ID: {escrow.engagementId}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className={`font-semibold ${status.color}`}>
                  {status.text}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-semibold text-lg text-foreground">
              Description
            </h4>
            <p className="text-foreground bg-muted/50 backdrop-blur-sm p-4 rounded-lg">
              {escrow.description}
            </p>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-foreground">
                Contract Information
              </h4>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Seller</p>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 backdrop-blur-sm rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-sm text-foreground">
                      {escrow.roles.approver.slice(0, 8)}...
                      {escrow.roles.approver.slice(-8)}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Buyer</p>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 backdrop-blur-sm rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-sm text-foreground">
                      {escrow.roles.serviceProvider.slice(0, 8)}...
                      {escrow.roles.serviceProvider.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-foreground">
                Technical Details
              </h4>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Asset</p>
                  <div className="p-3 bg-muted/50 backdrop-blur-sm rounded-lg">
                    <span className="font-mono text-sm text-foreground">
                      {getTrustlineName(escrow.trustline.address)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-6 border-t border-border/50">
            <h4 className="font-semibold text-lg text-foreground">
              Available Actions
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeTab === 'buyer' &&
                escrow.milestones[0].status !== 'pendingApproval' &&
                !escrow.flags?.resolved &&
                !escrow.flags?.released && (
                  <Button
                    onClick={() => onReportPayment(escrow)}
                    className="w-full btn-emerald-outline"
                    variant="outline"
                  >
                    <Banknote className="w-4 h-4 mr-2" />
                    Report Payment
                  </Button>
                )}

              {activeTab === 'seller' && (
                <>
                  {!escrow.milestones[0].approved && (
                    <Button
                      onClick={() => onConfirmPayment(escrow)}
                      className="w-full btn-emerald-outline"
                      variant="outline"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Payment
                    </Button>
                  )}

                  {escrow.balance === 0 &&
                    !escrow.flags?.released &&
                    !escrow.flags?.resolved && (
                      <Button
                        onClick={() => onDeposit(escrow)}
                        className="w-full btn-emerald-outline"
                        variant="outline"
                      >
                        <Banknote className="w-4 h-4 mr-2" />
                        Deposit
                      </Button>
                    )}

                  {escrow.milestones[0].approved &&
                    escrow.balance !== 0 && (
                      <Button
                        onClick={() => onReleaseFunds(escrow)}
                        className="w-full btn-emerald-outline"
                        variant="outline"
                      >
                        <Unlock className="w-4 h-4 mr-2" />
                        Release Funds
                      </Button>
                    )}
                </>
              )}

              {!escrow.flags?.disputed &&
                !escrow.flags?.resolved &&
                !escrow.flags?.released &&
                escrow.balance !== 0 && (
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
                  className="w-full btn-emerald-outline"
                  onClick={() => {
                    window.open(
                      `https://viewer.trustlesswork.com/${escrow.contractId}`,
                      '_blank'
                    );
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Escrow Viewer
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
