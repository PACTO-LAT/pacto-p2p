import { StatusBadge } from '@/components/shared/StatusBadge';
import { TokenIcon } from '@/components/shared/TokenIcon';
import { TradeActions } from '@/components/shared/TradeActions';
import { TradeInfo } from '@/components/shared/TradeInfo';
import { TradeProgress } from '@/components/shared/TradeProgress';
import { TradeTypeBadge } from '@/components/shared/TradeTypeBadge';
import { Card, CardContent } from '@/components/ui/card';
import {
  formatAmount,
  formatCurrency,
  formatDate,
  getStatusColor,
} from '@/lib/dashboard-utils';
import type { DashboardEscrow, DashboardListing } from '@/lib/types';
import useGlobalAuthenticationStore from '@/store/wallet.store';

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
  const { address } = useGlobalAuthenticationStore();
  const renderRightSection = () => {
    if (isListing(trade)) {
      return (
        <div className="flex flex-col items-start gap-2 sm:gap-3 text-left lg:items-end lg:text-right w-full lg:w-auto">
          <StatusBadge status={trade.status} />
          <div className="text-left lg:text-right">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Value</p>
            <p className="text-lg sm:text-xl font-bold text-foreground leading-tight">
              {formatCurrency(trade.amount * trade.rate, trade.fiatCurrency)}
            </p>
          </div>
        </div>
      );
    }

    if (isEscrow(trade)) {
      return (
        <div className="flex flex-col items-start gap-2 sm:gap-3 text-left lg:items-end lg:text-right w-full lg:w-auto">
          <StatusBadge status={trade.status} />
          <div className="text-left lg:text-right">
            <p className="text-xs sm:text-sm text-muted-foreground">Progress</p>
            <p className="text-lg sm:text-xl font-bold text-foreground leading-tight">
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
    <Card className="card hover:shadow-2xl hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 animate-fade-in">
      <CardContent className="p-0">
        <div className="p-4 sm:p-5 lg:p-6">
          <div
            className={`flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between ${isEscrow(trade) ? 'mb-4 sm:mb-6' : 'mb-3 sm:mb-4'}`}
          >
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="flex flex-col items-center flex-shrink-0">
                <TradeTypeBadge type={trade.type} className="mb-2 sm:mb-3" />
                <TokenIcon token={trade.token} size="lg" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2 mb-1.5 sm:mb-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-tight break-words">
                    {formatAmount(trade.amount)}
                  </h3>
                  <span className="text-base sm:text-lg font-semibold text-muted-foreground">
                    {trade.token}
                  </span>
                </div>
                <TradeInfo trade={trade} />
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 rounded-lg bg-muted/30 p-3 sm:p-4 lg:w-auto lg:items-end lg:bg-transparent lg:p-0 border-t border-border/30 lg:border-0 pt-4 lg:pt-0">
              {renderRightSection()}
            </div>
          </div>

          {isEscrow(trade) && <TradeProgress escrow={trade} />}

          <div className="border-t border-border/50 pt-3 sm:pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${getStatusColor(trade.status)}`}
                  ></div>
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground capitalize truncate">
                    {trade.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground/80 truncate">
                  {renderFooterInfo()}
                </div>
              </div>

              <TradeActions
                trade={trade}
                onAction={onAction}
                onOpenDialog={onOpenDialog}
                showManage={
                  isListing(trade) && !!trade.seller && trade.seller === address
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
