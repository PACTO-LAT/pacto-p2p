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
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Rate:</span> {trade.rate}{' '}
          {trade.fiatCurrency}/{trade.token}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Created:</span>{' '}
          {formatDate(trade.created)}
        </p>
      </div>
    );
  }

  if (isEscrow(trade)) {
    return (
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">ID:</span> {trade.id}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">
            {trade.type === 'sell' ? 'Buyer' : 'Seller'}:
          </span>{' '}
          <span className="font-mono text-xs bg-muted/50 backdrop-blur-sm px-2 py-1 rounded">
            {trade.type === 'sell' ? trade.buyer : trade.seller}
          </span>
        </p>
      </div>
    );
  }

  return null;
}
