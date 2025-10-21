import { BaseTradeCard } from '@/components/shared/BaseTradeCard';
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

export function TradeCard({ trade, onAction, onOpenDialog }: TradeCardProps) {
  const isEscrow = 'progress' in trade;
  
  return (
    <BaseTradeCard
      trade={trade}
      variant={isEscrow ? 'escrow' : 'dashboard'}
      onAction={onAction}
      onOpenDialog={onOpenDialog}
      showActions={true}
      showProgress={isEscrow}
    />
  );
}
