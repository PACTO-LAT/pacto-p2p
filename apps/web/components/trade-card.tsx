import { StatusBadge } from '@/components/status-badge';
import { TokenIcon } from '@/components/token-icon';
import { TradeActions } from '@/components/trade-actions';
import { TradeInfo } from '@/components/trade-info';
import { TradeProgress } from '@/components/trade-progress';
import { TradeTypeBadge } from '@/components/trade-type-badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  formatAmount,
  formatCurrency,
  formatDate,
  getStatusColor,
} from '@/lib/dashboard-utils';
import type { DashboardEscrow, DashboardListing } from '@/lib/types';

interface TradeCardProps {
  trade: DashboardListing | DashboardEscrow;
  onAction?: (
    trade: DashboardListing | DashboardEscrow,
    action: string
  ) => void;
  onOpenDialog?: (
    trade: DashboardListing | DashboardEscrow,
    type: 'receipt' | 'dispute'
  ) => void;
}

const isListing = (
  trade: DashboardListing | DashboardEscrow
): trade is DashboardListing => {
  return 'rate' in trade && 'fiatCurrency' in trade;
};

const isEscrow = (
  trade: DashboardListing | DashboardEscrow
): trade is DashboardEscrow => {
  return 'progress' in trade;
};

export function TradeCard({ trade, onAction, onOpenDialog }: TradeCardProps) {
  const renderRightSection = () => {
    if (isListing(trade)) {
      return (
        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={trade.status} />
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(trade.amount * trade.rate, trade.fiatCurrency)}
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

  const renderFooterInfo = () => {
    if (isListing(trade)) {
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

  return (
    <Card className="card hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-fade-in">
      <CardContent className="p-0">
        <div className="p-6">
          <div
            className={`flex items-start justify-between ${isEscrow(trade) ? 'mb-6' : 'mb-4'}`}
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <TradeTypeBadge type={trade.type} className="mb-3" />
                <TokenIcon token={trade.token} size="lg" />
              </div>

              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-foreground">
                    {formatAmount(trade.amount)}
                  </h3>
                  <span className="text-lg font-semibold text-muted-foreground">
                    {trade.token}
                  </span>
                </div>
                <TradeInfo trade={trade} />
              </div>
            </div>

            {renderRightSection()}
          </div>

          {isEscrow(trade) && <TradeProgress escrow={trade} />}

          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(trade.status)}`}
                  ></div>
                  <span className="text-sm font-medium text-muted-foreground capitalize">
                    {trade.status.replace('_', ' ')}
                  </span>
                </div>
                {renderFooterInfo()}
              </div>

              <TradeActions
                trade={trade}
                onAction={onAction}
                onOpenDialog={onOpenDialog}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
