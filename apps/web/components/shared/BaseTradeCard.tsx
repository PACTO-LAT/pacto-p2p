'use client';

import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TokenIcon } from '@/components/shared/TokenIcon';
import { TradeTypeBadge } from '@/components/shared/TradeTypeBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TradeActions } from '@/components/shared/TradeActions';
import { TradeInfo } from '@/components/shared/TradeInfo';
import { TradeProgress } from '@/components/shared/TradeProgress';
import { formatAmount, formatDate, getStatusColor } from '@/lib/dashboard-utils';
import type { MarketplaceListing } from '@/lib/types/marketplace';
import type { DashboardEscrow, DashboardListing } from '@/lib/types';
import useGlobalAuthenticationStore from '@/store/wallet.store';

// Union type for all possible trade data
type TradeData = MarketplaceListing | DashboardListing | DashboardEscrow;

// Type guards
const isMarketplaceListing = (trade: TradeData): trade is MarketplaceListing => {
  return 'reputation' in trade && 'trades' in trade && 'paymentMethod' in trade;
};

const isDashboardListing = (trade: TradeData): trade is DashboardListing => {
  return 'rate' in trade && 'fiatCurrency' in trade && !isMarketplaceListing(trade);
};

const isEscrow = (trade: TradeData): trade is DashboardEscrow => {
  return 'progress' in trade;
};

interface BaseTradeCardProps {
  trade: TradeData;
  variant?: 'marketplace' | 'dashboard' | 'escrow';
  onTrade?: (listing: MarketplaceListing) => void;
  onAction?: (
    trade: DashboardListing | DashboardEscrow,
    action: string
  ) => void;
  onOpenDialog?: (
    trade: DashboardListing | DashboardEscrow,
    type: 'receipt' | 'dispute'
  ) => void;
  showActions?: boolean;
  showProgress?: boolean;
}

export function BaseTradeCard({
  trade,
  variant: _variant = 'marketplace',
  onTrade,
  onAction,
  onOpenDialog,
  showActions = true,
  showProgress = true,
}: BaseTradeCardProps) {
  const { address } = useGlobalAuthenticationStore();

  const renderTraderInfo = () => {
    if (isMarketplaceListing(trade)) {
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trader</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-foreground">
                {trade.type === 'sell' ? trade.seller : trade.buyer}
              </span>
              <Badge
                variant="outline"
                className="text-xs bg-yellow-50/80 backdrop-blur-sm text-yellow-700 border-yellow-200/50"
              >
                ⭐ {trade.reputation} ({trade.trades})
              </Badge>
            </div>
          </div>
        </div>
      );
    }

    if (isDashboardListing(trade)) {
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trader</p>
            <span className="font-mono text-sm text-foreground">
              {trade.type === 'sell' ? trade.seller : trade.buyer}
            </span>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderRightSection = () => {
    if (isMarketplaceListing(trade)) {
      return (
        <div className="flex flex-col items-end gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Total Value</p>
            <p className="text-3xl font-bold text-foreground">
              {formatAmount(trade.amount * trade.rate)}
            </p>
            <p className="text-lg font-semibold text-muted-foreground">
              {trade.fiatCurrency}
            </p>
          </div>

          {onTrade && (
            <Button
              onClick={() => onTrade(trade)}
              className="btn-emerald px-8 py-2 text-base font-semibold"
            >
              {trade.type === 'sell' ? 'Buy Now' : 'Sell Now'}
            </Button>
          )}
        </div>
      );
    }

    if (isDashboardListing(trade)) {
      return (
        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={trade.status} />
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-xl font-bold text-foreground">
              {formatAmount(trade.amount * trade.rate)} {trade.fiatCurrency}
            </p>
          </div>
        </div>
      );
    }

    if (isEscrow(trade)) {
      return (
        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={trade.status} />
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-xl font-bold text-foreground">
              {trade.progress}%
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderTradeDetails = () => {
    if (isMarketplaceListing(trade)) {
      return (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground font-medium">Exchange Rate</p>
            <p className="text-foreground font-semibold">
              {Number(trade.rate).toFixed(2)} {trade.fiatCurrency}/{trade.token}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">Payment Method</p>
            <p className="text-foreground font-semibold">
              {trade.paymentMethod}
            </p>
          </div>
        </div>
      );
    }

    if (isDashboardListing(trade) || isEscrow(trade)) {
      return <TradeInfo trade={trade} />;
    }

    return null;
  };

  const renderFooterInfo = () => {
    if (isMarketplaceListing(trade)) {
      return (
        <span className="text-sm text-muted-foreground">
          Published: {formatDate(trade.created)}
        </span>
      );
    }

    if (isDashboardListing(trade)) {
      return (
        <span className="text-sm text-muted-foreground">ID: #{trade.id}</span>
      );
    }

    if (isEscrow(trade)) {
      return (
        <span className="text-sm text-muted-foreground">
          Created: {formatDate(trade.created)}
        </span>
      );
    }

    return null;
  };

  const renderActions = () => {
    if (!showActions || isMarketplaceListing(trade)) {
      return null;
    }

    return (
      <TradeActions
        trade={trade as DashboardListing | DashboardEscrow}
        onAction={onAction}
        onOpenDialog={onOpenDialog}
        showManage={
          isDashboardListing(trade) && !!trade.seller && trade.seller === address
        }
      />
    );
  };

  return (
    <Card className="card hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-fade-in">
      <CardContent className="p-0">
        <div className="p-6">
          <div
            className={`flex items-start justify-between ${
              isEscrow(trade) ? 'mb-6' : 'mb-4'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center mb-12">
                <TradeTypeBadge type={trade.type} className="mb-3" />
                <TokenIcon token={trade.token} size="lg" className="mt-2" />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <h3
                      className={`font-bold text-foreground ${
                        isMarketplaceListing(trade) ? 'text-3xl' : 'text-2xl'
                      }`}
                    >
                      {formatAmount(trade.amount)}
                    </h3>
                    <span
                      className={`font-semibold text-muted-foreground ${
                        isMarketplaceListing(trade) ? 'text-xl' : 'text-lg'
                      }`}
                    >
                      {trade.token}
                    </span>
                  </div>
                  {renderTradeDetails()}
                </div>

                {renderTraderInfo()}
              </div>
            </div>

            {renderRightSection()}
          </div>

          {isEscrow(trade) && showProgress && <TradeProgress escrow={trade} />}

          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isMarketplaceListing(trade)
                        ? 'bg-green-500'
                        : getStatusColor(trade.status)
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-muted-foreground capitalize">
                    {isMarketplaceListing(trade)
                      ? 'Active'
                      : trade.status.replace('_', ' ')}
                  </span>
                </div>
                {renderFooterInfo()}
              </div>

              {renderActions()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
