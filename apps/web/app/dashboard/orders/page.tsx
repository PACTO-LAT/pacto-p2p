'use client';

import type { Escrow } from '@pacto-p2p/types';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { UnreadBadge } from '@/components/chat/UnreadBadge';
import {
  ErrorState,
  EscrowDetailsModal,
  LoadingState,
} from '@/components/escrow';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useUnreadCount } from '@/hooks/use-chat';
import { useEscrowActions } from '@/hooks/use-escrow-actions';
import { useEscrowSelection } from '@/hooks/use-escrow-selection';
import { useIndexedEscrows } from '@/hooks/use-indexed-escrows';
import { formatAmount } from '@/lib/dashboard-utils';
import {
  canConfirmPayment,
  canDeposit,
  canReleaseFunds,
  canReportPayment,
} from '@/lib/escrow-utils';
import { supabase } from '@/lib/supabase';
import useGlobalAuthenticationStore from '@/store/wallet.store';
import { getTrustlineName } from '@/utils/getTrustline';

type RoleTab = 'buyer' | 'seller';
type StatusTab = 'all' | 'active' | 'completed' | 'disputed';

function getEscrowStatus(escrow: Escrow): StatusTab {
  if (escrow.flags?.disputed) return 'disputed';
  if (escrow.flags?.resolved || escrow.flags?.released) return 'completed';
  return 'active';
}

export default function EscrowsPage() {
  const [roleTab, setRoleTab] = useState<RoleTab>('buyer');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);

  const { user } = useAuth();
  const { address } = useGlobalAuthenticationStore();
  const { unreadByEngagementId } = useUnreadCount(user?.id ?? null);
  const { selectedEscrow, selectEscrow, clearSelectedEscrow } =
    useEscrowSelection();
  const {
    isReportPaymentLoading,
    isCancelEscrowLoading,
    handleReportPayment,
    handleConfirmPayment,
    handleDeposit,
    handleDisputeEscrow,
    handleReleaseFunds,
    handleCancelEscrow,
  } = useEscrowActions();

  const role = roleTab === 'seller' ? 'approver' : 'serviceProvider';

  const {
    data: allEscrows = [],
    isLoading,
    error,
  } = useIndexedEscrows(!!address);

  // Scope the backend-served snapshots to the role selected by the tab,
  // matching the user's wallet address (previously done server-side).
  const escrows = useMemo(
    () => (address ? allEscrows.filter((e) => e.roles[role] === address) : []),
    [allEscrows, address, role]
  );

  const engagementIds = useMemo(
    () => escrows.map((e) => e.engagementId),
    [escrows]
  );

  const {
    data: platformData = {
      fiatCurrencyMap: {} as Record<string, string>,
      pactoIds: new Set<string>(),
    },
  } = useQuery({
    queryKey: ['trades-platform-data', engagementIds],
    queryFn: async () => {
      if (engagementIds.length === 0)
        return {
          fiatCurrencyMap: {} as Record<string, string>,
          pactoIds: new Set<string>(),
        };
      const { data } = await supabase
        .from('escrows')
        .select('engagement_id, trades(fiat_currency)')
        .in('engagement_id', engagementIds);
      const fiatCurrencyMap: Record<string, string> = {};
      const pactoIds = new Set<string>();
      for (const row of data ?? []) {
        if (!row.engagement_id) continue;
        pactoIds.add(row.engagement_id);
        const fiat = Array.isArray(row.trades)
          ? row.trades[0]?.fiat_currency
          : (row.trades as { fiat_currency?: string } | null)?.fiat_currency;
        if (fiat) fiatCurrencyMap[row.engagement_id] = fiat;
      }
      return { fiatCurrencyMap, pactoIds };
    },
    enabled: engagementIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const { fiatCurrencyMap, pactoIds } = platformData;

  // Only show escrows that belong to Pacto (have a record in our DB)
  const pactoEscrows = useMemo(
    () => escrows.filter((e) => pactoIds.has(e.engagementId)),
    [escrows, pactoIds]
  );

  const counts = useMemo(
    () => ({
      all: pactoEscrows.length,
      active: pactoEscrows.filter((e) => getEscrowStatus(e) === 'active')
        .length,
      completed: pactoEscrows.filter((e) => getEscrowStatus(e) === 'completed')
        .length,
      disputed: pactoEscrows.filter((e) => getEscrowStatus(e) === 'disputed')
        .length,
    }),
    [pactoEscrows]
  );

  const filtered = useMemo(
    () =>
      statusTab === 'all'
        ? pactoEscrows
        : pactoEscrows.filter((e) => getEscrowStatus(e) === statusTab),
    [pactoEscrows, statusTab]
  );

  const openEscrowModal = (escrow: Escrow) => {
    selectEscrow(escrow);
    setIsEscrowModalOpen(true);
  };

  const onReportPayment = async (escrow: Escrow) =>
    handleReportPayment(escrow, { evidence: '' });
  const onConfirmPayment = async (escrow: Escrow) =>
    handleConfirmPayment(escrow);
  const onDeposit = async (escrow: Escrow) => handleDeposit(escrow);
  const onDisputeEscrow = async (escrow: Escrow) => handleDisputeEscrow(escrow);
  const onReleaseFunds = async (escrow: Escrow) => handleReleaseFunds(escrow);
  const onCancelEscrow = async (escrow: Escrow) => {
    const success = await handleCancelEscrow(escrow);
    if (success) {
      setIsEscrowModalOpen(false);
      clearSelectedEscrow();
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage your escrow contracts
          </p>
        </div>

        {/* Role tabs */}
        <div className="flex h-9 p-1 bg-white/[0.04] rounded-lg border border-white/[0.07] gap-1 w-fit translate-y-6">
          {(['buyer', 'seller'] as RoleTab[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleTab(r)}
              className={`px-4 py-1 rounded-md text-sm font-medium capitalize transition-all duration-150 cursor-pointer ${
                roleTab === r
                  ? 'bg-emerald-500 text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 border-b border-white/[0.06] pb-0">
        {(
          [
            { key: 'all', label: 'All' },
            { key: 'active', label: 'In Progress' },
            { key: 'completed', label: 'Completed' },
            { key: 'disputed', label: 'Disputed' },
          ] as { key: StatusTab; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusTab(key)}
            className={`px-4 py-2.5 text-sm font-medium transition-all duration-150 border-b-2 -mb-px cursor-pointer ${
              statusTab === key
                ? 'text-white border-emerald-500'
                : 'text-muted-foreground border-transparent hover:text-foreground hover:border-white/[0.2]'
            }`}
          >
            {label}
            {counts[key] > 0 && (
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  statusTab === key
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-white/[0.08] text-muted-foreground'
                }`}
              >
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyTableState roleTab={roleTab} statusTab={statusTab} />
        ) : (
          <>
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_100px_64px] gap-6 px-5 py-3 border-b border-white/[0.06]">
              <p className="text-xs text-muted-foreground/60 uppercase tracking-wide">
                Order
              </p>
              <p className="text-xs text-muted-foreground/60 uppercase tracking-wide pl-10">
                Counterparty
              </p>
              <p className="text-xs text-muted-foreground/60 uppercase tracking-wide">
                Balance
              </p>
              <p className="text-xs text-muted-foreground/60 uppercase tracking-wide -ml-4">
                Status
              </p>
              <p className="text-xs text-muted-foreground/60 uppercase tracking-wide -ml-4">
                Needed
              </p>
              <p className="text-xs text-muted-foreground/60 uppercase tracking-wide -ml-6">
                Action
              </p>
              <p className="text-xs text-muted-foreground/60 uppercase tracking-wide">
                Viewer
              </p>
            </div>

            {/* Rows */}
            {filtered.map((escrow, i) => {
              const token = getTrustlineName(escrow.trustline.address);
              const isCompleted =
                escrow.flags?.resolved || escrow.flags?.released;
              const isDisputed = escrow.flags?.disputed;
              const counterparty =
                roleTab === 'buyer'
                  ? escrow.roles.approver
                  : escrow.roles.serviceProvider;
              const unread = unreadByEngagementId[escrow.engagementId] ?? 0;
              const fiatCurrency = fiatCurrencyMap[escrow.engagementId];
              const tradeLabel = fiatCurrency
                ? `${token}/${fiatCurrency} P2P Trade`
                : `${token} P2P Trade`;

              const actionNeeded = (() => {
                if (canDeposit(escrow, roleTab))
                  return { label: 'Deposit needed', color: 'text-orange-400' };
                if (canReportPayment(escrow, roleTab))
                  return { label: 'Pay now', color: 'text-blue-400' };
                if (canConfirmPayment(escrow, roleTab))
                  return { label: 'Confirm receipt', color: 'text-blue-400' };
                if (canReleaseFunds(escrow, roleTab))
                  return { label: 'Release funds', color: 'text-emerald-400' };
                return null;
              })();

              const statusStyles = isCompleted
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : isDisputed
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

              const statusLabel = isCompleted
                ? 'Completed'
                : isDisputed
                  ? 'Disputed'
                  : 'In Progress';

              return (
                <div
                  key={escrow.engagementId}
                  className={`grid grid-cols-1 sm:grid-cols-[2fr_1.2fr_1fr_1fr_1fr_100px_64px] gap-6 items-center px-5 py-4 hover:bg-white/[0.03] transition-colors ${
                    i < filtered.length - 1
                      ? 'border-b border-white/[0.05]'
                      : ''
                  }`}
                >
                  {/* Order */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        roleTab === 'buyer'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {roleTab === 'buyer' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">
                          {formatAmount(escrow.amount)} {token}
                        </span>
                        {unread > 0 && (
                          <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                            <MessageCircle className="w-3 h-3" />
                            <UnreadBadge count={unread} />
                          </span>
                        )}
                      </div>
                      {tradeLabel && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {tradeLabel}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/40 font-mono truncate mt-0.5">
                        {escrow.engagementId}
                      </p>
                    </div>
                  </div>

                  {/* Counterparty */}
                  <div className="pl-12">
                    <p className="text-xs text-muted-foreground sm:hidden mb-0.5">
                      Counterparty
                    </p>
                    <p className="font-mono text-xs text-foreground">
                      {counterparty.slice(0, 6)}…{counterparty.slice(-4)}
                    </p>
                  </div>

                  {/* Balance */}
                  <div>
                    <p className="text-xs text-muted-foreground sm:hidden mb-0.5">
                      Balance
                    </p>
                    <p className="font-mono text-xs text-foreground">
                      {formatAmount(escrow.balance ?? 0)} {token}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="-ml-8">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Needed */}
                  <div className="-ml-4">
                    {actionNeeded && !isCompleted && !isDisputed ? (
                      <span
                        className={`text-xs font-medium ${actionNeeded.color}`}
                      >
                        {actionNeeded.label}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/30">
                        —
                      </span>
                    )}
                  </div>

                  {/* Open */}
                  <div className="flex justify-start -ml-8">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-white border border-white/[0.10] hover:border-white/[0.22] px-4 h-8 text-xs font-medium"
                      onClick={() => openEscrowModal(escrow)}
                    >
                      Open
                    </Button>
                  </div>

                  {/* Viewer */}
                  <div>
                    {escrow.contractId ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-emerald-400 px-2 h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `https://viewer.trustlesswork.com/${escrow.contractId}`,
                            '_blank'
                          );
                        }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <span className="w-9 inline-block" />
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <EscrowDetailsModal
        open={isEscrowModalOpen}
        onOpenChange={(open) => {
          setIsEscrowModalOpen(open);
          if (!open) clearSelectedEscrow();
        }}
        escrow={selectedEscrow}
        activeTab={roleTab}
        isCancellingEscrow={isCancelEscrowLoading}
        onReportPayment={onReportPayment}
        onConfirmPayment={onConfirmPayment}
        onDeposit={onDeposit}
        onDisputeEscrow={onDisputeEscrow}
        onReleaseFunds={onReleaseFunds}
        onCancelEscrow={onCancelEscrow}
        isReportPaymentLoading={isReportPaymentLoading}
      />
    </div>
  );
}

function EmptyTableState({
  roleTab,
  statusTab,
}: {
  roleTab: RoleTab;
  statusTab: StatusTab;
}) {
  const messages: Record<StatusTab, string> = {
    all: `No ${roleTab} orders yet`,
    active: 'No orders in progress',
    completed: 'No completed orders',
    disputed: 'No disputed orders',
  };
  return (
    <div className="px-5 py-12 text-center text-xs text-muted-foreground/60">
      {messages[statusTab]}
    </div>
  );
}
