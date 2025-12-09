import { formatDate } from '@/lib/dashboard-utils';
import type { DashboardEscrow, DashboardListing } from '@/lib/types';

interface TradeInfoProps {
  trade: DashboardListing | DashboardEscrow;
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

export function TradeInfo({ trade }: TradeInfoProps) {
  if (isListing(trade)) {
    return (
      <div className="space-y-1.5 sm:space-y-1 mt-1">
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <span className="font-medium">Rate:</span>{' '}
          <span className="break-words">
            {trade.rate} {trade.fiatCurrency}/{trade.token}
          </span>
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <span className="font-medium">Created:</span>{' '}
          <span className="break-words">{formatDate(trade.created)}</span>
        </p>
      </div>
    );
  }

  if (isEscrow(trade)) {
    return (
      <div className="space-y-1.5 sm:space-y-1 mt-1">
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <span className="font-medium">ID:</span>{' '}
          <span className="break-all font-mono">{trade.id}</span>
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <span className="font-medium">
            {trade.type === 'sell' ? 'Buyer' : 'Seller'}:
          </span>
        </p>
        <div className="mt-1">
          <span className="font-mono text-xs bg-muted/50 backdrop-blur-sm px-2 py-1 rounded break-all inline-block max-w-full">
            {trade.type === 'sell' ? trade.buyer : trade.seller}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
