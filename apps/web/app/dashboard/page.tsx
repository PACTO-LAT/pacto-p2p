'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Shield,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTrades } from '@/hooks/use-trades-history';
import { useUserListings } from '@/hooks/use-listings';
import { useMerchantStatus } from '@/hooks/useMerchant';
import { useEscrowsByRoleQuery } from '@/hooks/use-escrows';
import { WalletConnectionPrompt } from '@/components/shared/WalletConnectionPrompt';
import useGlobalAuthenticationStore from '@/store/wallet.store';
import { formatAmount } from '@/lib/dashboard-utils';
import { getTrustlineName } from '@/utils/getTrustline';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { address, isConnected } = useGlobalAuthenticationStore();
  const { isVerifiedMerchant } = useMerchantStatus();

  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const [hasShownWalletPrompt, setHasShownWalletPrompt] = useState(false);
  const [userDismissedPrompt, setUserDismissedPrompt] = useState(false);

  const { data: trades = [] } = useTrades(user?.id);
  const { data: userListings = [] } = useUserListings(user?.id);

  // Active orders: use TW indexer (filtered by user address) for real-time accuracy.
  // Results are already cached in React Query from the header's usePendingActions fetch.
  const { data: sellerEscrows = [] } = useEscrowsByRoleQuery({
    role: 'approver',
    roleAddress: address ?? '',
    isActive: true,
    enabled: !!address,
  });
  const { data: buyerEscrows = [] } = useEscrowsByRoleQuery({
    role: 'serviceProvider',
    roleAddress: address ?? '',
    isActive: true,
    enabled: !!address,
  });
  const activeOrders = [...sellerEscrows, ...buyerEscrows].filter(
    (e) => !e.flags?.released && !e.flags?.resolved
  ).length;
  const activeListings = userListings.filter((l) => l.status === 'active').length;
  const completedTrades = trades.filter((t) => t.status === 'completed' || t.status === 'resolved').length;
  const totalVolume = trades
    .filter((t) => t.status === 'completed' || t.status === 'resolved')
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);
  // Active orders panel: derive from TW escrows (already cached from header fetch)
  const activeEscrows = [...sellerEscrows, ...buyerEscrows]
    .filter((e) => !e.flags?.released && !e.flags?.resolved)
    .slice(0, 3);
  const recentCompletedTrades = trades.filter((t) => t.status === 'completed' || t.status === 'resolved').slice(0, 4);

  const displayName =
    user?.full_name || user?.username || user?.email?.split('@')[0] || 'Trader';

  useEffect(() => {
    if (isConnected && address && user?.stellar_address === address) {
      setUserDismissedPrompt(false);
      setHasShownWalletPrompt(false);
    }
  }, [isConnected, address, user?.stellar_address]);

  useEffect(() => {
    if (userDismissedPrompt || showWalletPrompt) return;
    if (isConnected && address && user?.stellar_address === address) return;
    if (!authLoading && user && !user.stellar_address && !hasShownWalletPrompt && !(isConnected && address)) {
      const timer = setTimeout(() => {
        setShowWalletPrompt(true);
        setHasShownWalletPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, showWalletPrompt, isConnected, address, hasShownWalletPrompt, userDismissedPrompt]);

  const handleWalletPromptChange = (open: boolean) => {
    setShowWalletPrompt(open);
    if (!open && (!isConnected || !address || user?.stellar_address !== address)) {
      setUserDismissedPrompt(true);
    }
  };

  return (
    <div className="space-y-4">

      {/* ── Welcome ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-1">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Welcome back,</p>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              {displayName}
            </h1>
            {isVerifiedMerchant && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                Merchant
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4">
        <StatTile
          icon={<Shield className="w-4 h-4" />}
          label="Active orders"
          value={activeOrders}
          href="/dashboard/orders"
        />
        <StatTile
          icon={<CheckCircle2 className="w-4 h-4" />}
          label="Completed trades"
          value={completedTrades}
          href="/dashboard/orders"
        />
        <StatTile
          icon={<TrendingUp className="w-4 h-4" />}
          label="Volume traded"
          value={`${formatAmount(totalVolume)} USDC`}
        />
      </div>

      {/* ── Bottom row: active orders preview + recent trades ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Active orders preview */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <p className="text-sm font-semibold text-white">Active orders</p>
            <Link href="/dashboard/orders" className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {activeEscrows.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs text-muted-foreground/60">
              No active orders
            </div>
          ) : (
            <div>
              {activeEscrows.map((escrow, i) => {
                const isSeller = escrow.roles.approver === address;
                return (
                  <div
                    key={escrow.engagementId}
                    className={`flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors ${
                      i < activeEscrows.length - 1 ? 'border-b border-white/[0.04]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span className="text-sm text-foreground font-medium">
                        {formatAmount(Number(escrow.amount) ?? 0)}{' '}
                        <span className="text-muted-foreground font-normal">{getTrustlineName(escrow.trustline?.address ?? '')}</span>
                      </span>
                      <span className="text-xs text-muted-foreground/60 capitalize hidden sm:inline">
                        {isSeller ? 'sell' : 'buy'}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-yellow-400 shrink-0">In progress</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent trades */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <p className="text-sm font-semibold text-white">Recent trades</p>
            <Link href="/dashboard/orders" className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {recentCompletedTrades.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs text-muted-foreground/60">
              No completed trades yet
            </div>
          ) : (
            <div>
              {recentCompletedTrades.map((trade, i) => {
                const isCompleted = trade.status === 'completed' || trade.status === 'resolved';
                const isDisputed = trade.status === 'disputed';
                const isActive = trade.status === 'active';
                return (
                  <div
                    key={trade.id}
                    className={`flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors ${
                      i < recentCompletedTrades.length - 1 ? 'border-b border-white/[0.04]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isCompleted
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        : isDisputed
                        ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        : <Clock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      }
                      <span className="text-sm text-foreground">
                        {formatAmount(trade.amount ?? 0)}{' '}
                        <span className="text-muted-foreground">{trade.token}</span>
                      </span>
                      <span className="text-xs text-muted-foreground/60 capitalize hidden sm:inline">
                        {trade.type}
                      </span>
                    </div>
                    <span className={`text-xs ${
                      isCompleted ? 'text-emerald-400' : isDisputed ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {isCompleted ? 'Completed' : isDisputed ? 'Disputed' : 'In progress'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <WalletConnectionPrompt open={showWalletPrompt} onOpenChange={handleWalletPromptChange} />
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  accent,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: boolean;
  href?: string;
}) {
  const tile = (
    <div className={`rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-200 ${
      accent
        ? 'bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/15'
        : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.05]'
    } ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          accent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.06] text-muted-foreground'
        }`}>
          {icon}
        </div>
        {href && <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/30" />}
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={`text-3xl font-bold leading-none truncate ${accent ? 'text-emerald-400' : 'text-white'}`}>
          {value}
        </p>
      </div>
    </div>
  );

  if (href) return <Link href={href}>{tile}</Link>;
  return tile;
}
