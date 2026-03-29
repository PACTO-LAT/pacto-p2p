'use client';

import { ExternalLink, MessageCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatAmount } from '@/lib/dashboard-utils';
import { getTrustlineName } from '@/utils/getTrustline';
import type { Escrow } from '@/lib/types/escrow';
import { UnreadBadge } from '@/components/chat/UnreadBadge';
import {
  canReportPayment,
  canConfirmPayment,
  canDeposit,
  canReleaseFunds,
} from '@/lib/escrow-utils';

interface EscrowCardProps {
  escrow: Escrow;
  onClick: (escrow: Escrow) => void;
  unreadCount?: number;
  role?: 'buyer' | 'seller';
}

export function EscrowCard({ escrow, onClick, unreadCount = 0, role = 'buyer' }: EscrowCardProps) {
  const isCompleted = escrow.flags?.resolved || escrow.flags?.released;
  const isDisputed = escrow.flags?.disputed;
  const token = getTrustlineName(escrow.trustline.address);
  const userRole = role;

  const statusLabel = isCompleted ? 'Completed' : isDisputed ? 'Disputed' : 'In Progress';
  const statusStyles = isCompleted
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : isDisputed
    ? 'bg-red-500/10 text-red-400 border-red-500/20'
    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

  // Determine what action is needed
  const getActionNeeded = () => {
    if (canDeposit(escrow, userRole)) return { label: 'Deposit needed', color: 'text-orange-400' };
    if (canReportPayment(escrow, userRole)) return { label: 'Awaiting your payment', color: 'text-blue-400' };
    if (canConfirmPayment(escrow, userRole)) return { label: 'Confirm payment received', color: 'text-blue-400' };
    if (canReleaseFunds(escrow, userRole)) return { label: 'Ready to release', color: 'text-emerald-400' };
    return null;
  };
  const actionNeeded = getActionNeeded();

  const counterpartyLabel = role === 'buyer' ? 'Seller' : 'Buyer';
  const counterpartyAddress = role === 'buyer' ? escrow.roles.approver : escrow.roles.serviceProvider;

  return (
    <div
      className="rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200 cursor-pointer p-5"
      onClick={() => onClick(escrow)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          {/* Direction icon */}
          <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${role === 'buyer' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {role === 'buyer'
              ? <ArrowDownLeft className="w-4 h-4" />
              : <ArrowUpRight className="w-4 h-4" />
            }
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-bold text-white">
                {formatAmount(escrow.amount)} {token}
              </span>
              {unreadCount > 0 && (
                <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <MessageCircle className="w-3 h-3" />
                  <UnreadBadge count={unreadCount} />
                </div>
              )}
            </div>
            {escrow.description || escrow.title ? (
              <p className="text-sm text-muted-foreground truncate max-w-md mt-0.5">
                {escrow.description || escrow.title}
              </p>
            ) : null}
            {actionNeeded && !isCompleted && !isDisputed && (
              <p className={`text-xs mt-1 font-medium ${actionNeeded.color}`}>
                {actionNeeded.label}
              </p>
            )}
          </div>
        </div>

        {/* Status pill */}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusStyles}`}>
          {statusLabel}
        </span>
      </div>

      {/* Info row */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-white/[0.04] rounded-lg px-3 py-2">
          <p className="text-xs text-muted-foreground mb-0.5">{counterpartyLabel}</p>
          <p className="font-mono text-xs text-foreground">
            {counterpartyAddress.slice(0, 6)}…{counterpartyAddress.slice(-6)}
          </p>
        </div>
        <div className="bg-white/[0.04] rounded-lg px-3 py-2">
          <p className="text-xs text-muted-foreground mb-0.5">Balance</p>
          <p className="font-mono text-xs text-foreground">
            {formatAmount(escrow.balance ?? 0)} {token}
          </p>
        </div>
        <div className="bg-white/[0.04] rounded-lg px-3 py-2">
          <p className="text-xs text-muted-foreground mb-0.5">Role</p>
          <p className="text-xs text-foreground capitalize">{role}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground/50 truncate font-mono">
          {escrow.engagementId}
        </p>
        {escrow.contractId && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-emerald-400 shrink-0 px-2 h-7"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://viewer.trustlesswork.com/${escrow.contractId}`, '_blank');
            }}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs">Escrow Viewer</span>
          </Button>
        )}
      </div>
    </div>
  );
}
