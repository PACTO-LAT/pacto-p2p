import { AlertTriangle, ExternalLink, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DashboardEscrow, DashboardListing } from '@/lib/types';

interface TradeActionsProps {
  trade: DashboardListing | DashboardEscrow;
  onAction?: (
    trade: DashboardListing | DashboardEscrow,
    action: string
  ) => void;
  onOpenDialog?: (
    trade: DashboardListing | DashboardEscrow,
    type: 'receipt' | 'dispute'
  ) => void;
  showManage?: boolean;
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

export function TradeActions({
  trade,
  onAction,
  onOpenDialog,
  showManage,
}: TradeActionsProps) {
  if (isListing(trade)) {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="btn-emerald-outline"
          onClick={() => onAction?.(trade, 'view')}
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Details
        </Button>
        {showManage && (
          <Button
            size="sm"
            className="btn-emerald"
            onClick={() => onAction?.(trade, 'manage')}
          >
            Manage
          </Button>
        )}
      </div>
    );
  }

  if (isEscrow(trade)) {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="btn-emerald-outline"
          onClick={() => onAction?.(trade, 'view')}
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Details
        </Button>
        {trade.status === 'awaiting_payment' && trade.type === 'buy' && (
          <Button
            size="sm"
            className="btn-emerald"
            onClick={() => onOpenDialog?.(trade, 'receipt')}
          >
            <Upload className="w-4 h-4 mr-1" />
            Upload Receipt
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent border-red-200/50 text-red-600 hover:bg-red-50/50 backdrop-blur-sm"
          onClick={() => onOpenDialog?.(trade, 'dispute')}
        >
          <AlertTriangle className="w-4 h-4 mr-1" />
          Dispute
        </Button>
      </div>
    );
  }

  return null;
}
